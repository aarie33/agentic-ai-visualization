"""Recolours the Kenney Factory Kit colour map for each theme (run from packages/visualizer: python3 scripts/recolor-colormap.py).

The kit's props are painted from one small palette image. Its cool blue/violet/grey swatches are rotated to a
theme hue; a theme may also move the orange swatches to another hue. Yellow and green are left alone.
"""
from PIL import Image
import numpy as np

SRC = "kenney_factory-kit_3.0/Models/GLB format/Textures/colormap.png"
OUT = "public/models/Textures/colormap-{}.png"

# name: (target hue in degrees, saturation gain, saturation floor, value gain, hue for the orange swatches or None)
THEMES = {
    "terakota": (207, 2.0, 0.42, 1.18, 46),
    "hutan": (150, 1.1, 0.12, 1.0, None),
    "malam": (292, 1.0, 0.14, 0.92, None),
}

src = Image.open(SRC).convert("RGBA")
rgb = src.convert("RGB").convert("HSV")
hsv = np.array(rgb).astype(np.float32)
alpha = np.array(src)[:, :, 3]

h = hsv[:, :, 0] * 360 / 255
s = hsv[:, :, 1] / 255
v = hsv[:, :, 2] / 255
cool = (h >= 195) & (h <= 290) & (s > 0.04) & (v > 0.05)

warm = (h >= 8) & (h <= 50) & (s > 0.15) & (v > 0.2)

for name, (hue, sgain, sfloor, vgain, warm_hue) in THEMES.items():
    out = hsv.copy()
    out[:, :, 0] = np.where(cool, hue * 255 / 360, hsv[:, :, 0])
    if warm_hue is not None:
        out[:, :, 0] = np.where(warm, warm_hue * 255 / 360, out[:, :, 0])
    new_s = np.clip(np.maximum(s * sgain, sfloor), 0, 1)
    out[:, :, 1] = np.where(cool, new_s * 255, hsv[:, :, 1])
    out[:, :, 2] = np.where(cool, np.clip(v * vgain, 0, 1) * 255, hsv[:, :, 2])
    img = Image.fromarray(out.astype(np.uint8), "HSV").convert("RGB").convert("RGBA")
    arr = np.array(img)
    arr[:, :, 3] = alpha
    Image.fromarray(arr, "RGBA").save(OUT.format(name))
    print("wrote", OUT.format(name))
