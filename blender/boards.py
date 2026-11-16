"""
The two circuit boards you can play with on the desk, built once and used
twice: full size for the "lab" views (vcu.glb, de1soc.glb) and scaled down
as the miniatures packed in the pencil case (desk.glb).

Every part the page moves or lights is named, with a prefix per board:

VCU (Sunstang VCU 2026, from the KiCad layout; 199.5 x 140 mm):
  VcuBoard, VcuSilk, VcuLcdScreen, VcuNucleo*, VcuSwitchLV/HV (+Knob),
  VcuBtnLeft/Hazard/Right/Precharge (+Cap), VcuGearKnob, VcuModeLever,
  VcuBlue0-4, VcuGreen0-4, VcuStatus0-3 (LV, HV, HVIL, FAULT)

DE1-SoC (the FPGA board the Moore FSM ran on; 158 x 100 mm):
  FsmBoard, FsmSilk, FsmSw0-9 (+Knob), FsmKey0-3 (+Cap), FsmLedr0-9,
  FsmHex0-5 with FsmHex<n>Seg<a-g>

Board tops sit at z = 0 with the board below; the origin is the board centre.
"""

import math

from common import box, cylinder, empty, plane

# ------------------------------------------------------------------ VCU

VCU_W, VCU_D, PCB_T = 0.1995, 0.14, 0.0016
# KiCad board origin (70, 58.5) → board centre in KiCad mm
_KX0, _KY0 = 70 + VCU_W * 500, 58.5 + VCU_D * 500


def kicad(x, y):
    """KiCad mm (y down) → metres from the board centre (y up)."""
    return ((x - _KX0) / 1000, -(y - _KY0) / 1000)


def _led(name, x, y, parent, size=(0.002, 0.0032, 0.0011)):
    box(name, size, (x, y, size[2] / 2), "led_off", bevel_w=0.0002, parent=parent)


def _button(name, kx, ky, parent):
    x, y = kicad(kx, ky)
    box(f"{name}Base", (0.0125, 0.0125, 0.004), (x, y, 0.002), "switch_black", bevel_w=0.0006, parent=parent)
    cylinder(f"{name}Cap", 0.0046, 0.0055, (x, y, 0.004 + 0.00275), "btn_cap", vertices=28, bevel_w=0.0008, parent=parent)


def _slide_switch(name, kx, ky, parent):
    x, y = kicad(kx, ky)
    box(f"{name}Housing", (0.0105, 0.023, 0.0065), (x, y, 0.00325), "switch_black", bevel_w=0.0008, parent=parent)
    # the knob slides toward the viewer (-y) for OFF and away (+y) for ON
    box(f"{name}Knob", (0.0078, 0.0085, 0.0045), (x, y - 0.0058, 0.0065 + 0.00225), "switch_lever", bevel_w=0.0008, parent=parent)


def _fuse(kx, ky, parent, index, upright=False):
    x, y = kicad(kx, ky)
    size = (0.0028, 0.0062, 0.0026) if upright else (0.0062, 0.0028, 0.0026)
    box(f"VcuFuse{index}", size, (x, y, 0.0013), "fuse_grey", bevel_w=0.0004, parent=parent)


