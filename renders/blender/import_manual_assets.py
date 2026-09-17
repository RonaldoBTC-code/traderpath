# import_manual_assets.py — publica arte hecho a mano en el formato del juego.
#
# No se ejecuta a mano: lo llama scripts/build-art.mjs (`npm run art`) con una
# lista de trabajos en JSON. Cada trabajo es {src, dst, kind, transparent,
# lossless, quality, size}:
#
#   kind "image"  convierte una imagen (png/jpg/tif/bmp/tga/webp) a WebP
#   kind "blend"  abre TU .blend y lo renderiza con SU cámara y SU escena
#   kind "model"  importa un .gltf/.glb/.fbx/.obj/.dae al set cartoon del juego
#   kind "recolor" cambia el ámbar de un explorador dibujado a mano por el color
#                  de un botón del selector (key_hex → target_hex)
#
# Regla que no se rompe: **el .blend nunca se guarda ni se modifica**. Se abre,
# se renderiza y se sale. Tu archivo es tuyo; el juego solo consume el WebP.
#
# Cada salida se verifica releyéndola (tamaño, canales, alfa) y se reporta en
# una línea `[art] OK|FALLO <ruta> | <detalle>` que el CLI de Node interpreta.

import json
import math
import os
import sys

import bpy

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def _arg(flag, default=None):
    return ARGS[ARGS.index(flag) + 1] if flag in ARGS and ARGS.index(flag) + 1 < len(ARGS) else default


# Mismos valores que el resto de la tubería (VDD v2.0): si el arte manual
# conviviera con luz distinta, se notaría el corte entre piezas.
INK_HEX = "#1E2A44"
SUN_STRENGTH = 2.0
FILL_STRENGTH = 0.6
WORLD_STRENGTH = 0.65


def hexrgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def neutral_view_transform(scene):
    """Sin esto, AgX reinterpreta los colores y el arte sale lavado."""
    try:
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.look = "None"
        scene.view_settings.exposure = 0.0
        scene.view_settings.gamma = 1.0
        scene.display_settings.display_device = "sRGB"
    except TypeError:
        pass


def output_settings(scene, transparent, lossless, quality):
    s = scene.render.image_settings
    s.file_format = "WEBP"
    s.color_mode = "RGBA" if transparent else "RGB"
    s.color_depth = "8"
    # quality=100 no es "casi sin pérdida": Blender cambia al codificador
    # lossless. Es lo que necesitan las máscaras que el juego lee como dato.
    s.quality = 100 if lossless else int(quality)


def verify(dst, expect_alpha):
    img = bpy.data.images.load(dst, check_existing=False)
    w, h = img.size
    channels = img.channels
    alpha = None
    if expect_alpha and w and h:
        px = list(img.pixels[:4])
        alpha = round(px[3], 3)
    bpy.data.images.remove(img)
    kb = os.path.getsize(dst) / 1024
    detail = f"{w}×{h} · {kb:.0f} KB · {channels} canales"
    if alpha is not None:
        detail += f" · alfa esquina {alpha}"
    ok = w > 0 and h > 0
    if expect_alpha and channels < 4:
        ok = False
        detail += " · SIN CANAL ALFA"
    return ok, detail


# ── kind "image" ────────────────────────────────────────────────────────────
def do_image(job):
    scene = bpy.context.scene
    neutral_view_transform(scene)
    img = bpy.data.images.load(job["src"], check_existing=False)
    img.colorspace_settings.name = "sRGB"
    size = job.get("size")
    if size and tuple(img.size) != tuple(size):
        img.scale(int(size[0]), int(size[1]))
    output_settings(scene, job["transparent"], job["lossless"], job["quality"])
    os.makedirs(os.path.dirname(job["dst"]), exist_ok=True)
    img.save_render(job["dst"], scene=scene)
    bpy.data.images.remove(img)


