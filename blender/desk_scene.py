"""
Builds the home-page hero scene and exports it to public/desk/desk.glb:

- `Case`: the light-blue 2000s pencil case. A hollow body plus a hinged lid
  (`CaseLid`, pivot on the back edge) with two strips of label tape (`CaseTape`).
- `Item_<id>`: miniature parts packed inside the case. Each is one page of the
  site (see components/desk/items.ts). Their exported positions are their
  "home" spots inside the case.
- A cozy software-engineering desk around it: cutting mat, keyboard, monitor,
  architect's lamp, triangular scale ruler, books, mug, plant, sticky note.

Run from the repo root:
    npm run models
    # or: blender -b --python blender/desk_scene.py

Materials are named placeholders ("roles"); components/desk/look.ts swaps in
the real three.js materials by name, so keep material names stable.

Blender is Z-up with the desk top at z = 0; the glTF exporter converts to
three.js' Y-up (Blender -Y, toward the viewer, becomes three.js +Z).
"""

import math
import os

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_FILE = os.path.join(ROOT, "public", "desk", "desk.glb")

# bevel: multiplier on each part's bevel width, segs: bevel segments,
# cyl: vertices on round parts
V = dict(bevel=1.0, segs=2, cyl=24)

# Fallback colours (used only if a role isn't restyled in three.js).
PALETTE = {
    # pencil case
    "case_body": "#6cc2f7", "case_lid": "#94d5fb", "case_button_a": "#ffd84a", "case_button_b": "#ff7eb6",
    "case_sharpener": "#e8eef2", "case_hole": "#2a2f36", "case_hinge": "#6fb3db", "label_1": "#c4161c",
    "label_2": "#c4161c",
    # items
    "pcb_green": "#1f6b45", "pcb_blue": "#2552a8", "chip_black": "#15181a", "chip_silver": "#d9dde2",
    "gold": "#d9ab4c", "plastic_white": "#f1f2ef", "led_red": "#ff4a3d", "cam_body": "#f4f3ef",
    "cam_lens": "#1d2022", "glass": "#3a6ea8", "print": "#ffffff", "chrome": "#c9cfd4", "plate_black": "#202325",
    "card": "#fafafa", "card_face": "#ffffff", "note": "#fffdf6", "note_face": "#ffffff", "pick": "#f2a93b",
    # desk
    "desk_wood": "#c89a6a", "mat": "#2c6b66", "kb_case": "#3a3836", "kb_key": "#ece6da", "kb_accent": "#6cc2f7",
    "monitor": "#1c1d1f", "screen": "#111418", "lamp": "#efe9dc", "lamp_joint": "#b9bec4", "lamp_bulb": "#fff2d6",
    "mug": "#9fb8a3", "coffee": "#3b2416", "pot": "#c56f4a", "soil": "#3a2a1e", "leaf": "#4f7d4a",
    "book_1": "#2f4a6b", "book_2": "#c9b28a", "book_3": "#8a3b32", "scale_ruler": "#d6d9dc",
    "sticky": "#ffe873", "sticky_face": "#ffffff",
}

_materials = {}


# --------------------------------------------------------------------------- helpers

