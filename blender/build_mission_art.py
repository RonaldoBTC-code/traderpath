# build_mission_art.py — TraderPath · arte de escena de las misiones (Nivel 1)
#
# Renderiza las piezas del contrato de public/assets/missions/README.md para el
# Nivel 1 (Isla de Academia Ágora): fondos por distrito + figuras repetidas.
# Cada archivo sale con el nombre EXACTO del contrato, así que aparece en el lab
# sin tocar código (los labs precargan y caen a su forma provisional si falta).
#
# CÓMO CORRERLO (desde la raíz del repo)
#   blender --background --python blender/build_mission_art.py
#   blender -b --python blender/build_mission_art.py -- --only m1_1-apple,m1_1-sign
#   blender -b --python blender/build_mission_art.py -- --preview --preview-dir <dir>
#
#   --only a,b      renderiza sólo esas piezas (nombre de archivo sin .webp)
#   --preview       pocas muestras: bucle rápido de iteración
#   --preview-dir   además guarda una copia PNG de cada pieza en esa carpeta
#
# CÓMO SE USAN LAS PIEZAS (medido en los componentes, no supuesto)
#   · Los fondos se pintan con `background-size: cover` centrado dentro de un
#     contenedor de 672 px de ancho máx. En CandleLab/StructureLab/GaugeLab la
#     tarjeta es ancha y baja, así que se ve sólo una FRANJA central horizontal,
#     y ese recorte CAMBIA con el ancho de pantalla. Encima van medidores y texto:
#     CandleLab/StructureLab → detalle en los laterales, centro tranquilo;
#     GaugeLab → textos en los bordes y, en móvil, casi la mitad izquierda: el
#     motivo principal va en x≈50–72 %, y≈22–52 % (única zona libre en todo ancho).
#   · m1_1 (SupplyDemandLab, 4:3) es un escenario con líneas fijas: cartel arriba
#     al centro, manzanas apoyadas en el mostrador a y≈52 %, clientes de pie de
#     y≈60 % hasta abajo. El fondo del puesto respeta esas líneas (se verifica
#     proyectando anclas, ver `report_anchors`).
#   · Cliente/manzana/moneda se ven a 24×40 y 20×20 px: siluetas simples,
#     renderizadas a 4× y reducidas para un contorno limpio.
#
# CONVENCIÓN DE ESCENA: Z arriba, cámara ortográfica en -Y mirando a +Y; el
# frente de cada objeto mira a -Y. Paleta VDD v2.0 + acento de cada distrito.
#
# Probado con Blender 5.2 LTS (Cycles headless, CPU).

import bpy
import os
import sys
import math
import numpy as np
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

# ─── CLI ─────────────────────────────────────────────────────────────────────
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def _arg_value(flag):
    return ARGS[ARGS.index(flag) + 1] if flag in ARGS and ARGS.index(flag) + 1 < len(ARGS) else None


ONLY = set(_arg_value("--only").split(",")) if _arg_value("--only") else None
PREVIEW = "--preview" in ARGS
PREVIEW_DIR = _arg_value("--preview-dir")

# ─── CONFIG ──────────────────────────────────────────────────────────────────
SAMPLES = 24 if PREVIEW else 96
WEBP_QUALITY = 90
SPRITE_SUPERSAMPLE = 4

INK_HEX = "#1E2A44"   # navy — contorno Freestyle, ojos
SKY_HEX = "#EAF4FE"   # tp-base
WHITE_HEX = "#FFFFFF"
SKIN_HEX = "#FFD4AD"
BLUSH_HEX = "#F5A97F"

# Acentos de distrito (contrato + marcadores de AcademyAgoraScene)
PLAZA_GREEN = "#33B77A"
WORKSHOP_ORANGE = "#E8743B"
OBSERVATORY_VIOLET = "#8B72FF"
VAULT_BLUE = "#2563EB"
GOLD_HEX = "#E5960A"


# ─── COLOR ───────────────────────────────────────────────────────────────────
def _srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexrgba(h, a=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return (_srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b), a)


# ─── ESCENA BASE ─────────────────────────────────────────────────────────────
_MATS = {}


def reset_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights,
                 bpy.data.cameras, bpy.data.images):
        for block in list(coll):
            coll.remove(block)
    # Los materiales cacheados ya no existen: tocarlos lanza ReferenceError.
    _MATS.clear()


