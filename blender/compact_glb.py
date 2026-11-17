"""
Shrinks a .glb after Blender exports it, without changing how it looks:
KHR_mesh_quantization stores normals as bytes (4 bytes a vertex instead of
12) and texture coordinates as 16-bit (4 instead of 8). three.js's
GLTFLoader reads these natively, with no decoder to download. Positions,
indices, node transforms and names are left exactly as they were.

Plain Python (no bpy), so it also runs on its own:
    python3 blender/compact_glb.py public/desk/desk.glb
"""

import json
import math
import struct
import sys

FLOAT, BYTE, UNSIGNED_SHORT = 5126, 5120, 5123
ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER = 34962, 34963
EXT = "KHR_mesh_quantization"
COMPONENTS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}
SIZES = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}


def _read(glb):
    magic, _version, _length = struct.unpack_from("<III", glb, 0)
    assert magic == 0x46546C67, "not a glb"
    json_len, _ = struct.unpack_from("<II", glb, 12)
    doc = json.loads(glb[20 : 20 + json_len])
    bin_len, _ = struct.unpack_from("<II", glb, 20 + json_len)
    data = glb[28 + json_len : 28 + json_len + bin_len]
    return doc, data


def _write(doc, data):
    text = json.dumps(doc, separators=(",", ":")).encode()
    text += b" " * (-len(text) % 4)
    data += b"\0" * (-len(data) % 4)
    total = 12 + 8 + len(text) + 8 + len(data)
    return (
        struct.pack("<III", 0x46546C67, 2, total)
        + struct.pack("<II", len(text), 0x4E4F534A) + text
        + struct.pack("<II", len(data), 0x004E4942) + data
    )


def _floats(doc, data, index):
    acc = doc["accessors"][index]
    view = doc["bufferViews"][acc["bufferView"]]
    n = COMPONENTS[acc["type"]]
    stride = view.get("byteStride") or n * 4
    start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
    return [struct.unpack_from(f"<{n}f", data, start + i * stride) for i in range(acc["count"])]


def compact(path):
    with open(path, "rb") as f:
        doc, data = _read(f.read())
    encoded = {}  # accessor index -> (bytes, componentType, normalized, stride)
    for mesh in doc.get("meshes", []):
        for prim in mesh["primitives"]:
            for name, index in prim["attributes"].items():
                acc = doc["accessors"][index]
                if index in encoded or acc["componentType"] != FLOAT or "sparse" in acc:
                    continue
                if name == "NORMAL" and acc["type"] == "VEC3":
                    out = bytearray()
                    for x, y, z in _floats(doc, data, index):
                        length = math.sqrt(x * x + y * y + z * z) or 1.0
                        out += struct.pack("<bbbx", *(max(-127, min(127, round(c / length * 127))) for c in (x, y, z)))
                    encoded[index] = (bytes(out), BYTE, True, 4)
                elif name.startswith("TEXCOORD_") and acc["type"] == "VEC2":
                    uvs = _floats(doc, data, index)
                    if all(0.0 <= c <= 1.0 for uv in uvs for c in uv):
                        out = b"".join(struct.pack("<HH", round(u * 65535), round(v * 65535)) for u, v in uvs)
                        encoded[index] = (out, UNSIGNED_SHORT, True, 4)
    if not encoded:
        return

    # rebuild the binary chunk: accessors packed into a few shared views (one per
    # kind of data and stride), each accessor 4-byte aligned
    targets = {}
    for mesh in doc.get("meshes", []):
        for prim in mesh["primitives"]:
            for index in prim["attributes"].values():
                targets[index] = ARRAY_BUFFER
            if "indices" in prim:
                targets[prim["indices"]] = ELEMENT_ARRAY_BUFFER
    groups = {}  # (target, stride) -> [(index, bytes)]
    for index, acc in enumerate(doc["accessors"]):
        if index in encoded:
            chunk, component, normalized, stride = encoded[index]
            acc["componentType"] = component
            acc["normalized"] = normalized
            acc.pop("min", None)
            acc.pop("max", None)
        else:
            view = doc["bufferViews"][acc["bufferView"]]
            size = SIZES[acc["componentType"]] * COMPONENTS[acc["type"]]
            stride = view.get("byteStride") or size
            start = view.get("byteOffset", 0) + acc.get("byteOffset", 0)
            if stride == size:
                chunk = data[start : start + size * acc["count"]]
            else:
                chunk = b"".join(data[start + i * stride : start + i * stride + size] for i in range(acc["count"]))
            stride = size
        target = targets.get(index)
        # vertex data whose elements aren't 4-byte multiples needs an explicit stride
        key = (target, stride if target == ARRAY_BUFFER and (index in encoded or stride % 4) else None)
        groups.setdefault(key, []).append((index, chunk))
    out = bytearray()
    views = []
    for (target, stride), items in groups.items():
        out += b"\0" * (-len(out) % 4)
        view = {"buffer": 0, "byteOffset": len(out)}
        if target:
            view["target"] = target
        if stride:
            view["byteStride"] = stride
        start = len(out)
        for index, chunk in items:
            out += b"\0" * (-len(out) % 4)
            acc = doc["accessors"][index]
            acc["bufferView"] = len(views)
            acc["byteOffset"] = len(out) - start
            if not acc["byteOffset"]:
                del acc["byteOffset"]
            out += chunk
        view["byteLength"] = len(out) - start
        views.append(view)
    # bounds rounded outward, so they still contain every vertex
    for acc in doc["accessors"]:
        if "min" in acc:
            acc["min"] = [math.floor(v * 1e6) / 1e6 for v in acc["min"]] if acc["componentType"] == FLOAT else acc["min"]
            acc["max"] = [math.ceil(v * 1e6) / 1e6 for v in acc["max"]] if acc["componentType"] == FLOAT else acc["max"]
    # (images or other views not used by accessors would be lost; these models have none)
    assert not doc.get("images"), "compact_glb doesn't handle embedded images"
    doc["bufferViews"] = views
    doc["buffers"] = [{"byteLength": len(out) + (-len(out) % 4)}]
    for key in ("extensionsUsed", "extensionsRequired"):
        doc[key] = sorted(set(doc.get(key, [])) | {EXT})
    before = len(data)
    with open(path, "wb") as f:
        f.write(_write(doc, bytes(out)))
    print(f"[compact] {path}: {before // 1024} KB -> {len(out) // 1024} KB of geometry")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        compact(p)
