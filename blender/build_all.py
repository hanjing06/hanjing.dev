"""
Builds every model the desk needs:

  public/desk/desk.glb     the desk, the pencil case and the miniatures (desk_scene.py)
  public/desk/vcu.glb      the Sunstang VCU, full size, for its lab view (boards.py)
  public/desk/de10.glb     the DE10-Standard FPGA board, full size, for its lab view (boards.py)

Run from the repo root:
    npm run models
    # or: blender -b --python blender/build_all.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from boards import build_de10, build_vcu  # noqa: E402
from common import export_glb, reset  # noqa: E402
from desk_scene import build_desk_scene  # noqa: E402

reset()
build_desk_scene()
export_glb("desk.glb")

reset()
build_vcu()
export_glb("vcu.glb")

reset()
build_de10()
export_glb("de10.glb")