def mat(hex_color, roughness=0.6):
    key = (hex_color, roughness)
    if key in _MATS:
        return _MATS[key]
    m = bpy.data.materials.new(f"m_{hex_color.lstrip('#')}_{roughness}")
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hexrgba(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    for socket in ("Specular IOR Level", "Specular"):
        if socket in bsdf.inputs:
            bsdf.inputs[socket].default_value = 0.12
            break
    _MATS[key] = m
    return m


def _finish(obj, material, smooth=True):
    obj.data.materials.append(material)
    if smooth:
        for poly in obj.data.polygons:
            poly.use_smooth = True
    return obj


def box(name, center, size, color, bevel=0.06, rotation=(0, 0, 0), subsurf=False):
    """Caja con bisel (look cartoon). `size` son dimensiones finales en metros."""
    bpy.ops.mesh.primitive_cube_add(location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0] / 2, size[1] / 2, size[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel > 0:
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    if subsurf:
        sub = obj.modifiers.new("subsurf", "SUBSURF")
        sub.levels = 1
        sub.render_levels = 2
    return _finish(obj, mat(color), smooth=bevel > 0 or subsurf)


def sphere(name, center, radii, color, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = radii
    return _finish(obj, mat(color))


def cylinder(name, center, radius, depth, color, rotation=(0, 0, 0), vertices=40):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth,
                                        location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    bev = obj.modifiers.new("bevel", "BEVEL")
    bev.width = min(radius, depth) * 0.15
    bev.segments = 2
    return _finish(obj, mat(color))


def cone(name, center, r1, r2, depth, color, rotation=(0, 0, 0), vertices=32):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=r1, radius2=r2, depth=depth,
                                    location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    return _finish(obj, mat(color), smooth=vertices > 8)


def torus(name, center, major, minor, color, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=48, minor_segments=12,
                                     location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    return _finish(obj, mat(color))


def plane(name, center, size, color, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=center, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (size[0], size[1], 1)
    return _finish(obj, mat(color), smooth=False)


def sky_plane(name, center, size, color):
    """Plano vertical emisivo: cielo de color exacto sin depender de la luz."""
    obj = plane(name, center, size, color, rotation=(R(90), 0, 0))
    m = bpy.data.materials.new(f"sky_{color.lstrip('#')}")
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (0, 0, 0, 1)
    for socket in ("Emission Color", "Emission"):
        if socket in bsdf.inputs:
            bsdf.inputs[socket].default_value = hexrgba(color)
            break
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = 1.0
    obj.data.materials.clear()
    obj.data.materials.append(m)
    return obj


R = math.radians


def no_ink_collection():
    coll = bpy.data.collections.get("NoInk")
    return coll if coll is not None else bpy.data.collections.new("NoInk")


def no_ink(obj):
    """Excluye el objeto del contorno Freestyle. Sigue renderizándose normal."""
    no_ink_collection().objects.link(obj)
    return obj


# ─── CÁMARA / LUZ / MUNDO ────────────────────────────────────────────────────
def camera(ortho_scale, elev_deg, target, azim_deg=0.0):
    data = bpy.data.cameras.new("cam")
    data.type = "ORTHO"
    data.ortho_scale = ortho_scale
    data.clip_start = 0.1
    data.clip_end = 400
    cam = bpy.data.objects.new("cam", data)
    bpy.context.scene.collection.objects.link(cam)
    e, a = R(elev_deg), R(azim_deg)
    fwd = Vector((math.sin(a) * math.cos(e), math.cos(a) * math.cos(e), -math.sin(e)))
    cam.location = Vector(target) - fwd * 90
    cam.rotation_euler = fwd.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


def sun(name, direction, energy, angle_deg):
    data = bpy.data.lights.new(name, "SUN")
    data.energy = energy
    data.angle = R(angle_deg)
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.rotation_euler = Vector(direction).normalized().to_track_quat("-Z", "Y").to_euler()


def daylight(world_strength=0.65, key=2.0, fill=0.6):
    # Key cálida desde arriba-derecha del lado de la cámara (-Y) + fill izquierdo.
    # Energías bajas a propósito: con colores pastel y view transform "Standard"
    # (sin roll-off), una luz fuerte recorta a blanco puro y la escena se borra.
    sun("key", (-0.35, 0.8, -0.75), key, 16)
    sun("fill", (0.6, 0.5, -0.45), fill, 30)
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hexrgba(SKY_HEX)
    bg.inputs["Strength"].default_value = world_strength


def render_settings(resolution, transparent, outline_px):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = transparent
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass
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
    lineset.select_crease = False
    lineset.select_material_boundary = True
    # Lo que está en la colección NoInk (brillos, juntas, adoquines) no se entinta:
    # con contorno, un brillo se lee como agujero y una junta como renglón.
    lineset.select_by_collection = True
    lineset.collection = no_ink_collection()
    lineset.collection_negation = "EXCLUSIVE"
    lineset.linestyle.color = hexrgba(INK_HEX)[:3]
    lineset.linestyle.thickness = outline_px


# ─── SALIDA ──────────────────────────────────────────────────────────────────
def missions_dir():
    try:
        base = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        base = bpy.path.abspath("//")
    out = os.path.normpath(os.path.join(base, "..", "public", "assets", "missions"))
    os.makedirs(out, exist_ok=True)
    return out


def _save(img, path, file_format, rgba):
    settings = bpy.context.scene.render.image_settings
    settings.file_format = file_format
    settings.color_mode = "RGBA" if rgba else "RGB"
    if file_format == "WEBP":
        settings.quality = WEBP_QUALITY
    img.save_render(path, scene=bpy.context.scene)


def render_piece(name, size, transparent, outline_px, supersample=1, wash=0.0):
    """Renderiza la escena actual y la guarda como <name>.webp al tamaño del contrato.

    supersample: render a N× y reducción (contornos limpios en sprites diminutos).
    wash: mezcla hacia blanco (0–1) para que medidores y texto encima se lean.
    """
    ss = max(1, supersample)
    render_settings((size[0] * ss, size[1] * ss), transparent, outline_px * ss)
    tmp = os.path.join(bpy.app.tempdir, f"{name}_raw.png")
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = tmp
    bpy.ops.render.render(write_still=True)

    img = bpy.data.images.load(tmp, check_existing=False)
    if ss > 1:
        img.scale(size[0], size[1])
    if wash > 0:
        px = np.empty(size[0] * size[1] * 4, dtype=np.float32)
        img.pixels.foreach_get(px)
        px = px.reshape(-1, 4)
        px[:, :3] = px[:, :3] * (1.0 - wash) + wash
        img.pixels.foreach_set(px.ravel())
        img.update()

    out = os.path.join(missions_dir(), f"{name}.webp")
    _save(img, out, "WEBP", rgba=transparent)
    if PREVIEW_DIR:
        os.makedirs(PREVIEW_DIR, exist_ok=True)
        _save(img, os.path.join(PREVIEW_DIR, f"{name}.png"), "PNG", rgba=True)

    # Verificación: releer el archivo final y comprobar tamaño y alfa.
    check = bpy.data.images.load(out, check_existing=False)
    w, h = check.size
    corner_alpha = None
    if transparent:
        cpx = np.empty(w * h * 4, dtype=np.float32)
        check.pixels.foreach_get(cpx)
        corner_alpha = round(float(cpx[3]), 3)  # píxel (0,0)
    ok = (w, h) == tuple(size) and (not transparent or corner_alpha == 0.0)
    print(f"[TraderPath] {name}.webp {w}x{h} channels={check.channels} "
          f"corner_alpha={corner_alpha} {'OK' if ok else 'REVISAR'}")
    return out


def report_anchors(anchors):
    """Imprime dónde caen puntos del mundo en la imagen (fracción desde arriba)."""
    scene = bpy.context.scene
    for label, co in anchors:
        v = world_to_camera_view(scene, scene.camera, Vector(co))
        print(f"[TraderPath]   ancla {label}: x={v.x * 100:.1f}% y={100 - v.y * 100:.1f}%")


# ═════════════════════════════════════════════════════════════════════════════
# PIEZAS
# ═════════════════════════════════════════════════════════════════════════════

# ─── m1_1 · Mercado Plaza ────────────────────────────────────────────────────
def piece_m1_1_stall():
    """Fondo 4:3 del puesto. Líneas del lab: mostrador y≈52 %, clientes y≥60 %."""
    reset_scene()
    daylight()
    # elev 12°, target z 1.1 → borde del mostrador (y=-0.72, z=1.02) cae en y≈52 %
    # y la base del frente (y=-0.6, z=0) en y≈60 % (ver report_anchors).
    camera(16.0, 12.0, (0, 0, 1.1))

    plane("ground", (0, -6, 0), (26, 44), "#D3DCE6")
    box("curb", (0, -1.6, 0.04), (26, 0.5, 0.08), "#BFCAD8", bevel=0.02)
    # Adoquines sutiles y sin contorno: textura de plaza sin rayar la zona de clientes.
    cobbles = ((-7.2, -5.0), (-5.6, -8.5), (-7.0, -12.5), (-4.8, -15.5), (6.9, -6.0),
               (5.2, -9.5), (7.1, -13.5), (4.6, -17.0), (-1.5, -19.0), (1.8, -11.0))
    for i, (x, y) in enumerate(cobbles):
        no_ink(cylinder(f"cobble{i}", (x, y, 0.01), 0.55, 0.02, "#C8D2DE"))
    sky_plane("sky", (0, 22, 8), (40, 20), "#CFE8FA")
    # Fondo lejano: casas pastel de la plaza (asoman por las esquinas del toldo)
    houses = [(-7.6, 4.2, "#BFE8CD"), (-5.2, 3.2, "#FFE4B8"), (5.4, 3.6, "#CFE3F7"), (7.8, 4.4, "#BFE8CD")]
    for i, (x, hgt, col) in enumerate(houses):
        box(f"house{i}", (x, 11, hgt / 2), (2.4, 2.0, hgt), col, bevel=0.08)
        box(f"roof{i}", (x, 11, hgt + 0.35), (2.7, 2.3, 0.7), PLAZA_GREEN, bevel=0.12)
    for i, x in enumerate((-9.2, 9.2)):
        cylinder(f"trunk{i}", (x, 5, 0.9), 0.18, 1.8, "#B97A4A")
        sphere(f"crown{i}", (x, 5, 2.4), (1.2, 1.2, 1.1), "#5FB97A")

    # Estructura del puesto
    for i, x in enumerate((-6.0, 6.0)):
        cylinder(f"post{i}", (x, -0.8, 3.2), 0.22, 6.4, "#B97A4A")
    box("back", (0, 0.75, 3.0), (11.8, 0.2, 4.2), "#F0D2A8", bevel=0.05)

    # Toldo: techo inclinado a rayas + faldón frontal + festón de medios círculos.
    # Cada disco del festón va detrás del faldón: se ve sólo su mitad inferior.
    slope = math.atan2(6.3 - 5.0, 0.8 - (-1.0))
    stripes = 10
    width = 13.6 / stripes
    for i in range(stripes):
        x = -6.8 + width * (i + 0.5)
        col = PLAZA_GREEN if i % 2 == 0 else "#FFF3DC"
        box(f"awning{i}", (x, -0.1, 5.65), (width, 2.25, 0.12), col, bevel=0.02,
            rotation=(-slope, 0, 0))
        box(f"flap{i}", (x, -1.1, 4.95), (width, 0.08, 0.7), col, bevel=0.0)
        cylinder(f"scallop{i}", (x, -1.04, 4.6), width * 0.42, 0.06, col, rotation=(R(90), 0, 0))

    # Mostrador
    box("counter", (0, 0, 0.47), (12.6, 1.2, 0.94), "#E1B07C", bevel=0.05)
    box("counter_trim", (0, -0.62, 0.86), (12.62, 0.06, 0.16), PLAZA_GREEN, bevel=0.02)
    box("counter_top", (0, 0, 0.97), (12.9, 1.44, 0.1), "#F2CFA0", bevel=0.03)
    for i, x in enumerate((-4.2, -1.4, 1.4, 4.2)):
        box(f"plank{i}", (x, -0.61, 0.42), (0.05, 0.03, 0.7), "#C9935E", bevel=0.0)

    # Laterales en el suelo (fuera del centro)
    box("side_crate_a", (-7.3, -1.8, 0.45), (1.3, 1.0, 0.9), "#C98B55", bevel=0.06)
    box("side_crate_b", (-7.1, -1.7, 1.15), (1.0, 0.8, 0.5), "#D9A26E", bevel=0.05)
    for i, (dx, col) in enumerate(((-0.25, "#E4443A"), (0.12, "#F2B33D"), (0.4, "#E4443A"))):
        sphere(f"side_fruit{i}", (-7.1 + dx, -1.9, 1.52), (0.2, 0.2, 0.19), col)
    cylinder("pot", (7.3, -1.8, 0.45), 0.55, 0.9, WORKSHOP_ORANGE)
    sphere("bush", (7.3, -1.8, 1.25), (0.75, 0.7, 0.62), "#5FB97A")

    report_anchors([
        ("borde mostrador (lab: 52%)", (0, -0.72, 1.02)),
        ("base mostrador (lab: 60%)", (0, -0.6, 0.0)),
        ("borde toldo", (0, -1.05, 4.5)),
    ])
    render_piece("m1_1-stall", (1024, 768), transparent=False, outline_px=2.2, wash=0.08)


def piece_m1_1_client():
    """Cliente 3:5, cuerpo entero, pies en el borde inferior."""
    reset_scene()
    daylight()
    camera(2.9, 0.0, (0, 0, 1.45))
    for i, x in enumerate((-0.2, 0.2)):
        box(f"leg{i}", (x, 0, 0.3), (0.26, 0.3, 0.6), INK_HEX, bevel=0.08)
    box("torso", (0, 0, 1.05), (1.0, 0.76, 1.04), "#3B82F6", bevel=0.2, subsurf=True)
    for i, x in enumerate((-0.6, 0.6)):
        box(f"arm{i}", (x, 0, 1.1), (0.24, 0.26, 0.7), "#3B82F6", bevel=0.1)
    cylinder("basket", (0.0, -0.48, 0.92), 0.3, 0.32, "#D9A26E")
    sphere("basket_apple", (0.05, -0.5, 1.14), (0.14, 0.14, 0.14), "#E4443A")
    sphere("head", (0, 0, 2.0), (0.5, 0.48, 0.5), SKIN_HEX)
    sphere("hair", (0, 0.06, 2.24), (0.53, 0.5, 0.33), "#7A5230")
    for i, x in enumerate((-0.17, 0.17)):
        sphere(f"eye{i}", (x, -0.45, 1.98), (0.075, 0.05, 0.09), INK_HEX)
        sphere(f"blush{i}", (x * 1.9, -0.4, 1.84), (0.09, 0.03, 0.06), BLUSH_HEX)
    render_piece("m1_1-client", (120, 200), transparent=True, outline_px=1.1,
                 supersample=SPRITE_SUPERSAMPLE)


def piece_m1_1_apple():
    reset_scene()
    daylight()
    camera(2.5, 12.0, (0, 0, 1.05))
    sphere("apple", (0, 0, 0.95), (1.02, 0.98, 0.92), "#E4443A")
    cylinder("stem", (0.04, 0, 1.95), 0.07, 0.45, "#7A5230", rotation=(0, R(14), 0), vertices=12)
    sphere("leaf", (0.34, -0.02, 1.98), (0.34, 0.08, 0.16), "#3FAE5A", rotation=(0, R(-28), 0))
    no_ink(sphere("shine", (-0.38, -0.88, 1.3), (0.12, 0.06, 0.2), "#FFE1DA"))
    render_piece("m1_1-apple", (96, 96), transparent=True, outline_px=0.9,
                 supersample=SPRITE_SUPERSAMPLE)


def piece_m1_1_sign():
    """Cartel 5:2 con el centro despejado (~80 % de ancho) para la cifra del precio."""
    reset_scene()
    daylight(0.75)
    camera(5.8, 0.0, (0, 0, 0))
    box("frame", (0, 0, 0), (5.4, 0.28, 2.05), "#A86B3C", bevel=0.14)
    box("panel", (0, -0.12, 0), (4.7, 0.2, 1.5), "#FFF6E3", bevel=0.1)
    for i, (x, z) in enumerate(((-2.42, 0.78), (2.42, 0.78), (-2.42, -0.78), (2.42, -0.78))):
        sphere(f"nail{i}", (x, -0.18, z), (0.07, 0.05, 0.07), "#8A96A8")
    sphere("leaf_a", (-2.35, -0.25, 0.86), (0.28, 0.07, 0.13), "#3FAE5A", rotation=(0, R(25), 0))
    sphere("leaf_b", (-2.05, -0.25, 0.95), (0.24, 0.07, 0.11), "#5FB97A", rotation=(0, R(-20), 0))
    sphere("apple", (2.3, -0.28, 0.86), (0.2, 0.2, 0.19), "#E4443A")
    render_piece("m1_1-sign", (400, 160), transparent=True, outline_px=1.3, supersample=2)


# ─── m1_2 · Taller de Velas ──────────────────────────────────────────────────
def piece_m1_2_workshop():
    """Fondo 4:3. Se ve la franja central; la vela del lab va al centro (32–68 % x)."""
    reset_scene()
    daylight()
    # elev 10°, target z 2.97 → encuentro pared/suelo (y=3, z=0) en y≈70 %.
    camera(16.0, 10.0, (0, 0, 2.97))
    plane("floor", (0, -8, 0), (26, 24), "#E7B98A")
    box("wall", (0, 3.1, 4.5), (26, 0.2, 9.0), "#FCE9D8", bevel=0.0)
    box("wainscot", (0, 2.95, 0.6), (26, 0.12, 1.2), "#F4D2B2", bevel=0.02)
    box("trim", (0, 2.88, 1.23), (26, 0.1, 0.12), WORKSHOP_ORANGE, bevel=0.02)

    # Izquierda: banco de trabajo, olla de cera, moldes, estante de herramientas
    box("bench_top", (-5.8, 1.6, 1.8), (3.8, 1.5, 0.22), "#C98B55", bevel=0.05)
    for i, x in enumerate((-7.4, -4.2)):
        box(f"bench_leg{i}", (x, 1.0, 0.85), (0.24, 0.24, 1.7), "#A86B3C", bevel=0.04)
    cylinder("wax_pot", (-6.6, 1.5, 2.3), 0.55, 0.8, WORKSHOP_ORANGE)
    cylinder("wax", (-6.6, 1.5, 2.72), 0.46, 0.06, "#FFD7A8")
    for i, x in enumerate((-5.4, -4.7)):
        box(f"mold{i}", (x, 1.4, 2.12), (0.5, 0.5, 0.42), "#E9C9A0", bevel=0.04)
    box("tool_rack", (-5.8, 2.95, 3.9), (3.4, 0.14, 0.3), "#C98B55", bevel=0.03)
    for i, x in enumerate((-6.9, -5.8, -4.7)):
        cylinder(f"tool{i}", (x, 2.8, 3.25), 0.06, 1.0, "#8A96A8", vertices=10)
        box(f"tool_head{i}", (x, 2.8, 2.7), (0.36, 0.12, 0.2), "#A86B3C", bevel=0.03)
    box("crate", (-7.8, -0.4, 0.5), (1.3, 1.1, 1.0), "#D9A26E", bevel=0.06)

    # Derecha: estantería con "velas" de cera con forma de vela japonesa (guiño)
    box("shelf_back", (5.9, 2.9, 2.7), (3.9, 0.12, 5.4), "#E0B387", bevel=0.03)
    for i, x in enumerate((4.0, 7.8)):
        box(f"shelf_side{i}", (x, 2.3, 2.7), (0.18, 1.2, 5.4), "#C98B55", bevel=0.03)
    shelf_z = (0.1, 1.55, 3.0, 4.45)
    for i, z in enumerate(shelf_z):
        box(f"shelf{i}", (5.9, 2.3, z), (3.8, 1.15, 0.12), "#C98B55", bevel=0.02)
    candles = [  # (x, nivel, cuerpo_h, color)
        (4.7, 0, 0.9, "#4CC38A"), (5.5, 0, 0.6, "#EF6B5B"), (6.3, 0, 1.05, "#4CC38A"), (7.1, 0, 0.7, "#EF6B5B"),
        (4.8, 1, 0.7, "#EF6B5B"), (5.7, 1, 1.0, "#4CC38A"), (6.6, 1, 0.55, "#4CC38A"),
        (4.9, 2, 1.0, "#4CC38A"), (5.9, 2, 0.8, "#EF6B5B"), (6.9, 2, 0.95, "#4CC38A"),
    ]
    for i, (x, lvl, hgt, col) in enumerate(candles):
        base = shelf_z[lvl] + 0.06
        wick = 0.18
        cylinder(f"wick_lo{i}", (x, 2.2, base + wick / 2), 0.035, wick, INK_HEX, vertices=8)
        box(f"candle{i}", (x, 2.2, base + wick + hgt / 2), (0.36, 0.36, hgt), col, bevel=0.05)
        cylinder(f"wick_hi{i}", (x, 2.2, base + wick + hgt + wick / 2), 0.035, wick, INK_HEX, vertices=8)

    # Faroles en el borde de la zona de la vela del lab
    for i, x in enumerate((-3.1, 3.1)):
        cylinder(f"lantern_cord{i}", (x, 2.5, 6.4), 0.03, 1.8, INK_HEX, vertices=8)
        box(f"lantern{i}", (x, 2.5, 5.2), (0.55, 0.55, 0.75), "#FFE3B3", bevel=0.12)
        box(f"lantern_cap{i}", (x, 2.5, 5.66), (0.66, 0.66, 0.16), WORKSHOP_ORANGE, bevel=0.05)
    render_piece("m1_2-workshop", (1024, 768), transparent=False, outline_px=2.2, wash=0.1)


# ─── m1_3 · Observatorio ─────────────────────────────────────────────────────
def piece_m1_3_observatory():
    """Fondo 5:3. El gráfico del lab cruza todo el ancho: fondo claro, detalle lateral."""
    reset_scene()
    daylight(0.75)
    # elev 8°, target z 2.55 → encuentro pared/suelo en y≈72 %.
    camera(16.0, 8.0, (0, 0, 2.55))
    plane("floor", (0, -8, 0), (26, 24), "#DDD6F6")
    box("wall", (0, 3.1, 3.8), (26, 0.2, 7.6), "#E6DFFF", bevel=0.0)
    box("wainscot", (0, 2.95, 0.5), (26, 0.12, 1.0), "#D6CCF8", bevel=0.02)
    box("trim", (0, 2.88, 1.03), (26, 0.1, 0.12), OBSERVATORY_VIOLET, bevel=0.02)

    # Izquierda: ventana redonda con cielo diurno y nubes. Su borde superior queda
    # por debajo de la etiqueta "Estructura del precio" del lab (arriba-izq, y≈27 %),
    # que sobre el aro violeta no se leía (medido en el navegador). El borde inferior
    # queda justo sobre el zócalo (z≈1.14 > 1.09).
    win_x, win_z = -5.4, 2.59
    cylinder("window_glass", (win_x, 3.0, win_z), 1.3, 0.05, "#D6ECFF", rotation=(R(90), 0, 0))
    torus("window_frame", (win_x, 2.95, win_z), 1.35, 0.1, OBSERVATORY_VIOLET, rotation=(R(90), 0, 0))
    for i, (dx, dz, s) in enumerate(((-0.38, 0.27, 0.38), (0.42, -0.2, 0.29))):
        sphere(f"cloud{i}", (win_x + dx, 2.9, win_z + dz), (s * 1.6, 0.05, s * 0.6), WHITE_HEX)
    for i, ang in enumerate((0, 90)):
        box(f"mullion{i}", (win_x, 2.93, win_z), (0.07, 0.04, 2.6), "#C9BDF7", bevel=0.0,
            rotation=(0, R(ang), 0))
    box("bookshelf", (-7.5, 2.5, 1.4), (1.1, 1.0, 2.8), "#B99CEB", bevel=0.05)
    for i, z in enumerate((0.8, 1.7, 2.5)):
        box(f"books{i}", (-7.5, 2.0, z), (0.85, 0.1, 0.5), ("#8B72FF", "#F2B33D", "#4CC38A")[i], bevel=0.02)

    # Derecha: telescopio en trípode apuntando hacia arriba
    tube_rot = (0, R(-38), 0)
    cylinder("tube", (5.2, 1.4, 3.05), 0.36, 3.4, "#FFFFFF", rotation=tube_rot)
    torus("tube_ring", (4.35, 1.4, 4.13), 0.4, 0.07, OBSERVATORY_VIOLET, rotation=tube_rot)
    cylinder("lens", (4.18, 1.4, 4.34), 0.42, 0.22, OBSERVATORY_VIOLET, rotation=tube_rot)
    cylinder("eyepiece", (6.25, 1.4, 1.75), 0.14, 0.5, INK_HEX, rotation=tube_rot, vertices=16)
    for i, (fx, fy) in enumerate(((-0.9, 0.2), (0.9, 0.2), (0.0, -0.8))):
        top = Vector((5.4, 1.4, 2.5))
        foot = Vector((5.4 + fx, 1.4 + fy, 0.0))
        mid = (top + foot) / 2
        d = top - foot
        obj = cylinder(f"leg{i}", tuple(mid), 0.06, d.length, "#A89BD6", vertices=10)
        obj.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    # Globo terráqueo al borde derecho
    cylinder("globe_stand", (7.1, 1.2, 0.5), 0.1, 1.0, "#A89BD6", vertices=12)
    sphere("globe", (7.1, 1.2, 1.35), (0.6, 0.6, 0.6), "#9FD3F5")
    torus("globe_ring", (7.1, 1.2, 1.35), 0.7, 0.05, OBSERVATORY_VIOLET, rotation=(R(70), 0, R(20)))
    render_piece("m1_3-observatory", (1024, 614), transparent=False, outline_px=2.2, wash=0.05)


# ─── m1_4 · La Bóveda ────────────────────────────────────────────────────────
def piece_m1_4_vault():
    """Fondo ~3:2. Encima: etiqueta + monedas arriba-izq, % a la derecha, barra abajo."""
    reset_scene()
    daylight()
    # elev 8°, target z 3.0 → encuentro pared/suelo en y≈74 %.
    camera(16.0, 8.0, (0, 0, 3.0))
    plane("floor", (0, -8, 0), (26, 24), "#CBD8E8")
    box("wall", (0, 3.1, 4.2), (26, 0.2, 8.4), "#D9E5F3", bevel=0.0)
    for i, z in enumerate((1.4, 3.7, 6.0)):
        no_ink(box(f"seam{i}", (0, 2.97, z), (26, 0.06, 0.1), "#C4D3E6", bevel=0.01))
    box("baseboard", (0, 2.9, 0.3), (26, 0.12, 0.6), "#B9CBE2", bevel=0.02)

    # Escotilla acorazada en la zona libre de GaugeLab. Cómo se eligió (probado en
    # el navegador en 3 anchos, porque el recorte de `cover` cambia con el ancho):
    #   · a la derecha tapaba el % de riesgo o la nota "línea = 2%…" según el ancho;
    #   · al centro, en móvil la etiqueta "CAPITAL EN RIESGO" ocupa ~la mitad del
    #     ancho y el aro la cruzaba;
    #   · la única región sin textos en móvil, panel y escritorio ancho es entre la
    #     fila de monedas y el %: x≈50–72 %, y≈22–52 % de la imagen. Ahí va, montada
    #     en la pared sobre una placa sin tinta (sus bordes no rayan ningún texto).
    # Las monedas pueden pasar por encima: son grandes y con contorno, se leen igual.
    door_c = (1.76, 2.6, 4.04)
    dr = 1.5  # radio de la hoja
    rot = (R(90), 0, 0)
    no_ink(box("door_plate", (door_c[0], 2.8, door_c[2]), (4.3, 0.1, 4.3), "#CEDBEB", bevel=0.3))
    cylinder("door", door_c, dr, 0.5, "#EDF2F8", rotation=rot, vertices=64)
    torus("door_rim", (door_c[0], door_c[1] - 0.3, door_c[2]), dr + 0.02, 0.24, VAULT_BLUE, rotation=rot)
    torus("door_inner", (door_c[0], door_c[1] - 0.3, door_c[2]), dr * 0.71, 0.07, "#9FB3CC", rotation=rot)
    for k in range(8):
        a = R(k * 45 + 22.5)
        sphere(f"bolt{k}", (door_c[0] + dr * 0.85 * math.cos(a), door_c[1] - 0.34,
                            door_c[2] + dr * 0.85 * math.sin(a)), (0.11, 0.07, 0.11), "#9FB3CC")
    torus("wheel", (door_c[0], door_c[1] - 0.45, door_c[2]), dr * 0.39, 0.08, "#7F95B3", rotation=rot)
    for k in range(3):
        box(f"spoke{k}", (door_c[0], door_c[1] - 0.45, door_c[2]), (dr * 0.78, 0.08, 0.09), "#7F95B3",
            bevel=0.02, rotation=(0, R(k * 60), 0))
    cylinder("hub", (door_c[0], door_c[1] - 0.5, door_c[2]), dr * 0.16, 0.2, VAULT_BLUE, rotation=rot)

    # Izquierda: pila de lingotes de oro + saco
    for row, count in enumerate((4, 3, 2, 1)):
        for j in range(count):
            x = -6.9 + (4 - count) * 0.33 + j * 0.66
            box(f"bar{row}_{j}", (x, 0.9, 0.18 + row * 0.38), (0.6, 0.55, 0.34), "#F2B33D", bevel=0.06)
    sphere("sack", (-4.6, 0.6, 0.7), (0.75, 0.7, 0.72), "#E9D3A6")
    sphere("sack_knot", (-4.6, 0.6, 1.45), (0.22, 0.2, 0.18), "#C9A46B")
    sphere("sack_coin", (-4.2, 0.0, 0.25), (0.28, 0.08, 0.28), GOLD_HEX)
    rim_y = door_c[1] - 0.3
    report_anchors([  # zona libre medida: x≈50–72 %, y≈22–52 %
        ("aro izquierdo (≥50%)", (door_c[0] - dr - 0.26, rim_y, door_c[2])),
        ("aro derecho (≤72%)", (door_c[0] + dr + 0.26, rim_y, door_c[2])),
        ("aro superior (≈22%, puede recortarse en escritorio)", (door_c[0], rim_y, door_c[2] + dr + 0.26)),
        ("aro inferior (≤52%)", (door_c[0], rim_y, door_c[2] - dr - 0.26)),
    ])
    render_piece("m1_4-vault", (1024, 683), transparent=False, outline_px=2.2, wash=0.05)


def piece_m1_4_coin():
    reset_scene()
    daylight(0.75)
    camera(2.35, 0.0, (0, 0, 0))
    rot = (R(90), 0, R(18))
    cylinder("coin", (0, 0, 0), 1.0, 0.22, GOLD_HEX, rotation=rot, vertices=64)
    torus("ring", (0, -0.12, 0), 0.74, 0.06, "#B9760A", rotation=rot)
    cylinder("emblem", (0, -0.1, 0), 0.4, 0.26, "#F6B83A", rotation=rot, vertices=48)
    no_ink(sphere("shine", (-0.42, -0.24, 0.45), (0.13, 0.05, 0.2), "#FFF4D6"))
    render_piece("m1_4-coin", (96, 96), transparent=True, outline_px=0.9,
                 supersample=SPRITE_SUPERSAMPLE)


PIECES = {
    "m1_1-stall": piece_m1_1_stall,
    "m1_1-client": piece_m1_1_client,
    "m1_1-apple": piece_m1_1_apple,
    "m1_1-sign": piece_m1_1_sign,
    "m1_2-workshop": piece_m1_2_workshop,
    "m1_3-observatory": piece_m1_3_observatory,
    "m1_4-vault": piece_m1_4_vault,
    "m1_4-coin": piece_m1_4_coin,
}


def main():
    names = [n for n in PIECES if ONLY is None or n in ONLY]
    unknown = (ONLY or set()) - set(PIECES)
    if unknown:
        print(f"[TraderPath] Piezas desconocidas: {sorted(unknown)}")
    for name in names:
        print(f"[TraderPath] ▶ {name}")
        PIECES[name]()


main()