def build_vcu(parent=None, scale=1.0, name="Vcu"):
    g = empty(name, parent=parent)
    box("VcuBoard", (VCU_W, VCU_D, PCB_T), (0, 0, -PCB_T / 2), "pcb_green", bevel_w=0.0006, parent=g)
    plane("VcuSilk", (VCU_W, VCU_D), (0, 0, 0.00006), "vcu_silk", parent=g)
    # mounting holes at the corners
    for i, (hx, hy) in enumerate(((75.5, 64), (264, 64), (75.5, 193), (264, 193))):
        x, y = kicad(hx, hy)
        cylinder(f"VcuHoleRing{i}", 0.0038, 0.0003, (x, y, 0.00015), "gold", vertices=20, parent=g)
        cylinder(f"VcuHole{i}", 0.00225, 0.0006, (x, y, 0.0002), "chip_black", vertices=16, parent=g)

    # Nucleo-F302R8 (U5) on stacked headers, long axis along y
    nx, ny = kicad(217.68, 108.13)
    nw, nd, lift = 0.070, 0.0825, 0.0105
    nucleo = empty("VcuNucleo", (nx, ny, 0), parent=g)
    for sx in (-1, 1):
        hx = nx + sx * (nw / 2 - 0.0038)
        box(f"VcuNucleoPins{'L' if sx < 0 else 'R'}", (0.0052, 0.076, lift), (hx, ny, lift / 2), "header_black", parent=nucleo)
        box(f"VcuNucleoHeader{'L' if sx < 0 else 'R'}", (0.0052, 0.076, 0.0085), (hx, ny, lift + PCB_T + 0.00425), "header_black", bevel_w=0.0003, parent=nucleo)
    box("VcuNucleoBoard", (nw, nd, PCB_T), (nx, ny, lift + PCB_T / 2), "pcb_white", bevel_w=0.0006, parent=nucleo)
    top = lift + PCB_T
    box("VcuNucleoMcu", (0.0105, 0.0105, 0.0014), (nx, ny - 0.006, top + 0.0007), "chip_black", bevel_w=0.0002, parent=nucleo)
    box("VcuNucleoStlink", (0.0065, 0.0065, 0.0012), (nx + 0.004, ny + 0.03, top + 0.0006), "chip_black", bevel_w=0.0002, parent=nucleo)
    box("VcuNucleoUsb", (0.0076, 0.0092, 0.004), (nx - 0.012, ny + nd / 2 - 0.0046, top + 0.002), "usb_silver", bevel_w=0.0005, parent=nucleo)
    cylinder("VcuNucleoReset", 0.0017, 0.0026, (nx + 0.02, ny + 0.012, top + 0.0013), "switch_black", vertices=16, parent=nucleo)
    cylinder("VcuNucleoUser", 0.0017, 0.0026, (nx - 0.02, ny + 0.012, top + 0.0013), "plastic_white", vertices=16, parent=nucleo)
    _led("VcuNucleoLed", nx + 0.012, ny + 0.022, nucleo, size=(0.0016, 0.0016, 0.001))
    _led("VcuNucleoPower", nx - 0.004, ny + 0.034, nucleo, size=(0.0016, 0.0016, 0.001))

    # 2x20 character LCD (DS1), top-left
    lx, ly = kicad(115, 81)
    box("VcuLcdFrame", (0.072, 0.028, 0.0085), (lx, ly, 0.00425), "lcd_frame", bevel_w=0.0008, parent=g)
    plane("VcuLcdScreen", (0.0635, 0.0185), (lx, ly, 0.0086), "vcu_lcd", parent=g)

    # LV / HV slide switches, bottom-left
    _slide_switch("VcuSwitchLV", 84, 172, g)
    _slide_switch("VcuSwitchHV", 103, 172, g)

    # illuminated push buttons
    _button("VcuBtnLeft", 93, 137.5, g)
    _button("VcuBtnHazard", 120.125, 137.46, g)
    _button("VcuBtnRight", 146.625, 137.46, g)
    _button("VcuBtnPrecharge", 135, 169, g)

    # gear select: a rotary switch with a pointer knob (N / R / D)
    gx, gy = kicad(112, 107.8)
    cylinder("VcuGearBase", 0.0068, 0.003, (gx, gy, 0.0015), "switch_black", vertices=28, parent=g)
    knob = empty("VcuGearKnob", (gx, gy, 0.003), parent=g)
    cylinder("VcuGearKnobBody", 0.0056, 0.012, (gx, gy, 0.009), "knob_black", vertices=28, bevel_w=0.0008, parent=knob)
    box("VcuGearPointer", (0.0014, 0.0048, 0.0008), (gx, gy + 0.0028, 0.0154), "plastic_white", parent=knob)

    # mode select: a toggle switch (ready / charge)
    mx, my = kicad(141, 117.2)
    cylinder("VcuModeBase", 0.0042, 0.0032, (mx, my, 0.0016), "connector_metal", vertices=24, parent=g)
    lever = empty("VcuModeLever", (mx, my, 0.0032), parent=g)
    cylinder("VcuModeStem", 0.0011, 0.011, (mx, my, 0.0032 + 0.0055), "connector_metal", vertices=12, parent=lever)
    cylinder("VcuModeBall", 0.0019, 0.0032, (mx, my, 0.0032 + 0.0115), "connector_metal", vertices=16, bevel_w=0.0008, parent=lever)

    # LED columns: blue (pre-charge contactor), green (main contactor), status (LV, HV, HVIL, FAULT)
    for i in range(5):
        x, y = kicad(127.9, 162.46 + i * 4.5)
        _led(f"VcuBlue{i}", x, y, g)
        x, y = kicad(154.2, 162.97 + i * 4.47)
        _led(f"VcuGreen{i}", x, y, g)
    for i in range(4):
        x, y = kicad(95.1, 105.2 + i * 4.6)
        _led(f"VcuStatus{i}", x, y, g, size=(0.0016, 0.0016, 0.001))

    # CAN transceiver (DIP-8), the five MOSFETs, the fuses
    ux, uy = kicad(249.81, 168.19)
    box("VcuCanDip", (0.0066, 0.0098, 0.0036), (ux, uy, 0.0018), "chip_black", bevel_w=0.0003, parent=g)
    for i in range(5):
        x, y = kicad(181.15 + i * 13.375, 168.4)
        box(f"VcuFet{i}", (0.0016, 0.003, 0.0011), (x, y, 0.00055), "chip_black", parent=g)
    n = 0
    for ky in (105.5, 110, 114.5, 119):
        _fuse(80.5, ky, g, n); n += 1
    for ky in (162.5, 167.1, 171.7, 176.3, 180.9):
        _fuse(115.2, ky, g, n); n += 1
    for ky in (163, 167.5, 172, 176.4, 180.9):
        _fuse(167.3, ky, g, n); n += 1
    for kx in (176.65, 189.65, 203.15, 216.65, 230.15):
        _fuse(kx, 168.3, g, n, upright=True); n += 1
    # connectors on the back (the harness plugs in underneath)
    for i, (jx, jy, w) in enumerate(((132, 189, 0.034), (212, 189, 0.034), (251.6, 192, 0.014))):
        x, y = kicad(jx, jy)
        box(f"VcuConn{i}", (w, 0.0058, 0.008), (x, y, -PCB_T - 0.004), "header_black", bevel_w=0.0004, parent=g)

    g.scale = (scale, scale, scale)
    return g