# ── kind "blend" ────────────────────────────────────────────────────────────
def do_blend(job):
    # load_ui=False: abrimos los datos, no la disposición de ventanas del autor.
    bpy.ops.wm.open_mainfile(filepath=job["src"], load_ui=False)
    scene = bpy.context.scene
    if scene.camera is None:
        cam = next((o for o in scene.objects if o.type == "CAMERA"), None)
        if cam is None:
            raise RuntimeError(
                "el .blend no tiene cámara: añade una y guárdalo "
                "(en Blender: Add ▸ Camera, y luego Ctrl+Numpad0 para hacerla activa)"
            )
        scene.camera = cam

    neutral_view_transform(scene)
    scene.render.film_transparent = bool(job["transparent"])
    size = job.get("size")
    if size:
        scene.render.resolution_x, scene.render.resolution_y = int(size[0]), int(size[1])
    scene.render.resolution_percentage = 100
    output_settings(scene, job["transparent"], job["lossless"], job["quality"])
    os.makedirs(os.path.dirname(job["dst"]), exist_ok=True)
    scene.render.filepath = job["dst"]
    bpy.ops.render.render(write_still=True)
    # No se guarda nada: el .blend del artista queda intacto.


# ── kind "model" ────────────────────────────────────────────────────────────
IMPORTERS = {
    ".gltf": lambda p: bpy.ops.import_scene.gltf(filepath=p),
    ".glb": lambda p: bpy.ops.import_scene.gltf(filepath=p),
    ".fbx": lambda p: bpy.ops.import_scene.fbx(filepath=p),
    ".obj": lambda p: bpy.ops.wm.obj_import(filepath=p),
    ".dae": lambda p: bpy.ops.wm.collada_import(filepath=p),
    ".stl": lambda p: bpy.ops.wm.stl_import(filepath=p),
    ".ply": lambda p: bpy.ops.wm.ply_import(filepath=p),
}


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras, bpy.data.images):
        for block in list(coll):
            coll.remove(block)


def scene_bounds():
    """Caja que contiene todo lo importado, en coordenadas de mundo.

    Se evalúa con el depsgraph (modificadores aplicados incluidos), que es lo
    que de verdad se va a ver en el render.
    """
    xs, ys, zs = [], [], []
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for obj in bpy.context.scene.objects:
        if obj.type not in {"MESH", "CURVE", "SURFACE", "META", "FONT"}:
            continue
        evaluated = obj.evaluated_get(depsgraph)
        try:
            mesh = evaluated.to_mesh()
        except RuntimeError:
            continue
        if mesh is None:
            continue
        for vertex in mesh.vertices:
            world = evaluated.matrix_world @ vertex.co
            xs.append(world.x)
            ys.append(world.y)
            zs.append(world.z)
        evaluated.to_mesh_clear()
    if not xs:
        raise RuntimeError("el archivo no trae geometría visible")
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def cartoon_rig(transparent):
    """Cámara ortográfica 3/4 + luz diurna + contorno navy, encuadrando lo importado.

    Es el mismo lenguaje visual que build_explorer.py y build_mission_art.py, así
    que un modelo traído de fuera se ve como parte del mismo mundo.
    """
    scene = bpy.context.scene
    lo, hi = scene_bounds()
    center = [(lo[i] + hi[i]) / 2 for i in range(3)]
    extent = max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) or 1.0

    cam_data = bpy.data.cameras.new("ManualCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = extent * 1.45
    cam = bpy.data.objects.new("ManualCam", cam_data)
    scene.collection.objects.link(cam)
    distance = extent * 3.0
    cam.location = (center[0] + distance * 0.62, center[1] - distance * 0.72, center[2] + distance * 0.55)
    direction = (
        center[0] - cam.location[0],
        center[1] - cam.location[1],
        center[2] - cam.location[2],
    )
    cam.rotation_euler = (
        math.atan2(math.hypot(direction[0], direction[1]), -direction[2]),
        0.0,
        math.atan2(direction[1], direction[0]) + math.pi / 2,
    )
    scene.camera = cam

    key = bpy.data.lights.new("Key", type="SUN")
    key.energy = SUN_STRENGTH
    key_obj = bpy.data.objects.new("Key", key)
    key_obj.rotation_euler = (math.radians(52), 0, math.radians(38))
    scene.collection.objects.link(key_obj)

    fill = bpy.data.lights.new("Fill", type="SUN")
    fill.energy = FILL_STRENGTH
    fill_obj = bpy.data.objects.new("Fill", fill)
    fill_obj.rotation_euler = (math.radians(66), 0, math.radians(-120))
    scene.collection.objects.link(fill_obj)

    world = bpy.data.worlds.new("ManualWorld")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = WORLD_STRENGTH
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.85, 0.93, 1.0, 1.0)
    scene.world = world

    scene.render.engine = "CYCLES"
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    scene.render.film_transparent = bool(transparent)

    scene.render.use_freestyle = True
    view_layer = scene.view_layers[0]
    view_layer.use_freestyle = True
    fs = view_layer.freestyle_settings
    lineset = fs.linesets[0] if len(fs.linesets) else fs.linesets.new("LineSet")
    if lineset.linestyle is None:
        lineset.linestyle = bpy.data.linestyles.new("LineStyle")
    lineset.select_by_edge_types = True
    lineset.select_silhouette = True
    lineset.select_border = True
    lineset.select_crease = True
    fs.crease_angle = math.radians(120)
    lineset.linestyle.color = hexrgb(INK_HEX)
    lineset.linestyle.thickness = 1.6


