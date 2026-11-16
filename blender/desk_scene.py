"""
Builds the home-page hero scene and exports it to public/desk/desk.glb:

- `Case`: a 2000s multi-function pencil case in light blue: a hollow body
  with a white trim, pop buttons and a latch on the front, a sliding
  sharpener drawer on the side, a divider inside, and a hinged lid
  (`CaseLid`, pivot on the back edge) with a strip of label tape
  (`CaseTape`), four die-cut stickers (`Sticker_<id>`, see
  content/stickers.ts) and a sticky note stuck inside it (`StickyNote`).
- `Item_<id>`: miniature parts packed inside the case. Each is one page of the
  site (see components/desk/items.ts). Their exported positions are their
  "home" spots inside the case. The two circuit boards come from boards.py.
- A cozy software-engineering desk around it: cutting mat, a 65% keyboard
  (`Key_<KeyboardEvent.code>` per key), the monitor (`Monitor`, the terminal),
  architect's lamp, books, mug, plant, and a wall with a note (`WallNote`).

Run from the repo root:
    npm run models        (build_all.py: this scene plus the two board models)
    # or: blender -b --python blender/desk_scene.py

Materials are named placeholders ("roles"); components/desk/look.ts swaps in
the real three.js materials by name, so keep material names stable.

Blender is Z-up with the desk top at z = 0; the glTF exporter converts to
three.js' Y-up (Blender -Y, toward the viewer, becomes three.js +Z).
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mathutils import Vector  # noqa: E402

import bpy  # noqa: E402
from boards import build_de1soc, build_vcu  # noqa: E402
from common import along_x, between, bevel, box, cylinder, empty, export_glb, finish, plane, reset, select_only, shade  # noqa: E402

# --------------------------------------------------------------------------- pencil case

MAT_TOP = 0.002  # cutting-mat surface; the case and items sit on it
CX, CY = 0.0, -0.02  # case centre (three.js: x = 0, z = +0.02)
L, W, HB, HL, GAP = 0.24, 0.10, 0.036, 0.013, 0.0012
WALL = 0.006
FLOOR = MAT_TOP + 0.004  # inside floor of the case

# Embossed tape. Keep LABEL_LENGTHS in sync with LABEL_STRIPS in components/desk/textures.ts.
TAPE_H = 0.016
LABEL_LENGTHS = (0.152,)

# Stickers on the lid: (id, x, y, width, tilt in degrees); the height follows the PNG.
# Qualcomm is the big one. Keep ids in sync with content/stickers.ts.
STICKERS = (
    ("qualcomm", -0.072, 0.02, 0.084, -4),
    ("western", -0.008, 0.021, 0.03, 5),
    ("sunstang", 0.04, 0.018, 0.05, -3),
    ("interninsider", 0.092, 0.021, 0.03, 8),
)
STICKER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "desk", "stickers")


def png_aspect(path):
    """Height over width, read from the PNG header."""
    with open(path, "rb") as f:
        head = f.read(24)
    w, h = int.from_bytes(head[16:20], "big"), int.from_bytes(head[20:24], "big")
    return h / w


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


def hollow_box(name, size, location, material, wall, bevel_w, inner_bevel, parent, floor):
    """A rounded box with its inside cut out down to `floor` (absolute z)."""
    body = box(name, size, location, material, bevel_w=bevel_w)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(location[0], location[1], floor + size[2] / 2))
    cutter = bpy.context.active_object
    cutter.scale = (size[0] - 2 * wall, size[1] - 2 * wall, size[2])
    select_only(cutter)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel(cutter, inner_bevel)
    mod = body.modifiers.new("Hollow", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = cutter
    select_only(body)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(cutter, do_unlink=True)
    shade(body)
    body.parent = parent
    body.matrix_parent_inverse = parent.matrix_world.inverted()
    return body


def build_case():
    case = empty("Case", (CX, CY, MAT_TOP))

    # body: a hollow rounded box with a white trim band around its rim
    hollow_box("CaseBody", (L, W, HB), (CX, CY, MAT_TOP + HB / 2), "case_body", WALL, 0.007, 0.004, case, FLOOR)
    rim_z = MAT_TOP + HB - 0.004
    t = 0.0045
    box("CaseTrimFront", (L + 0.003, t, 0.006), (CX, CY - W / 2 - 0.0005, rim_z), "case_trim", bevel_w=0.0015, parent=case)
    box("CaseTrimBack", (L + 0.003, t, 0.006), (CX, CY + W / 2 + 0.0005, rim_z), "case_trim", bevel_w=0.0015, parent=case)
    box("CaseTrimLeft", (t, W + 0.003, 0.006), (CX - L / 2 - 0.0005, CY, rim_z), "case_trim", bevel_w=0.0015, parent=case)
    box("CaseTrimRight", (t, W + 0.003, 0.006), (CX + L / 2 + 0.0005, CY, rim_z), "case_trim", bevel_w=0.0015, parent=case)
    # a low divider inside: back row and front row
    box("CaseDivider", (L - 2 * WALL - 0.004, 0.0024, 0.011), (CX, CY, FLOOR + 0.0055), "case_trim", bevel_w=0.0006, parent=case)

    # front: the latch in the middle and a round pop button either side
    front = CY - W / 2
    box("CaseLatch", (0.034, 0.007, 0.014), (CX, front - 0.0025, MAT_TOP + HB * 0.5), "case_button_b", bevel_w=0.003, parent=case)
    box("CaseLatchLip", (0.02, 0.004, 0.004), (CX, front - 0.006, MAT_TOP + HB * 0.5 + 0.003), "case_trim", bevel_w=0.0012, parent=case)
    for i, x in enumerate((-0.075, 0.075)):
        b = cylinder(f"CaseButton{i}", 0.0075, 0.007, (0, 0, 0), "case_button_a", vertices=24, bevel_w=0.0015)
        b.rotation_euler = (math.radians(90), 0, 0)
        b.location = (CX + x, front - 0.0025, MAT_TOP + HB * 0.5)
        finish(b, f"CaseButton{i}", "case_button_a", case)
        r = cylinder(f"CaseButtonRing{i}", 0.0095, 0.002, (0, 0, 0), "case_trim", vertices=24)
        r.rotation_euler = (math.radians(90), 0, 0)
        r.location = (CX + x, front - 0.0005, MAT_TOP + HB * 0.5)
        finish(r, f"CaseButtonRing{i}", "case_trim", case)

    # right side: the sliding sharpener drawer, with a finger notch and the sharpener hole
    right = CX + L / 2
    drawer = empty("CaseDrawer", (right, CY - 0.014, MAT_TOP + 0.015), parent=case)
    box("CaseDrawerBody", (0.012, 0.036, 0.026), (right + 0.0045, CY - 0.014, MAT_TOP + 0.015), "case_drawer", bevel_w=0.0025, parent=drawer)
    box("CaseDrawerNotch", (0.003, 0.012, 0.004), (right + 0.0095, CY - 0.014, MAT_TOP + 0.026), "case_hole", bevel_w=0.0008, parent=drawer)
    hole = cylinder("CaseSharpenerHole", 0.0052, 0.004, (0, 0, 0), "case_hole", vertices=14)
    along_x(hole)
    hole.location = (right + 0.0095, CY - 0.014, MAT_TOP + 0.013)
    finish(hole, "CaseSharpenerHole", "case_hole", drawer)

    # lid on a hinge along the back top edge; three.js rotates CaseLid about X to open it
    hinge_y = CY + W / 2
    hinge_z = MAT_TOP + HB + GAP
    lid = empty("CaseLid", (CX, hinge_y, hinge_z), parent=case)
    box("CaseLidShell", (L + 0.002, W + 0.002, HL), (CX, CY, hinge_z + HL / 2), "case_lid", bevel_w=0.0075, parent=lid)
    top = hinge_z + HL
    # a slim white band across the lid, like the two-tone lids of the time
    box("CaseLidBand", (L + 0.0024, 0.012, 0.0012), (CX, CY - 0.004, top), "case_trim", bevel_w=0.0005, parent=lid)
    # label tape, front half of the lid
    tape_group = empty("CaseTape", (CX, CY, top), parent=lid)
    tape("CaseTape1", 0, (CX - 0.03, CY - 0.028, top + 0.0003), (0, 0, math.radians(-1.6)), tape_group)
    # stickers, back half of the lid: a plane each (white-bordered die-cut PNGs)
    for sid, x, y, width, tilt in STICKERS:
        height = width * png_aspect(os.path.join(STICKER_DIR, f"{sid}.png"))
        plane(f"Sticker_{sid}", (width, height), (CX + x, CY + y, top + 0.00035), f"sticker_{sid}", rotation=(0, 0, math.radians(tilt)), parent=lid)
    # a little compass dial in the lid's corner (every 2000s case had one gadget too many)
    dx, dy = CX + 0.1, CY - 0.028
    cylinder("CaseDial", 0.011, 0.003, (dx, dy, top + 0.0015), "case_dial", vertices=28, bevel_w=0.0008, parent=lid)
    cylinder("CaseDialFace", 0.0085, 0.0006, (dx, dy, top + 0.0031), "case_dial_face", vertices=28, parent=lid)
    box("CaseDialNeedle", (0.0012, 0.012, 0.0004), (dx, dy, top + 0.0036), "case_button_b", rotation=(0, 0, math.radians(28)), parent=lid)
    # the sticky note stuck to the inside of the lid (its face points down; it reads upright once the lid is open)
    # it sits low (near the hinge) with a strip of tape across its top edge (-y: up once the lid is open)
    nx, ny, sz = CX + 0.07, CY + 0.012, 0.05
    note = empty("StickyNote", (nx, ny, hinge_z), parent=lid)
    box("Sticky", (sz, sz, 0.0022), (nx, ny, hinge_z - 0.0011), "sticky", rotation=(0, 0, math.radians(6)), parent=note)
    plane("StickyFace", (sz, sz), (nx, ny, hinge_z - 0.00225), "sticky_face", rotation=(math.pi, 0, math.radians(6)), parent=note)
    # keep the tape's 4:1 in sync with stickyTapeTexture in components/desk/textures.ts
    plane("StickyTape", (0.052, 0.013), (nx - 0.002, ny - sz / 2 + 0.002, hinge_z - 0.0025), "sticky_tape", rotation=(math.pi, 0, math.radians(3)), parent=note)
    # hinge: a rod with three knuckles
    hinge = cylinder("CaseHinge", 0.0028, L * 0.92, (0, 0, 0), "case_hinge", vertices=14)
    along_x(hinge)
    hinge.location = (CX, hinge_y + 0.0008, MAT_TOP + HB + GAP / 2)
    finish(hinge, "CaseHinge", "case_hinge", case)
    for i, x in enumerate((-0.08, 0.0, 0.08)):
        k = cylinder(f"CaseHingeKnuckle{i}", 0.0042, 0.024, (0, 0, 0), "case_trim", vertices=16, bevel_w=0.0008)
        along_x(k)
        k.location = (CX + x, hinge_y + 0.0008, MAT_TOP + HB + GAP / 2)
        finish(k, f"CaseHingeKnuckle{i}", "case_trim", case)


# --------------------------------------------------------------------------- items (miniatures)

def item(name, x, y, rot_deg=0.0):
    """Item group with its origin on the case floor; children are built around (0, 0, 0)."""
    group = empty(f"Item_{name}", (0, 0, 0))
    return group, (CX + x, CY + y, FLOOR + 0.0004), rot_deg


def place(group, location, rot_deg):
    group.location = location
    group.rotation_euler = (0, 0, math.radians(rot_deg))


def build_items():
    # back row (+y) and front row (-y) inside the case, either side of the divider
    # the Sunstang VCU and the DE1-SoC are the real boards (boards.py), scaled down
    g, at, r = item("sunstang", -0.078, 0.021, -2)
    build_vcu(parent=g, scale=0.27, name="SunstangVcu")
    place(g, at, r)

    g, at, r = item("fsm", -0.078, -0.022, 3)
    build_de1soc(parent=g, scale=0.35, name="FsmDe1Soc")
    place(g, at, r)

    g, at, r = item("squat", -0.002, -0.024, 0)
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

    # a CD in its jewel case: black tray with the disc, and a clear lid hinged on
    # the left edge with the cover behind it. three.js opens MusicLid (about its
    # hinge) and spins MusicDisc while the song plays.
    g, at, r = item("music", -0.008, 0.021, 8)
    cw, cd, tray_h, lid_h = 0.034, 0.030, 0.0022, 0.0012
    box("MusicTray", (cw, cd, tray_h), (0, 0, tray_h / 2), "cd_tray", bevel_w=0.0005, parent=g)
    disc = cylinder("MusicDisc", 0.0125, 0.0004, (0, 0, tray_h + 0.0002), "cd_disc", vertices=48)
    finish(disc, "MusicDisc", "cd_disc", g)
    cylinder("MusicHub", 0.0026, 0.0006, (0, 0, tray_h + 0.0003), "cd_hub", vertices=20, parent=disc)
    hinge_x = -cw / 2
    lid = empty("MusicLid", (hinge_x, 0, tray_h), parent=g)
    box("MusicShell", (cw, cd, lid_h), (0, 0, tray_h + lid_h / 2 + 0.0004), "cd_shell", bevel_w=0.0004, parent=lid)
    plane("MusicCover", (cw - 0.004, cd - 0.003), (0.0012, 0, tray_h + 0.001), "cd_cover", parent=lid)
    box("MusicSpine", (0.0024, cd, tray_h + lid_h), (hinge_x + 0.0012, 0, (tray_h + lid_h) / 2), "cd_tray", parent=g)
    place(g, at, r)

    g, at, r = item("about", 0.07, 0.02, -6)
    box("AboutCard", (0.054, 0.034, 0.0008), (0, 0, 0.0004), "card", bevel_w=0.0003, parent=g)
    plane("AboutCardFace", (0.054, 0.034), (0, 0, 0.00085), "card_face", parent=g)
    place(g, at, r)

    # a small hardcover journal with an elastic band: the blog and the guest book
    g, at, r = item("blog", 0.075, -0.021, 5)
    jw, jd, jh, board = 0.034, 0.042, 0.0075, 0.0009
    box("JournalPages", (jw - 0.0014, jd - 0.002, jh - 2 * board), (0.0004, 0, jh / 2), "journal_pages", parent=g)
    box("JournalBack", (jw, jd, board), (0, 0, board / 2), "journal_cover", bevel_w=0.0003, parent=g)
    box("JournalFront", (jw, jd, board), (0, 0, jh - board / 2), "journal_cover", bevel_w=0.0003, parent=g)
    box("JournalSpine", (0.0016, jd, jh), (-jw / 2 + 0.0008, 0, jh / 2), "journal_cover", bevel_w=0.0004, parent=g)
    plane("JournalLabel", (0.018, 0.012), (0.002, 0.008, jh + 0.00003), "journal_label", parent=g)
    box("JournalBand", (0.0018, jd + 0.0006, jh + 0.0005), (jw / 2 - 0.006, 0, jh / 2), "journal_band", parent=g)
    place(g, at, r)


# --------------------------------------------------------------------------- desk environment

# 65% ANSI layout: (KeyboardEvent.code, width in units). Every key is named
# "Key_<code>" so the page can press the matching key when the visitor types.
KEY_ROWS = [
    [("Escape", 1)] + [(f"Digit{d}", 1) for d in "1234567890"] + [("Minus", 1), ("Equal", 1), ("Backspace", 2), ("Delete", 1)],
    [("Tab", 1.5)] + [(f"Key{c}", 1) for c in "QWERTYUIOP"] + [("BracketLeft", 1), ("BracketRight", 1), ("Backslash", 1.5), ("PageUp", 1)],
    [("CapsLock", 1.75)] + [(f"Key{c}", 1) for c in "ASDFGHJKL"] + [("Semicolon", 1), ("Quote", 1), ("Enter", 2.25), ("PageDown", 1)],
    [("ShiftLeft", 2.25)] + [(f"Key{c}", 1) for c in "ZXCVBNM"] + [("Comma", 1), ("Period", 1), ("Slash", 1), ("ShiftRight", 1.75), ("ArrowUp", 1), ("End", 1)],
    [("ControlLeft", 1.25), ("AltLeft", 1.25), ("MetaLeft", 1.25), ("Space", 6.25), ("MetaRight", 1), ("AltRight", 1),
     ("ControlRight", 1), ("ArrowLeft", 1), ("ArrowDown", 1), ("ArrowRight", 1)],
]


def build_keyboard(env):
    kx, ky = 0.02, 0.3
    u = 0.0205  # one key unit
    kb = empty("Keyboard", (kx, ky, 0), parent=env)
    box("KeyboardCase", (16 * u + 0.022, 5 * u + 0.016, 0.02), (kx, ky, 0.01), "kb_case", bevel_w=0.006, parent=kb)
    for row, keys in enumerate(KEY_ROWS):
        assert abs(sum(w for _, w in keys) - 16) < 1e-6, f"row {row} isn't 16u"
        x = kx - 8 * u
        y = ky + (2 - row) * u
        for code, w in keys:
            box(f"Key_{code}", (w * u - 0.0028, u - 0.0028, 0.008), (x + w * u / 2, y, 0.024), "kb_key",
                bevel_w=0.0016, parent=kb, segments=1)
            x += w * u
    kb.rotation_euler = (0, 0, math.radians(-2))


def build_desk():
    env = empty("Desk")
    # large enough that the full-window camera never sees past its edges
    box("DeskTop", (2.4, 1.4, 0.03), (0, 0.05, -0.015), "desk_wood", bevel_w=0.004, parent=env)
    box("CuttingMat", (0.6, 0.45, 0.002), (0, -0.02, 0.001), "mat", bevel_w=0.0008, parent=env)

    build_keyboard(env)

    # monitor at the back, screen facing the viewer (group "Monitor" is clickable: it's the terminal)
    mon = empty("Monitor", (0.02, 0.585, 0.28), parent=env)
    box("MonitorFoot", (0.22, 0.15, 0.008), (0.02, 0.56, 0.004), "monitor", bevel_w=0.004, parent=mon)
    box("MonitorNeck", (0.045, 0.03, 0.2), (0.02, 0.6, 0.1), "monitor", bevel_w=0.006, parent=mon)
    box("MonitorBody", (0.62, 0.028, 0.37), (0.02, 0.585, 0.28), "monitor", bevel_w=0.008, parent=mon)
    plane("MonitorScreen", (0.6, 0.35), (0.02, 0.5705, 0.28), "screen", rotation=(math.radians(90), 0, 0), parent=mon)

    # architect's swing-arm lamp, head aimed at the mat
    base = (-0.47, 0.28, 0.0)
    elbow = (-0.44, 0.16, 0.36)
    head = (-0.22, 0.04, 0.33)
    target = Vector((-0.1, -0.04, 0.0))
    # one parent so the lamp is a single clickable thing (click to switch it on/off)
    lamp = empty("Lamp", parent=env)
    cylinder("LampBase", 0.065, 0.018, (base[0], base[1], 0.009), "lamp", vertices=28, bevel_w=0.004, parent=lamp)
    between("LampArmLower", (base[0], base[1], 0.018), elbow, 0.006, "lamp", parent=lamp)
    between("LampArmUpper", elbow, head, 0.006, "lamp", parent=lamp)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.011, location=elbow, segments=16, ring_count=8)
    finish(bpy.context.active_object, "LampElbow", "lamp_joint", lamp)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=0.055, radius2=0.022, depth=0.08, location=head)
    shade_head = bpy.context.active_object
    shade_head.rotation_mode = "QUATERNION"
    shade_head.rotation_quaternion = (target - Vector(head)).to_track_quat("-Z", "Y")
    mod = shade_head.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = 0.002
    select_only(shade_head)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    shade(shade_head)
    finish(shade_head, "LampShade", "lamp", lamp)
    bulb_at = Vector(head) + (target - Vector(head)).normalized() * 0.02
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.014, location=bulb_at, segments=16, ring_count=8)
    finish(bpy.context.active_object, "LampBulb", "lamp_bulb", lamp)
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

    # wall behind the desk (seen in the terminal view), with a sticky note back to the simple site
    wall_y = 0.76
    plane("Wall", (3.2, 1.6), (0, wall_y, 0.8), "wall", rotation=(math.radians(90), 0, 0), parent=env)
    wall_note = empty("WallNote", (0.43, wall_y - 0.003, 0.36), parent=env)
    up = (math.radians(90), 0, math.radians(-4))
    box("WallNotePad", (0.076, 0.076, 0.003), (0.43, wall_y - 0.0016, 0.36), "sticky", rotation=up, parent=wall_note)
    plane("WallNoteFace", (0.076, 0.076), (0.43, wall_y - 0.0032, 0.36), "wall_note_face", rotation=up, parent=wall_note)


# --------------------------------------------------------------------------- main

def build_desk_scene():
    build_desk()
    build_case()
    build_items()


if __name__ == "__main__":
    reset()
    build_desk_scene()
    export_glb("desk.glb")