# ------------------------------------------------------------------ DE1-SoC

DE_W, DE_D = 0.158, 0.1


def build_de1soc(parent=None, scale=1.0, name="De1Soc"):
    g = empty(name, parent=parent)
    box("FsmBoard", (DE_W, DE_D, PCB_T), (0, 0, -PCB_T / 2), "pcb_blue", bevel_w=0.0006, parent=g)
    plane("FsmSilk", (DE_W, DE_D), (0, 0, 0.00006), "de_silk", parent=g)
    for i, (hx, hy) in enumerate(((-0.074, -0.045), (0.074, -0.045), (-0.074, 0.045), (0.074, 0.045))):
        cylinder(f"FsmHole{i}", 0.0016, 0.0005, (hx, hy, 0.0002), "chip_black", vertices=14, parent=g)

    # Cyclone V under its heatsink
    box("FsmFpga", (0.023, 0.023, 0.0025), (0.0, 0.01, 0.00125), "chip_black", bevel_w=0.0003, parent=g)
    box("FsmHeatsinkBase", (0.026, 0.026, 0.003), (0.0, 0.01, 0.004), "heatsink", bevel_w=0.0004, parent=g)
    for i in range(6):
        box(f"FsmHeatsinkFin{i}", (0.026, 0.0022, 0.011), (0.0, 0.01 - 0.0105 + i * 0.0042, 0.011), "heatsink", bevel_w=0.0003, parent=g)
    # memory, flash and the small chips around it
    for i, (cx, cy, w, d) in enumerate(((-0.03, 0.03, 0.012, 0.018), (0.03, 0.03, 0.012, 0.018), (0.028, -0.004, 0.008, 0.008), (-0.028, -0.004, 0.006, 0.006))):
        box(f"FsmChip{i}", (w, d, 0.0012), (cx, cy, 0.0006), "chip_black", bevel_w=0.0002, parent=g)

    # 40-pin GPIO headers along the top edge
    for i, hx in enumerate((-0.044, 0.016)):
        box(f"FsmGpio{i}", (0.052, 0.0052, 0.0088), (hx, 0.044, 0.0044), "header_black", bevel_w=0.0003, parent=g)
    # connectors along the left edge: VGA, ethernet, USB, audio jacks, power
    box("FsmVga", (0.016, 0.0168, 0.0125), (-0.0715, 0.026, 0.00625), "connector_metal", bevel_w=0.0008, parent=g)
    box("FsmEthernet", (0.0215, 0.0162, 0.0135), (-0.069, 0.001, 0.00675), "connector_metal", bevel_w=0.0008, parent=g)
    box("FsmUsb", (0.0175, 0.0135, 0.0158), (-0.071, -0.022, 0.0079), "connector_metal", bevel_w=0.0008, parent=g)
    for i in range(3):
        cylinder(f"FsmAudio{i}", 0.0032, 0.011, (-0.072, -0.036 - i * 0.0075 + 0.0075, 0.0055), "plastic_white", vertices=16, parent=g)
    cylinder("FsmPowerJack", 0.0045, 0.012, (-0.072, 0.044, 0.006), "switch_black", vertices=16, parent=g)
    box("FsmPowerButton", (0.006, 0.006, 0.006), (-0.056, 0.044, 0.003), "led_off", bevel_w=0.0008, parent=g)
    _led("FsmPowerLed", -0.048, 0.044, g, size=(0.0016, 0.0016, 0.001))

    # six 7-segment displays, HEX0 on the right
    seg_l, seg_w, seg_h = 0.0042, 0.0011, 0.0005
    layout = {
        "a": (0, 0.0046, False), "g": (0, 0, False), "d": (0, -0.0046, False),
        "b": (0.0026, 0.0023, True), "c": (0.0026, -0.0023, True), "f": (-0.0026, 0.0023, True), "e": (-0.0026, -0.0023, True),
    }
    for n in range(6):
        hx, hy = 0.017 - n * 0.0118, -0.019
        box(f"FsmHex{n}", (0.0098, 0.0138, 0.006), (hx, hy, 0.003), "hex_bg", bevel_w=0.0004, parent=g)
        for k, (ox, oy, vertical) in layout.items():
            size = (seg_w, seg_l, seg_h) if vertical else (seg_l, seg_w, seg_h)
            box(f"FsmHex{n}Seg{k}", size, (hx + ox, hy + oy, 0.006 + seg_h / 2), "hex_seg", parent=g)

    # red LEDs over the slide switches, SW0 / LEDR0 on the right; KEY0-3 to their right
    for i in range(10):
        sx = 0.028 - i * 0.0065
        _led(f"FsmLedr{i}", sx, -0.03, g, size=(0.0016, 0.003, 0.0011))
        box(f"FsmSw{i}Housing", (0.0045, 0.0088, 0.0038), (sx, -0.041, 0.0019), "switch_black", bevel_w=0.0004, parent=g)
        box(f"FsmSw{i}Knob", (0.003, 0.0028, 0.0036), (sx, -0.041 - 0.0021, 0.0038 + 0.0018), "switch_lever", bevel_w=0.0004, parent=g)
    for i in range(4):
        kx = 0.074 - i * 0.0105
        box(f"FsmKey{i}Base", (0.0082, 0.0082, 0.003), (kx, -0.04, 0.0015), "switch_black", bevel_w=0.0005, parent=g)
        cylinder(f"FsmKey{i}Cap", 0.0031, 0.0042, (kx, -0.04, 0.003 + 0.0021), "key_cap", vertices=20, bevel_w=0.0006, parent=g)

    g.scale = (scale, scale, scale)
    return g