def hex_to_rgba(value):
    value = value.lstrip("#")
    r, g, b = (int(value[i : i + 2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def mat(name):
    if name not in _materials:
        m = bpy.data.materials.new(name)
        m.diffuse_color = hex_to_rgba(PALETTE[name])
        bsdf = m.node_tree.nodes.get("Principled BSDF") if m.node_tree else None
        if bsdf:
            bsdf.inputs["Base Color"].default_value = hex_to_rgba(PALETTE[name])
        _materials[name] = m
    return _materials[name]


def select_only(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def shade(obj, smooth=True):
    select_only(obj)
    if not smooth:
        bpy.ops.object.shade_flat()
        return
    try:
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    except Exception:
        bpy.ops.object.shade_smooth()


def finish(obj, name, material, parent=None):
    obj.name = name
    obj.data.name = name
    obj.data.materials.clear()
    obj.data.materials.append(mat(material))
    if parent is not None:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj


def empty(name, location=(0, 0, 0), parent=None):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=location)
    obj = bpy.context.active_object
    obj.name = name
    if parent is not None:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj


def bevel(obj, width, segments=None, affect="EDGES"):
    select_only(obj)
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments or V["segs"]
    mod.affect = affect
    mod.limit_method = "NONE"
    bpy.ops.object.modifier_apply(modifier=mod.name)


def box(name, size, location, material, bevel_w=0.0, rotation=(0, 0, 0), parent=None, segments=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.scale = size
    select_only(obj)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel_w > 0:
        bevel(obj, min(bevel_w * V["bevel"], min(size) / 2 * 0.97), segments)
    obj.rotation_euler = rotation
    shade(obj)
    return finish(obj, name, material, parent)


def plane(name, size, location, material, rotation=(0, 0, 0), parent=None):
    bpy.ops.mesh.primitive_plane_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.scale = (size[0], size[1], 1)
    select_only(obj)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler = rotation
    shade(obj, smooth=False)
    return finish(obj, name, material, parent)


def cylinder(name, radius, depth, location, material, rotation=(0, 0, 0), vertices=None, parent=None, bevel_w=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices or V["cyl"], radius=radius, depth=depth, location=location)
    obj = bpy.context.active_object
    if bevel_w > 0:
        bevel(obj, min(bevel_w, radius * 0.45, depth * 0.45))
    obj.rotation_euler = rotation
    shade(obj)
    return finish(obj, name, material, parent)


def between(name, a, b, radius, material, parent=None, vertices=None):
    """Cylinder from point a to point b."""
    a, b = Vector(a), Vector(b)
    d = b - a
    obj = cylinder(name, radius, d.length, (a + b) / 2, material, vertices=vertices or 16, parent=None)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = d.to_track_quat("Z", "Y")
    if parent is not None:
        obj.parent = parent
        obj.matrix_parent_inverse = parent.matrix_world.inverted()
    return obj


def along_x(obj, spin_deg=0.0):
    """Bake a Z-axis primitive so its axis points along +X."""
    select_only(obj)
    obj.rotation_euler = (0, 0, math.radians(spin_deg))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    obj.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return obj


# --------------------------------------------------------------------------- pencil case

MAT_TOP = 0.002  # cutting-mat surface; the case and items sit on it
CX, CY = 0.0, -0.02  # case centre (three.js: x = 0, z = +0.02)
L, W, HB, HL, GAP = 0.24, 0.10, 0.034, 0.012, 0.0012
WALL = 0.006
FLOOR = MAT_TOP + 0.004  # inside floor of the case

# Embossed tape. Keep LABEL_LENGTHS in sync with LABEL_STRIPS in components/desk/textures.ts.
TAPE_H = 0.016
LABEL_LENGTHS = (0.152, 0.162)


def tape(name, index, location, rotation, parent, curl=0.0022):
    length = LABEL_LENGTHS[index]
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=28, y_subdivisions=1, size=1)
    obj = bpy.context.active_object
    obj.scale = (length, TAPE_H, 1)
    select_only(obj)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for v in obj.data.vertices:
        t = abs(v.co.x) / (length / 2)
        v.co.z = curl * t ** 4
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = 0.0004
    mod.offset = 1
    bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.location = location
    obj.rotation_euler = rotation
    shade(obj)
    return finish(obj, name, f"label_{index + 1}", parent)


def build_case():
    case = empty("Case", (CX, CY, MAT_TOP))

    # hollow body: rounded box minus an inner box
    body = box("CaseBody", (L, W, HB), (CX, CY, MAT_TOP + HB / 2), "case_body", bevel_w=0.006)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(CX, CY, FLOOR + HB / 2))
    cutter = bpy.context.active_object
    cutter.scale = (L - 2 * WALL, W - 2 * WALL, HB)
    select_only(cutter)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel(cutter, 0.004)
    mod = body.modifiers.new("Hollow", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    select_only(body)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    shade(body)
    body.parent = case
    body.matrix_parent_inverse = case.matrix_world.inverted()

    front = CY - W / 2
    for i, (x, m) in enumerate(((-0.07, "case_button_a"), (0.0, "case_button_b"), (0.07, "case_button_a"))):
        box(f"CaseButton{i}", (0.026, 0.008, 0.013), (CX + x, front - 0.002, MAT_TOP + HB * 0.5), m, bevel_w=0.003, parent=case)

    right = CX + L / 2
    box("CaseSharpener", (0.014, 0.034, 0.024), (right + 0.004, CY - 0.016, MAT_TOP + 0.016), "case_sharpener", bevel_w=0.003, parent=case)
    hole = cylinder("CaseSharpenerHole", 0.0052, 0.004, (0, 0, 0), "case_hole", vertices=14)
    along_x(hole)
    hole.location = (right + 0.0095, CY - 0.016, MAT_TOP + 0.016)
    finish(hole, "CaseSharpenerHole", "case_hole", case)

    # lid on a hinge along the back top edge; three.js rotates CaseLid about X to open it
    hinge_y = CY + W / 2
    hinge_z = MAT_TOP + HB + GAP
    lid = empty("CaseLid", (CX, hinge_y, hinge_z), parent=case)
    box("CaseLidShell", (L + 0.002, W + 0.002, HL), (CX, CY, hinge_z + HL / 2), "case_lid", bevel_w=0.006, parent=lid)
    top = hinge_z + HL
    tape_group = empty("CaseTape", (CX, CY, top), parent=lid)
    tape("CaseTape1", 0, (CX - 0.008, CY + 0.013, top + 0.0003), (0, 0, math.radians(-2.2)), tape_group)
    tape("CaseTape2", 1, (CX + 0.002, CY - 0.013, top + 0.0003), (0, 0, math.radians(1.4)), tape_group)
    hinge = cylinder("CaseHinge", 0.0032, L * 0.9, (0, 0, 0), "case_hinge", vertices=14)
    along_x(hinge)
    hinge.location = (CX, hinge_y + 0.0008, MAT_TOP + HB + GAP / 2)
    finish(hinge, "CaseHinge", "case_hinge", case)


# --------------------------------------------------------------------------- items (miniatures)

def item(name, x, y, rot_deg=0.0):
    """Item group with its origin on the case floor; children are built around (0, 0, 0)."""
    group = empty(f"Item_{name}", (0, 0, 0))
    return group, (CX + x, CY + y, FLOOR + 0.0004), rot_deg


def place(group, location, rot_deg):
    group.location = location
    group.rotation_euler = (0, 0, math.radians(rot_deg))


def build_items():
    # back row (+y) and front row (-y) inside the case
    g, at, r = item("sunstang", -0.075, 0.019, -2)
    box("SunstangBoard", (0.062, 0.04, 0.0016), (0, 0, 0.0008), "pcb_green", bevel_w=0.001, parent=g)
    box("SunstangMcu", (0.014, 0.014, 0.0025), (-0.012, 0.004, 0.0028), "chip_black", bevel_w=0.0004, parent=g)
    box("SunstangCan", (0.008, 0.006, 0.002), (0.012, -0.01, 0.0026), "chip_black", bevel_w=0.0003, parent=g)
    box("SunstangReg", (0.009, 0.009, 0.003), (0.016, 0.009, 0.003), "chip_black", bevel_w=0.0004, parent=g)
    box("SunstangHeader", (0.026, 0.004, 0.0035), (-0.006, -0.015, 0.0034), "plastic_white", bevel_w=0.0004, parent=g)
    for i in range(6):
        cylinder(f"SunstangPin{i}", 0.0006, 0.004, (-0.0165 + i * 0.0042, -0.015, 0.0062), "gold", vertices=8, parent=g)
    place(g, at, r)

    g, at, r = item("fsm", -0.075, -0.021, 3)
    box("FsmBoard", (0.058, 0.038, 0.0016), (0, 0, 0.0008), "pcb_blue", bevel_w=0.001, parent=g)
    box("FsmChip", (0.015, 0.015, 0.0022), (0.008, 0.004, 0.0027), "chip_silver", bevel_w=0.0004, parent=g)
    for i in range(4):
        box(f"FsmSwitch{i}", (0.0035, 0.007, 0.003), (-0.02 + i * 0.006, -0.011, 0.003), "plastic_white", bevel_w=0.0005, parent=g)
        cylinder(f"FsmLed{i}", 0.0012, 0.0016, (-0.02 + i * 0.006, -0.002, 0.0024), "led_red", vertices=10, parent=g)
    place(g, at, r)

    g, at, r = item("tiny", -0.02, 0.018, 4)
    box("TinyBody", (0.036, 0.026, 0.022), (0, 0, 0.011), "cam_body", bevel_w=0.004, parent=g)
    lens = cylinder("TinyLens", 0.007, 0.006, (0, 0, 0), "cam_lens", vertices=24)
    lens.rotation_euler = (math.radians(90), 0, 0)
    lens.location = (0.004, -0.015, 0.011)
    finish(lens, "TinyLens", "cam_lens", g)
    glass = cylinder("TinyGlass", 0.0048, 0.001, (0, 0, 0), "glass", vertices=24)
    glass.rotation_euler = (math.radians(90), 0, 0)
    glass.location = (0.004, -0.0182, 0.011)
    finish(glass, "TinyGlass", "glass", g)
    plane("TinyPrint", (0.018, 0.022), (-0.004, 0.006, 0.0225), "print", rotation=(math.radians(-14), 0, 0), parent=g)
    place(g, at, r)

    g, at, r = item("squat", 0.002, -0.024, 0)
    bar = cylinder("SquatBar", 0.0014, 0.072, (0, 0, 0), "chrome", vertices=12)
    along_x(bar)
    bar.location = (0, 0, 0.0095)
    finish(bar, "SquatBar", "chrome", g)
    for i, x in enumerate((-0.026, 0.026)):
        plate = cylinder(f"SquatPlate{i}", 0.0095, 0.004, (0, 0, 0), "plate_black", vertices=20, bevel_w=0.0008)
        along_x(plate)
        plate.location = (x, 0, 0.0095)
        finish(plate, f"SquatPlate{i}", "plate_black", g)
        collar = cylinder(f"SquatCollar{i}", 0.0026, 0.003, (0, 0, 0), "chrome", vertices=12)
        along_x(collar)
        collar.location = (x - math.copysign(0.0035, x), 0, 0.0095)
        finish(collar, f"SquatCollar{i}", "chrome", g)
    place(g, at, r)

    g, at, r = item("music", 0.03, 0.021, 18)
    pick = cylinder("MusicPick", 0.012, 0.0012, (0, 0, 0.0006), "pick", vertices=3)
    bevel(pick, 0.0055, segments=6, affect="VERTICES")
    shade(pick)
    finish(pick, "MusicPick", "pick", g)
    place(g, at, r)

    g, at, r = item("about", 0.073, 0.019, -6)
    box("AboutCard", (0.054, 0.034, 0.0008), (0, 0, 0.0004), "card", bevel_w=0.0003, parent=g)
    plane("AboutCardFace", (0.054, 0.034), (0, 0, 0.00085), "card_face", parent=g)
    place(g, at, r)

    g, at, r = item("blog", 0.075, -0.021, 5)
    box("BlogNote", (0.042, 0.032, 0.0006), (0, 0, 0.0003), "note", parent=g)
    plane("BlogNoteFace", (0.042, 0.032), (0, 0, 0.00065), "note_face", parent=g)
    place(g, at, r)


# --------------------------------------------------------------------------- desk environment

def build_desk():
    env = empty("Desk")
    # large enough that the full-window camera never sees past its edges
    box("DeskTop", (2.4, 1.4, 0.03), (0, 0.05, -0.015), "desk_wood", bevel_w=0.004, parent=env)
    box("CuttingMat", (0.6, 0.45, 0.002), (0, -0.02, 0.001), "mat", bevel_w=0.0008, parent=env)

    # keyboard behind the mat
    kb = empty("Keyboard", (0.02, 0.3, 0), parent=env)
    box("KeyboardCase", (0.36, 0.12, 0.022), (0.02, 0.3, 0.011), "kb_case", bevel_w=0.006, parent=kb)
    pitch = 0.0225
    for row in range(5):
        for col in range(15):
            accent = (row, col) in ((0, 0), (2, 14), (3, 14))
            w = 0.019
            box(f"Key{row}_{col}", (w, 0.018, 0.008), (0.02 - 0.157 + col * pitch, 0.3 + 0.045 - row * pitch, 0.026),
                "kb_accent" if accent else "kb_key", bevel_w=0.002, parent=kb, segments=1)
    kb.rotation_euler = (0, 0, math.radians(-2))

    # monitor at the back, screen facing the viewer
    box("MonitorFoot", (0.22, 0.15, 0.008), (0.02, 0.56, 0.004), "monitor", bevel_w=0.004, parent=env)
    box("MonitorNeck", (0.045, 0.03, 0.2), (0.02, 0.6, 0.1), "monitor", bevel_w=0.006, parent=env)
    box("MonitorBody", (0.62, 0.028, 0.37), (0.02, 0.585, 0.28), "monitor", bevel_w=0.008, parent=env)
    plane("MonitorScreen", (0.6, 0.35), (0.02, 0.5705, 0.28), "screen", rotation=(math.radians(90), 0, 0), parent=env)

    # architect's swing-arm lamp, head aimed at the mat
    base = (-0.47, 0.28, 0.0)
    elbow = (-0.44, 0.16, 0.36)
    head = (-0.22, 0.04, 0.33)
    target = Vector((-0.1, -0.04, 0.0))
    cylinder("LampBase", 0.065, 0.018, (base[0], base[1], 0.009), "lamp", vertices=28, bevel_w=0.004, parent=env)
    between("LampArmLower", (base[0], base[1], 0.018), elbow, 0.006, "lamp", parent=env)
    between("LampArmUpper", elbow, head, 0.006, "lamp", parent=env)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.011, location=elbow, segments=16, ring_count=8)
    finish(bpy.context.active_object, "LampElbow", "lamp_joint", env)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.055, radius2=0.022, depth=0.08, location=head)
    shade_head = bpy.context.active_object
    shade_head.rotation_mode = "QUATERNION"
    shade_head.rotation_quaternion = (target - Vector(head)).to_track_quat("-Z", "Y")
    mod = shade_head.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = 0.002
    select_only(shade_head)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    shade(shade_head)
    finish(shade_head, "LampShade", "lamp", env)
    bulb_at = Vector(head) + (target - Vector(head)).normalized() * 0.02
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.014, location=bulb_at, segments=16, ring_count=8)
    finish(bpy.context.active_object, "LampBulb", "lamp_bulb", env)
    empty("LampLight", tuple(bulb_at), parent=env)
    empty("LampTarget", tuple(target), parent=env)

    # mug
    cylinder("Mug", 0.04, 0.09, (0.4, 0.1, 0.045), "mug", vertices=32, bevel_w=0.003, parent=env)
    cylinder("Coffee", 0.036, 0.002, (0.4, 0.1, 0.082), "coffee", vertices=32, parent=env)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.024, minor_radius=0.006, major_segments=24, minor_segments=8, location=(0.442, 0.1, 0.048),
                                     rotation=(math.radians(90), 0, 0))
    shade(bpy.context.active_object)
    finish(bpy.context.active_object, "MugHandle", "mug", env)

    # plant
    cylinder("Pot", 0.06, 0.1, (-0.6, 0.48, 0.05), "pot", vertices=24, bevel_w=0.004, parent=env)
    cylinder("Soil", 0.055, 0.004, (-0.6, 0.48, 0.096), "soil", vertices=32, parent=env)
    for i in range(9):
        a = i * 2.4
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.045,
                                              location=(-0.6 + math.cos(a) * 0.035, 0.48 + math.sin(a) * 0.035, 0.13 + (i % 3) * 0.03))
        leaf = bpy.context.active_object
        leaf.scale = (1.0, 0.45, 0.18)
        leaf.rotation_euler = (math.radians(25), 0, a)
        shade(leaf)
        finish(leaf, f"Leaf{i}", "leaf", env)

    # textbooks
    for i, (role, z, rot) in enumerate((("book_1", 0.015, 4), ("book_2", 0.045, -3), ("book_3", 0.073, 9))):
        box(f"Book{i}", (0.24, 0.17, 0.028 if i != 1 else 0.032), (0.58, 0.45, z), role, bevel_w=0.003,
            rotation=(0, 0, math.radians(rot)), parent=env)

    # triangular architect's scale ruler along the front of the mat
    ruler = cylinder("ScaleRuler", 0.013, 0.3, (0, 0, 0), "scale_ruler", vertices=3)
    along_x(ruler, spin_deg=30)
    ruler.location = (0.03, -0.205, 0.013)
    ruler.rotation_euler = (0, 0, math.radians(-3))
    finish(ruler, "ScaleRuler", "scale_ruler", env)

    # sticky note on the desk
    box("Sticky", (0.076, 0.076, 0.003), (0.41, -0.13, 0.0015), "sticky", rotation=(0, 0, math.radians(8)), parent=env)
    plane("StickyFace", (0.076, 0.076), (0.41, -0.13, 0.0031), "sticky_face", rotation=(0, 0, math.radians(8)), parent=env)


# --------------------------------------------------------------------------- main

def build_and_export():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_desk()
    build_case()
    build_items()
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUT_FILE,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"[desk_scene] wrote {OUT_FILE}")


if __name__ == "__main__":
    build_and_export()