def do_model(job):
    clear_scene()
    ext = os.path.splitext(job["src"])[1].lower()
    importer = IMPORTERS.get(ext)
    if importer is None:
        raise RuntimeError(f"no sé importar {ext}")
    importer(job["src"])
    neutral_view_transform(bpy.context.scene)
    cartoon_rig(job["transparent"])
    scene = bpy.context.scene
    size = job.get("size") or (1024, 1024)
    scene.render.resolution_x, scene.render.resolution_y = int(size[0]), int(size[1])
    scene.render.resolution_percentage = 100
    output_settings(scene, job["transparent"], job["lossless"], job["quality"])
    os.makedirs(os.path.dirname(job["dst"]), exist_ok=True)
    scene.render.filepath = job["dst"]
    bpy.ops.render.render(write_still=True)


# ── kind "recolor" ──────────────────────────────────────────────────────────
# Un dibujo a mano en el color base (ámbar) → las variantes del selector.
# Solo se tocan los píxeles del tono base y muy saturados: la piel (#FFD4AD)
# está a 10° de tono del ámbar pero con saturación 0,32 frente a 0,96, y el
# rubor a 0,48, así que la puerta de saturación los deja fuera.
HUE_WINDOW = 14 / 360        # distancia de tono máxima al color base
HUE_SOFT = 6 / 360           # transición suave (bordes antialiaseados)
SAT_MIN = 0.55               # por debajo, no es "ropa ámbar"
SAT_SOFT = 0.12


def _hex_hsv(value):
    import colorsys
    r, g, b = hexrgb(value)
    return colorsys.rgb_to_hsv(r, g, b)


def _rgb_to_hsv(rgb):
    import numpy as np
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = rgb.max(axis=-1)
    mn = rgb.min(axis=-1)
    d = mx - mn
    safe = np.where(d == 0, 1, d)
    h = np.where(mx == r, ((g - b) / safe) % 6,
                 np.where(mx == g, (b - r) / safe + 2, (r - g) / safe + 4)) / 6
    h = np.where(d == 0, 0, h)
    s = np.where(mx == 0, 0, d / np.where(mx == 0, 1, mx))
    return h, s, mx


