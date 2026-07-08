# Dirac Momentum Notebook

This notebook combines the local `DiracPacketSplitting2D` and `DiracPacketSplitting3D`
projects into one Q-Ontic Lab notebook.

- `2d/` contains the WebGL2 two-component Dirac packet-splitting applet.
- `3d/` contains the WebGPU four-component Dirac packet-splitting applet.

The notebook page lazy-loads embedded applets so simulations do not start until the
user activates them. Standalone applet pages also use the shared notebook speed
control when opened directly.
