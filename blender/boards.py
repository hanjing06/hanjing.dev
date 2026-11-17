"""
The two circuit boards you can play with on the desk, built once and used
twice: full size for the "lab" views (vcu.glb, de10.glb) and scaled down
as the miniatures packed in the pencil case (desk.glb).

Every part the page moves or lights is named, with a prefix per board:

VCU (Sunstang VCU 2026, from the KiCad layout; 199.5 x 140 mm):
  VcuBoard, VcuSilk, VcuLcdScreen, VcuNucleo*, VcuSwitchLV/HV (+Knob),
  VcuBtnLeft/Hazard/Right/Precharge (+Cap), VcuGearKnob, VcuModeLever,
  VcuBlue0-4, VcuGreen0-4, VcuStatus0-3 (LV, HV, HVIL, FAULT)

DE10-Standard (the FPGA board the Moore FSM ran on; 162 x 112 mm):
  FsmBoard, FsmSilk, FsmFpga (+Mark), FsmLcd, FsmSw0-9 (+Housing/Knob),
  FsmKey0-3 (+Base/Cap), FsmLedr0-9, FsmHex0-5 with FsmHex<n>Seg<a-g>, FsmPowerLed

Board tops sit at z = 0 with the board below; the origin is the board centre.
"""

import math

from common import box, cylinder, empty, join, plane

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


# ------------------------------------------------------------------ DE10-Standard

DE_W, DE_D = 0.162, 0.112
# The parts the lab uses. Keep in sync with deSilkTexture (components/desk/textures.ts).
SW_X0, SW_PITCH, SW_Y = -0.0125, 0.0068, -0.0465  # SW0 on the right, SW9 on the left
LED_Y = -0.0355  # LEDR0-9, over their switches
HEX_X0, HEX_PITCH, HEX_Y = -0.002, 0.0079, -0.021  # HEX0 on the right
KEY_X0, KEY_PITCH, KEY_Y = 0.0445, 0.0118, -0.0445  # KEY0 on the right


def _along_y(radius, depth, location, material, name, parent, vertices=20):
    """A round part lying on its side, its face toward the board's top edge (+y)."""
    return cylinder(name, radius, depth, location, material, rotation=(math.pi / 2, 0, 0), vertices=vertices, parent=parent)


def _header(name, x, y, rows, parent, vertical=True):
    """A 2-row pin header (2.54 mm pitch): black body with gold pin tips."""
    pitch = 0.00254
    long_side = rows * pitch + 0.0004
    size = (0.0052, long_side, 0.0088) if vertical else (long_side, 0.0052, 0.0088)
    box(name, size, (x, y, 0.0044), "header_black", bevel_w=0.0003, parent=parent)
    pins = []
    for r in range(rows):
        for c in (-0.5, 0.5):
            along = (r - (rows - 1) / 2) * pitch
            px, py = (x + c * pitch, y + along) if vertical else (x + along, y + c * pitch)
            pins.append(box(f"{name}Pin{r}_{int(c > 0)}", (0.00064, 0.00064, 0.0012), (px, py, 0.0088 + 0.0006), "gold", parent=parent))
    # one mesh for all the pins: dozens of tiny meshes cost a draw call each
    join(pins, f"{name}Pins")