def _hsv_to_rgb(h, s, v):
    import numpy as np
    i = np.floor(h * 6).astype(int) % 6
    f = h * 6 - np.floor(h * 6)
    p, q, t = v * (1 - s), v * (1 - f * s), v * (1 - (1 - f) * s)
    choices = [(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]
    out = np.zeros(h.shape + (3,), dtype=np.float32)
    for k, (cr, cg, cb) in enumerate(choices):
        m = i == k
        out[..., 0] = np.where(m, cr, out[..., 0])
        out[..., 1] = np.where(m, cg, out[..., 1])
        out[..., 2] = np.where(m, cb, out[..., 2])
    return out


def do_recolor(job):
    import numpy as np
    scene = bpy.context.scene
    neutral_view_transform(scene)
    img = bpy.data.images.load(job["src"], check_existing=False)
    img.colorspace_settings.name = "sRGB"
    size = job.get("size")
    if size and tuple(img.size) != tuple(size):
        img.scale(int(size[0]), int(size[1]))
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)  # bytes/255, sin conversión de color
    px = px.reshape(h, w, 4)

    kh, ks, kv = _hex_hsv(job["key_hex"])
    th, ts, tv = _hex_hsv(job["target_hex"])
    hue, sat, val = _rgb_to_hsv(px[..., :3])

    dist = np.abs(hue - kh)
    dist = np.minimum(dist, 1 - dist)
    hue_w = np.clip((HUE_WINDOW + HUE_SOFT - dist) / HUE_SOFT, 0, 1)
    sat_w = np.clip((sat - (SAT_MIN - SAT_SOFT)) / SAT_SOFT, 0, 1)
    weight = (hue_w * sat_w * (px[..., 3] > 0))[..., None]

    # Sombras y brillos del dibujo se conservan como proporción respecto del
    # color base: una sombra al 70 % del ámbar queda al 70 % del nuevo color.
    new_rgb = _hsv_to_rgb(
        np.full_like(hue, th),
        np.clip(sat * (ts / ks), 0, 1),
        np.clip(val * (tv / kv), 0, 1),
    )
    px[..., :3] = px[..., :3] * (1 - weight) + new_rgb * weight

    # Brillos claros y poco saturados del tono base: no se recolorean (se
    # confundirían con la piel) y quedarían beige sobre la ropa nueva. Se
    # cuentan para avisar al artista, que puede usar la paleta del README.
    doubtful = (dist <= HUE_WINDOW) & (sat >= 0.25) & (sat < SAT_MIN - SAT_SOFT) & (val > 0.85)
    doubtful &= px[..., 3] > 0.5
    opaque = max(int((px[..., 3] > 0.5).sum()), 1)
    share = 100.0 * int(doubtful.sum()) / opaque

    out = bpy.data.images.new("recolor", w, h, alpha=True)
    out.pixels.foreach_set(px.ravel())
    output_settings(scene, job["transparent"], job["lossless"], job["quality"])
    os.makedirs(os.path.dirname(job["dst"]), exist_ok=True)
    out.save_render(job["dst"], scene=scene)
    bpy.data.images.remove(out)
    bpy.data.images.remove(img)
    if share >= 0.5:
        return f"{share:.1f}% de brillos ámbar poco saturados quedaron sin recolorear (usa los tonos de la paleta)"
    return None


HANDLERS = {"image": do_image, "blend": do_blend, "model": do_model, "recolor": do_recolor}


def main():
    jobs_file = _arg("--jobs")
    if not jobs_file:
        print("[art] FALLO - | falta --jobs <archivo.json>")
        return
    with open(jobs_file, encoding="utf-8") as fh:
        jobs = json.load(fh)

    for job in jobs:
        dst = job["dst"]
        try:
            note = HANDLERS[job["kind"]](job)
            ok, detail = verify(dst, job["transparent"])
            if note:
                detail += f" · AVISO: {note}"
            print(f"[art] {'OK' if ok else 'FALLO'} {dst} | {detail}")
        except Exception as err:  # el CLI necesita el motivo, no un traceback
            print(f"[art] FALLO {dst} | {type(err).__name__}: {err}")


main()
