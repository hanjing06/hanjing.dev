"""
Shared helpers for the Blender build scripts (desk_scene.py, boards.py):
primitives with bevels, named materials ("roles") that components/desk/look.ts
and components/desk/lab/boardLook.ts restyle in three.js, and glTF export.

Blender is Z-up; the glTF exporter converts to three.js' Y-up (Blender -Y,
toward the viewer, becomes three.js +Z).
"""

import math
import os

import bpy
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "desk")

# bevel: multiplier on each part's bevel width, segs: bevel segments,
# cyl: vertices on round parts
V = dict(bevel=1.0, segs=2, cyl=24)

# Fallback colours (used only if a role isn't restyled in three.js).
PALETTE = {
    # pencil case
    "case_body": "#6cc2f7", "case_lid": "#94d5fb", "case_trim": "#f4f7fa", "case_button_a": "#ffd84a",
    "case_button_b": "#ff7eb6", "case_drawer": "#eef3f7", "case_hole": "#2a2f36", "case_hinge": "#6fb3db",
    "case_dial": "#f4f7fa", "case_dial_face": "#ffffff", "label_1": "#c4161c",
    "sticker_qualcomm": "#ffffff", "sticker_western": "#ffffff", "sticker_sunstang": "#ffffff",
    "sticker_interninsider": "#ffffff",
    # items
    "chip_black": "#15181a", "chip_silver": "#d9dde2", "gold": "#d9ab4c", "plastic_white": "#f1f2ef",
    "chrome": "#c9cfd4", "plate_black": "#202325",
    "card": "#fafafa", "card_face": "#ffffff",
    "journal_cover": "#7a2e24", "journal_pages": "#f1e8d4", "journal_label": "#f6efdc", "journal_band": "#1d1a18",
    "cd_tray": "#1a1b1e", "cd_disc": "#d9dde2", "cd_hub": "#c8ccd2", "cd_shell": "#e8f1f6", "cd_cover": "#ffffff",
    # circuit boards (the VCU and the DE10-Standard, full size and as miniatures)
    "pcb_green": "#1f6b45", "pcb_blue": "#2552a8", "pcb_white": "#f2efe6", "vcu_silk": "#ffffff", "de_silk": "#ffffff",
    "led_off": "#d9d4c8", "switch_black": "#1b1d20", "switch_lever": "#d8dbdf", "btn_cap": "#f3f1ea",
    "knob_black": "#202326", "lcd_frame": "#0f2a1f", "vcu_lcd": "#9fc46a", "hex_bg": "#2b1414", "hex_seg": "#5a1414",
    "key_cap": "#3a3d42", "header_black": "#17191c", "fuse_grey": "#9aa0a6", "connector_metal": "#b8bec6",
    "heatsink": "#c9ced4", "usb_silver": "#b0b6bd",
    "pcb_navy": "#1d3a78", "fpga_print": "#2a2c30", "glcd": "#9fb3b0", "glcd_frame": "#1a1c1e", "jack_pink": "#e889b5",
    "jack_blue": "#5aa9e6", "jack_green": "#7cc46a", "jack_yellow": "#e8c34a", "vga_blue": "#2d5fb8", "ps2_purple": "#7a5aa8",
    "power_red": "#d8322b", "dip_red": "#c8302a",
    # desk
    "desk_wood": "#c89a6a", "mat": "#2c6b66", "kb_case": "#3a3836", "kb_key": "#ece6da",
    "monitor": "#1c1d1f", "screen": "#111418", "lamp": "#efe9dc", "lamp_joint": "#b9bec4", "lamp_bulb": "#fff2d6",
    "mug": "#9fb8a3", "coffee": "#3b2416", "pot": "#c56f4a", "soil": "#3a2a1e", "leaf": "#4f7d4a",
    "book_1": "#2f4a6b", "book_2": "#c9b28a", "book_3": "#8a3b32",
    "sticky": "#ffe873", "sticky_face": "#ffffff", "sticky_tape": "#f8f4e8", "wall": "#4a3f36", "wall_note_face": "#ffffff",
}

_materials = {}


def reset():
    """Empty scene, fresh material cache."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _materials.clear()


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


def join(objects, name):
    """Merge meshes that share a material into one (fewer draw calls); keeps the first one's parent."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    merged = bpy.context.active_object
    merged.name = name
    merged.data.name = name
    return merged


def along_x(obj, spin_deg=0.0):
    """Bake a Z-axis primitive so its axis points along +X."""
    select_only(obj)
    obj.rotation_euler = (0, 0, math.radians(spin_deg))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    obj.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    return obj


def export_glb(filename):
    path = os.path.join(OUT_DIR, filename)
    os.makedirs(OUT_DIR, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"[blender] wrote {path}")
    # smaller download, same look (see compact_glb.py)
    from compact_glb import compact

    compact(path)
