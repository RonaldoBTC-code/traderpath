# make_explorer_template.py — plantilla para dibujar a mano la hoja del explorador.
#
#   blender -b --python renders/blender/make_explorer_template.py
#
# Salida (renders/templates/, fuera de renders/assets para que no se publique):
#   explorer_walk_plantilla.png  3456×1440 (el doble de la hoja): calco de la
#                                hoja actual al 30 %, rejilla de cuadros, línea
#                                del suelo de cada fila y eje central.
#   explorer_paleta.png          los 5 tonos ámbar que el recoloreo reconoce.
#
# Uso: ábrela como capa de fondo en tu programa, dibuja encima en otra capa,
# oculta la plantilla y exporta SOLO tu capa (PNG con transparencia) a
# renders/assets/sprites/explorer_walk.png. `npm run art` la escala a 1728×720
# y genera los 5 colores del selector.

import os

import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
SHEET = os.path.join(ROOT, "public", "assets", "sprites", "explorer_walk.webp")
OUT_DIR = os.path.join(ROOT, "renders", "templates")

# Mismo layout que EXPLORER_SHEET (characterArt.ts) y SHEET_* (build_explorer.py).
FRAME = (192, 240)
COLS, ROWS = 9, 3
SCALE = 2
GUIDE_ALPHA = 0.30

GRID = (0.12, 0.16, 0.27, 1.0)        # navy
GROUND = (0.86, 0.15, 0.15, 0.9)      # rojo: donde apoyan los pies
CENTER = (0.15, 0.39, 0.92, 0.45)     # azul: eje del personaje
IDLE_TINT = (0.90, 0.59, 0.04, 0.10)  # la columna de reposo, levemente marcada

# Paleta que reconoce el recoloreo (tono ~38°, saturación ≥ 0,55).
PALETTE = ["#8A5608", "#B8740A", "#E5960A", "#F7B23B", "#FBC55E"]


def load_pixels(path, size):
    img = bpy.data.images.load(path, check_existing=False)
    img.scale(*size)
    px = np.empty(size[0] * size[1] * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(size[1], size[0], 4)  # fila 0 = abajo


def save_png(pixels, path):
    h, w = pixels.shape[:2]
    img = bpy.data.images.new(os.path.basename(path), w, h, alpha=True)
    img.pixels.foreach_set(pixels.astype(np.float32).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def blend(dst, color, mask=None):
    """Pinta `color` (RGBA) sobre la región con alpha compositing."""
    a = color[3]
    region = dst if mask is None else dst[mask]
    region[..., :3] = region[..., :3] * (1 - a) + np.array(color[:3]) * a
    region[..., 3] = np.maximum(region[..., 3], a)
    if mask is not None:
        dst[mask] = region


def main():
    fw, fh = FRAME[0] * SCALE, FRAME[1] * SCALE
    width, height = fw * COLS, fh * ROWS
    ref = load_pixels(SHEET, (width, height))

    out = np.zeros((height, width, 4), dtype=np.float32)
    out[..., :3] = ref[..., :3]
    out[..., 3] = ref[..., 3] * GUIDE_ALPHA

    line = 2 * SCALE
    for row in range(ROWS):
        # Fila en coordenadas de Blender (0 abajo).
        y0 = height - (row + 1) * fh
        y1 = y0 + fh
        # Suelo: el píxel opaco más bajo del cuadro de reposo de esa fila.
        idle = ref[y0:y1, 0:fw, 3] > 0.5
        rows_with_feet = np.where(idle.any(axis=1))[0]
        ground = y0 + int(rows_with_feet.min()) if rows_with_feet.size else y0
        blend(out[ground:ground + line, :], GROUND)
        blend(out[y0:y1, 0:fw], IDLE_TINT)
        for col in range(COLS):
            cx = col * fw + fw // 2
            blend(out[y0:y1, cx - 1:cx + 1], CENTER)

    for col in range(COLS + 1):
        x = min(col * fw, width - line)
        out[:, x:x + line] = GRID
    for row in range(ROWS + 1):
        y = min(row * fh, height - line)
        out[y:y + line, :] = GRID

    os.makedirs(OUT_DIR, exist_ok=True)
    template = os.path.join(OUT_DIR, "explorer_walk_plantilla.png")
    save_png(out, template)

    swatch = 120
    pal = np.zeros((swatch, swatch * len(PALETTE), 4), dtype=np.float32)
    for i, hx in enumerate(PALETTE):
        rgb = [int(hx[k:k + 2], 16) / 255 for k in (1, 3, 5)]
        pal[:, i * swatch:(i + 1) * swatch] = rgb + [1.0]
    palette = os.path.join(OUT_DIR, "explorer_paleta.png")
    save_png(pal, palette)

    print(f"[TraderPath] plantilla {width}x{height} → {template}")
    print(f"[TraderPath] paleta {' '.join(PALETTE)} → {palette}")


main()