def build_de10(parent=None, scale=1.0, name="De10"):
    """Terasic DE10-Standard (Cyclone V SoC), laid out like the real board."""
    g = empty(name, parent=parent)
    box("FsmBoard", (DE_W, DE_D, PCB_T), (0, 0, -PCB_T / 2), "pcb_navy", bevel_w=0.0006, parent=g)
    plane("FsmSilk", (DE_W, DE_D), (0, 0, 0.00006), "de_silk", parent=g)
    for i, (hx, hy) in enumerate(((-0.0765, -0.0515), (0.0765, -0.0515), (-0.0765, 0.0515), (0.0765, 0.0515))):
        cylinder(f"FsmHole{i}", 0.0016, 0.0005, (hx, hy, 0.0002), "chip_black", vertices=14, parent=g)

    # ---- the Cyclone V SoC: a bare package with its marking (no heatsink on this board)
    box("FsmFpga", (0.031, 0.031, 0.0028), (0.012, 0.004, 0.0014), "chip_black", bevel_w=0.0003, parent=g)
    plane("FsmFpgaMark", (0.027, 0.027), (0.012, 0.004, 0.00282), "fpga_print", parent=g)
    # memory and the rest of the silicon around it
    chips = (
        ("FsmSdram", 0.036, 0.026, 0.022, 0.011),  # SDRAM (FPGA side)
        ("FsmDdr0", -0.0205, 0.004, 0.0075, 0.0133),  # HPS DDR3
        ("FsmDdr1", -0.0315, 0.004, 0.0075, 0.0133),
        ("FsmAudioCodec", -0.064, 0.036, 0.006, 0.006),
        ("FsmVideoDecoder", -0.063, 0.026, 0.009, 0.009),
        ("FsmBlasterChip", -0.052, 0.008, 0.01, 0.01),  # USB Blaster II
        ("FsmQspi", -0.044, 0.018, 0.008, 0.006),
        ("FsmPhy", 0.015, 0.03, 0.007, 0.007),  # ethernet PHY
        ("FsmUsbHub", 0.041, 0.04, 0.006, 0.006),
        ("FsmUart", 0.063, 0.043, 0.005, 0.005),
        ("FsmAccelerometer", 0.0405, 0.012, 0.003, 0.003),
        ("FsmReg0", -0.06, -0.006, 0.004, 0.004),
        ("FsmReg1", -0.054, -0.006, 0.004, 0.004),
        ("FsmPld", 0.032, -0.008, 0.006, 0.006),
    )
    for chip, cx, cy, w, d in chips:
        box(chip, (w, d, 0.0012), (cx, cy, 0.0006), "chip_black", bevel_w=0.0002, parent=g)
    for i, (cx, cy) in enumerate(((-0.062, 0.008), (-0.06, 0.0005), (0.0285, 0.016))):
        box(f"FsmInductor{i}", (0.0042, 0.0042, 0.0022), (cx, cy, 0.0011), "chip_silver", bevel_w=0.0003, parent=g)
    for i, (cx, cy) in enumerate(((0.03, -0.0135), (-0.009, 0.026))):
        box(f"FsmCrystal{i}", (0.0032, 0.0022, 0.0009), (cx, cy, 0.00045), "chip_silver", bevel_w=0.0002, parent=g)

    # ---- top edge, left to right: audio jacks, video in, VGA, ethernet, two USB, UART
    for i, (jx, color) in enumerate(((-0.066, "jack_pink"), (-0.0565, "jack_blue"), (-0.047, "jack_green"))):
        # the jacks are coloured all over (pink mic, blue line in, green line out)
        box(f"FsmAudio{i}", (0.0072, 0.012, 0.0062), (jx, 0.051, 0.0031), color, bevel_w=0.0005, parent=g)
        _along_y(0.0027, 0.0022, (jx, 0.0575, 0.0031), color, f"FsmAudio{i}Ring", g)
        _along_y(0.0011, 0.0024, (jx, 0.0577, 0.0031), "chip_black", f"FsmAudio{i}Hole", g, vertices=12)
    box("FsmVideoIn", (0.0095, 0.011, 0.011), (-0.036, 0.0505, 0.0055), "switch_black", bevel_w=0.0006, parent=g)
    _along_y(0.004, 0.006, (-0.036, 0.0585, 0.0062), "jack_yellow", "FsmVideoInJack", g)
    _along_y(0.0016, 0.0062, (-0.036, 0.0588, 0.0062), "connector_metal", "FsmVideoInPin", g, vertices=12)
    box("FsmVga", (0.024, 0.011, 0.0115), (-0.0145, 0.05, 0.00575), "vga_blue", bevel_w=0.0008, parent=g)
    box("FsmVgaShell", (0.0305, 0.0012, 0.0125), (-0.0145, 0.0561, 0.00625), "connector_metal", bevel_w=0.0003, parent=g)
    box("FsmVgaShroud", (0.0165, 0.004, 0.0062), (-0.0145, 0.0587, 0.0062), "connector_metal", bevel_w=0.0012, parent=g)
    box("FsmEthernet", (0.016, 0.021, 0.0135), (0.0145, 0.0475, 0.00675), "connector_metal", bevel_w=0.0006, parent=g)
    box("FsmEthernetMouth", (0.0118, 0.0006, 0.0085), (0.0145, 0.0582, 0.006), "chip_black", parent=g)
    for i, (lx, color) in enumerate(((0.009, "led_off"), (0.020, "led_off"))):
        box(f"FsmEthernetLed{i}", (0.0025, 0.0006, 0.0018), (lx, 0.0583, 0.0115), color, parent=g)
    for i, ux in enumerate((0.032, 0.0475)):
        box(f"FsmUsb{i}", (0.0132, 0.014, 0.0068), (ux, 0.052, 0.0034), "usb_silver", bevel_w=0.0004, parent=g)
        box(f"FsmUsb{i}Mouth", (0.0108, 0.0006, 0.0044), (ux, 0.0591, 0.0034), "chip_black", parent=g)
        box(f"FsmUsb{i}Tongue", (0.0094, 0.0008, 0.0016), (ux, 0.0592, 0.0042), "plastic_white", parent=g)
    box("FsmUartUsb", (0.0078, 0.009, 0.004), (0.064, 0.054, 0.002), "usb_silver", bevel_w=0.0003, parent=g)
    box("FsmMicroSd", (0.012, 0.012, 0.0018), (0.0745, 0.044, 0.0009), "connector_metal", bevel_w=0.0002, parent=g)

    # ---- left edge, top to bottom: PS/2, USB Blaster II, 12 V in, the red power button
    box("FsmPs2", (0.0125, 0.013, 0.0125), (-0.0745, 0.018, 0.00625), "ps2_purple", bevel_w=0.0008, parent=g)
    cylinder("FsmPs2Face", 0.0045, 0.0012, (-0.0812, 0.018, 0.0066), "chip_black", rotation=(0, math.pi / 2, 0), vertices=20, parent=g)
    box("FsmUsbBlaster", (0.012, 0.0115, 0.011), (-0.0745, 0.0065, 0.0055), "usb_silver", bevel_w=0.0005, parent=g)
    box("FsmUsbBlasterMouth", (0.0006, 0.0082, 0.0075), (-0.0808, 0.0065, 0.0055), "chip_black", parent=g)
    box("FsmPowerJack", (0.014, 0.009, 0.011), (-0.074, -0.003, 0.0055), "switch_black", bevel_w=0.0008, parent=g)
    cylinder("FsmPowerJackHole", 0.0031, 0.0012, (-0.0812, -0.003, 0.0058), "chip_silver", rotation=(0, math.pi / 2, 0), vertices=16, parent=g)
    box("FsmPowerSwitch", (0.009, 0.009, 0.0075), (-0.0745, -0.0125, 0.00375), "switch_black", bevel_w=0.0006, parent=g)
    cylinder("FsmPowerButton", 0.0034, 0.004, (-0.0805, -0.0125, 0.0045), "power_red", rotation=(0, math.pi / 2, 0), vertices=20, bevel_w=0.0008, parent=g)
    _led("FsmPowerLed", -0.0655, -0.0125, g, size=(0.0016, 0.0016, 0.001))

    # ---- the 128x64 LCD and the ADC header beside it
    _header("FsmAdc", -0.078, -0.0255, 5, g)
    box("FsmLcdFrame", (0.026, 0.0165, 0.0032), (-0.06, -0.024, 0.0016), "glcd_frame", bevel_w=0.0005, parent=g)
    plane("FsmLcd", (0.0215, 0.011), (-0.06, -0.0235, 0.00324), "glcd", parent=g)

    # ---- right edge: the 2x20 GPIO header, HSMC, micro SD, MSEL, LTC, IR, the HPS buttons and LED
    _header("FsmGpio", 0.0565, 0.0065, 20, g)
    box("FsmHsmc", (0.0062, 0.054, 0.0045), (0.0725, 0.009, 0.00225), "header_black", bevel_w=0.0004, parent=g)
    box("FsmHsmcSlot", (0.0018, 0.05, 0.0006), (0.0725, 0.009, 0.0048), "chip_silver", parent=g)
    box("FsmMsel", (0.0078, 0.0036, 0.0028), (0.063, -0.024, 0.0014), "dip_red", bevel_w=0.0003, parent=g)
    for i in range(6):
        box(f"FsmMselLever{i}", (0.0007, 0.0012, 0.0006), (0.0605 + i * 0.001, -0.0236, 0.0031), "plastic_white", parent=g)
    _header("FsmLtc", 0.0755, -0.029, 7, g)
    box("FsmIr", (0.0042, 0.003, 0.0042), (0.0655, -0.0345, 0.0021), "chip_black", bevel_w=0.0006, parent=g)
    _led("FsmUserLed", 0.0655, -0.0405, g, size=(0.0016, 0.0016, 0.001))
    for i, (bx, by) in enumerate(((0.0555, -0.0505), (0.0635, -0.0505), (0.0735, -0.0485))):  # WARM_RST, HPS_RST, HPS KEY
        box(f"FsmHpsBtn{i}Base", (0.0048, 0.0048, 0.0022), (bx, by, 0.0011), "switch_black", bevel_w=0.0003, parent=g)
        cylinder(f"FsmHpsBtn{i}Cap", 0.0013, 0.0014, (bx, by, 0.0022 + 0.0007), "key_cap", vertices=14, parent=g)

    # ---- the parts the detector uses
    # six 7-segment displays, HEX0 on the right
    seg_l, seg_w, seg_h = 0.0032, 0.0008, 0.0004
    layout = {
        "a": (0, 0.0036, False), "g": (0, 0, False), "d": (0, -0.0036, False),
        "b": (0.0019, 0.0018, True), "c": (0.0019, -0.0018, True), "f": (-0.0019, 0.0018, True), "e": (-0.0019, -0.0018, True),
    }
    for n in range(6):
        hx = HEX_X0 - n * HEX_PITCH
        box(f"FsmHex{n}", (0.0072, 0.0104, 0.0055), (hx, HEX_Y, 0.00275), "hex_bg", bevel_w=0.0003, parent=g)
        for k, (ox, oy, vertical) in layout.items():
            size = (seg_w, seg_l, seg_h) if vertical else (seg_l, seg_w, seg_h)
            box(f"FsmHex{n}Seg{k}", size, (hx + ox, HEX_Y + oy, 0.0055 + seg_h / 2), "hex_seg", parent=g)

    # ten red LEDs over ten slide switches, LEDR0 / SW0 on the right
    for i in range(10):
        sx = SW_X0 - i * SW_PITCH
        _led(f"FsmLedr{i}", sx, LED_Y, g, size=(0.0016, 0.0028, 0.0011))
        box(f"FsmSw{i}Housing", (0.0048, 0.0088, 0.0038), (sx, SW_Y, 0.0019), "switch_black", bevel_w=0.0004, parent=g)
        # the knob sits toward the viewer (-y) for 0; the lab slides it away for 1
        box(f"FsmSw{i}Knob", (0.003, 0.0028, 0.0036), (sx, SW_Y - 0.0021, 0.0038 + 0.0018), "switch_lever", bevel_w=0.0004, parent=g)
    # four push buttons, KEY0 on the right
    for i in range(4):
        kx = KEY_X0 - i * KEY_PITCH
        box(f"FsmKey{i}Base", (0.0098, 0.0098, 0.0034), (kx, KEY_Y, 0.0017), "switch_black", bevel_w=0.0005, parent=g)
        cylinder(f"FsmKey{i}Cap", 0.0036, 0.0042, (kx, KEY_Y, 0.0034 + 0.0021), "key_cap", vertices=24, bevel_w=0.0006, parent=g)

    g.scale = (scale, scale, scale)
    return g
