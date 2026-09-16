# build_mission_art.py — TraderPath · arte de escena de las misiones (Niveles 1–2)
#
# Renderiza las piezas del contrato de public/assets/missions/README.md para los
# Niveles 1 y 2 (Isla de Academia Ágora): fondos por distrito + figuras repetidas.
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



# renders/blender/ al sys.path: Blender ejecuta el script con --python y no
# añade su carpeta, así que sin esto no encontraría manual_overrides.
try:
    _HERE = os.path.dirname(os.path.abspath(__file__))
except NameError:  # pegado en la pestaña Scripting
    _HERE = bpy.path.abspath("//")
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)
from manual_overrides import skip_generated

ONLY = set(_arg_value("--only").split(",")) if _arg_value("--only") else None
PREVIEW = "--preview" in ARGS
# Con --force se regenera también lo que tengas hecho a mano en renders/assets/.
FORCE = "--force" in ARGS
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
    out = os.path.normpath(os.path.join(base, "..", "..", "public", "assets", "missions"))
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
    flush_anchors()
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


_PENDING_ANCHORS = []


def report_anchors(anchors):
    """Registra puntos del mundo para informar dónde caen en la imagen.

    Se imprimen en `flush_anchors`, llamado cuando la resolución de la pieza ya
    está fijada: la proyección ortográfica depende de la proporción de la imagen,
    y calcularla antes usaba la resolución de la pieza anterior (o 16:9).
    """
    _PENDING_ANCHORS.extend(anchors)


def flush_anchors():
    scene = bpy.context.scene
    for label, co in _PENDING_ANCHORS:
        v = world_to_camera_view(scene, scene.camera, Vector(co))
        print(f"[TraderPath]   ancla {label}: x={v.x * 100:.1f}% y={100 - v.y * 100:.1f}%")
    _PENDING_ANCHORS.clear()


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


# ═════════════════════════════════════════════════════════════════════════════
# NIVEL 2
# ═════════════════════════════════════════════════════════════════════════════
# LevelLab (m2_1, m2_2). Zonas medidas en el navegador a 375 y 1280 px, en % de
# la imagen (unión de ambos anchos):
#   · encabezado (etiqueta + titular, que en móvil se parte en 2 líneas y ocupa el
#     centro): y≈10–37 % A LO ANCHO → ahí sólo formas suaves NoInk, nada de tinta;
#   · banda/línea del nivel: y≈52–68 % → sin bordes horizontales;
#   · panel blanco al 40 %: y≈36–91 % (suaviza lo que tiene detrás).
# Orden resultante: fondo suave arriba (≤46 %), suelo liso 46–69 %, detalle con
# tinta abajo (≥69 %): en escritorio casi no asoma y en móvil llena la escena.
# Cámara a 30°: f(y, z) = 0.5 − (0.5·y + 0.866·z) / 9.6  (fracción desde arriba).
LEVEL_LAB_CAM = dict(ortho_scale=16.0, elev_deg=30.0, target=(0, 0, 0))


def piece_m2_1_plaza():
    """Mercado Plaza (zonas de oferta y demanda) · acento verde."""
    reset_scene()
    daylight()
    camera(**LEVEL_LAB_CAM)

    # Arriba, casi uniforme y sin tinta: césped y copas muy pálidos. El titular del
    # lab cambia de color con el estado (verde/rojo/gris) y en móvil cruza el centro:
    # sobre un techo verde el titular verde no se leía (medido). Las casas van a los
    # bordes extremos (x<10 % / >90 %), fuera del alcance de los textos.
    no_ink(plane("lawn", (0, 6.5, -0.01), (32, 12), "#DDF1E2"))
    for i, (x, y, r, col) in enumerate(((-6.6, 6.0, 1.5, "#CDEBD6"), (6.9, 7.2, 1.8, "#D5EFDD"),
                                        (-2.2, 9.0, 1.3, "#D5EFDD"), (2.9, 8.4, 1.2, "#CDEBD6"))):
        no_ink(sphere(f"tree{i}", (x, y, r), (r, r, r * 0.9), col))
    for i, (x, col) in enumerate(((-7.9, "#F4EEDB"), (7.9, "#E3EDF6"))):
        no_ink(box(f"house{i}", (x, 4.6, 0.8), (2.2, 1.6, 1.6), col, bevel=0.1))
        no_ink(box(f"house_roof{i}", (x, 4.6, 1.8), (2.5, 1.9, 0.5), "#CDEBD6", bevel=0.15))

    # Borde de la plaza: setos bajos con tinta en y≈42–46 % (sobre la banda).
    for i, x in enumerate((-6.0, 0.0, 6.0)):
        box(f"hedge{i}", (x, 1.0, 0.25), (4.2, 0.5, 0.5), "#5FB97A", bevel=0.12)

    # Suelo liso de la plaza (detrás de la banda del nivel).
    plane("plaza", (0, -5.6, 0), (32, 12.8), "#D8DFE8")
    for i, (x, y) in enumerate(((-3.0, -1.2), (2.6, -2.4), (-5.8, -3.0), (5.4, -0.8), (0.4, -3.3))):
        no_ink(cylinder(f"cobble{i}", (x, y, 0.01), 0.5, 0.02, "#CAD3DE"))

    # Abajo, con detalle: fuente central y puestos a los lados.
    fz = -6.3
    cylinder("basin", (0, fz, 0.2), 1.6, 0.4, "#C9D3DF")
    cylinder("water", (0, fz, 0.38), 1.38, 0.06, "#93D6EF")
    cylinder("spout", (0, fz, 0.8), 0.18, 0.9, "#C9D3DF", vertices=16)
    cylinder("bowl", (0, fz, 1.3), 0.5, 0.15, "#C9D3DF")
    for i, sx in enumerate((-6.4, 6.4)):
        for j, dx in enumerate((-1.25, 1.25)):
            cylinder(f"stall{i}_post{j}", (sx + dx, -8.6, 1.05), 0.1, 2.1, "#B97A4A", vertices=12)
        box(f"stall{i}_counter", (sx, -8.0, 0.45), (2.8, 1.0, 0.9), "#E1B07C", bevel=0.05)
        for k in range(3):
            col = PLAZA_GREEN if k % 2 == 0 else "#FFF3DC"
            box(f"stall{i}_awning{k}", (sx - 0.95 + k * 0.95, -8.0, 2.05), (0.95, 1.5, 0.1), col,
                bevel=0.02, rotation=(R(-12), 0, 0))
        for k, (dx, col) in enumerate(((-0.8, "#E4443A"), (-0.25, "#F2B33D"), (0.3, "#E4443A"), (0.85, "#7DCB92"))):
            sphere(f"stall{i}_fruit{k}", (sx + dx, -8.1, 1.05), (0.2, 0.2, 0.19), col)
    for i, x in enumerate((-3.2, 3.2)):
        box(f"crate{i}", (x, -8.9, 0.35), (1.0, 0.8, 0.7), "#C98B55", bevel=0.05)
        sphere(f"crate_fruit{i}", (x, -9.0, 0.82), (0.22, 0.22, 0.2), "#E4443A")

    report_anchors([
        ("tope setos (encabezado termina en ~37%)", (0, 0.75, 0.5)),
        ("base setos = inicio del suelo liso (≈46%)", (0, 0.75, 0.0)),
        ("tope fuente (≥69%)", (0, fz + 1.6, 0.4)),
        ("tope toldos (≥69%)", (6.4, -7.25, 2.2)),
    ])
    render_piece("m2_1-plaza", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m2_2_observatory():
    """Observatorio (soporte/resistencia, modo línea) · acento violeta."""
    reset_scene()
    daylight(0.7)
    camera(**LEVEL_LAB_CAM)

    # Pared del fondo: base con tinta en ≈46 %; decoración de la franja superior
    # sin tinta (cartas celestes y cúpula pintada), para no rayar el encabezado.
    box("wall", (0, 1.1, 2.6), (32, 0.2, 5.2), "#E6DFFF", bevel=0.0)
    no_ink(cylinder("dome_window", (0, 1.0, 3.9), 2.4, 0.04, "#D6ECFF", rotation=(R(90), 0, 0)))
    for i, (x, z, r) in enumerate(((-5.6, 3.3, 1.1), (5.8, 3.6, 1.3), (-2.9, 4.6, 0.55), (3.1, 4.7, 0.6))):
        no_ink(cylinder(f"chart{i}", (x, 1.0, z), r, 0.04, "#D9CFFA", rotation=(R(90), 0, 0)))
        no_ink(torus(f"chart_ring{i}", (x, 0.98, z), r * 0.62, 0.035, "#C4B6F4", rotation=(R(90), 0, 0)))

    # Suelo liso (detrás de la línea del nivel) + alfombra suave.
    plane("floor", (0, -5.5, 0), (32, 13), "#DDD6F6")
    no_ink(cylinder("rug", (0, -7.2, 0.01), 2.6, 0.02, "#D0C6F3"))

    # Abajo, con detalle: librería, globo, telescopio y mesa con astrolabio.
    box("bookshelf", (-6.3, -8.5, 1.1), (2.2, 1.2, 2.2), "#B99CEB", bevel=0.05)
    for i, (z, col) in enumerate(((0.55, "#8B72FF"), (1.25, "#F2B33D"), (1.9, "#4CC38A"))):
        box(f"books{i}", (-6.3, -9.12, z), (1.8, 0.08, 0.42), col, bevel=0.02)
    cylinder("globe_stand", (-3.5, -9.4, 0.35), 0.08, 0.7, "#A89BD6", vertices=12)
    sphere("globe", (-3.5, -9.4, 0.95), (0.45, 0.45, 0.45), "#9FD3F5")
    torus("globe_ring", (-3.5, -9.4, 0.95), 0.53, 0.04, OBSERVATORY_VIOLET, rotation=(R(70), 0, R(20)))

    cylinder("table_leg", (0.2, -10.2, 0.4), 0.12, 0.8, "#A89BD6", vertices=12)
    cylinder("table_top", (0.2, -10.2, 0.85), 0.9, 0.1, "#C9BDF7")
    torus("astrolabe", (0.2, -10.2, 1.25), 0.34, 0.05, OBSERVATORY_VIOLET, rotation=(R(90), 0, R(25)))
    sphere("astrolabe_core", (0.2, -10.2, 1.25), (0.1, 0.1, 0.1), "#F2B33D")

    tube_rot = (0, R(-40), 0)
    cylinder("tube", (6.1, -8.6, 1.55), 0.28, 2.0, WHITE_HEX, rotation=tube_rot)
    cylinder("lens", (5.45, -8.6, 2.3), 0.33, 0.18, OBSERVATORY_VIOLET, rotation=tube_rot)
    for i, (fx, fy) in enumerate(((-0.6, 0.3), (0.6, 0.3), (0.0, -0.6))):
        top = Vector((6.3, -8.6, 1.2))
        foot = Vector((6.3 + fx, -8.6 + fy, 0.0))
        d = top - foot
        leg = cylinder(f"tripod{i}", tuple((top + foot) / 2), 0.05, d.length, "#A89BD6", vertices=10)
        leg.rotation_euler = d.to_track_quat("Z", "Y").to_euler()

    report_anchors([
        ("base de la pared = inicio del suelo liso (≈46%)", (0, 1.0, 0.0)),
        ("tope librería (≥69%)", (-6.3, -7.9, 2.2)),
        ("lente telescopio (≥69%)", (5.45, -8.6, 2.45)),
    ])
    render_piece("m2_2-observatory", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m2_3_patterns():
    """Taller de patrones de vela · CandleLab. Columna central x≈33–67 % libre
    en toda la altura (vela + nombre del patrón, medido a 375 y 1280 px)."""
    reset_scene()
    daylight()
    camera(16.0, 10.0, (0, 0, 2.97))  # mismo encuadre que m1_2: suelo en y≈70 %
    plane("floor", (0, -8, 0), (26, 24), "#E7B98A")
    box("wall", (0, 3.1, 4.5), (26, 0.2, 9.0), "#FCE9D8", bevel=0.0)
    box("wainscot", (0, 2.95, 0.6), (26, 0.12, 1.2), "#F4D2B2", bevel=0.02)
    # Zócalo más pálido que en m1_2: queda justo bajo la vela y, en un doji, una raya
    # naranja fuerte se confunde con el cuerpo de la vela.
    box("trim", (0, 2.88, 1.23), (26, 0.1, 0.12), "#F2B48F", bevel=0.02)

    # Izquierda: pizarra con los tres patrones que enseña la misión, en tiza.
    box("board_frame", (-5.3, 2.92, 3.6), (4.0, 0.16, 3.0), "#A86B3C", bevel=0.06)
    box("board", (-5.3, 2.82, 3.6), (3.6, 0.1, 2.6), "#4E7D6B", bevel=0.02)
    box("chalk_tray", (-5.3, 2.7, 2.2), (3.6, 0.3, 0.08), "#C98B55", bevel=0.02)
    chalk = "#F4F0E6"
    # (x, cuerpo_z, cuerpo_h, mecha_z0, mecha_z1, color): martillo, doji, estrella fugaz
    patterns = ((-6.4, 4.15, 0.4, 2.85, 4.5, "#7FD6A4"),
                (-5.3, 3.6, 0.06, 2.8, 4.4, chalk),
                (-4.2, 3.05, 0.4, 2.7, 4.35, "#F28B7E"))
    for i, (x, bz, bh, w0, w1, col) in enumerate(patterns):
        box(f"pattern_wick{i}", (x, 2.74, (w0 + w1) / 2), (0.05, 0.02, w1 - w0), chalk, bevel=0.0)
        box(f"pattern_body{i}", (x, 2.72, bz), (0.4, 0.05, bh), col, bevel=0.0)

    # Derecha: atril con el libro de patrones, libros en el suelo y una planta.
    # Atril inclinado hacia la cámara para que el libro abierto se lea como libro.
    cylinder("lectern_post", (5.6, 1.6, 0.8), 0.12, 1.6, "#A86B3C", vertices=16)
    box("lectern_top", (5.6, 1.45, 1.78), (1.9, 1.3, 0.1), "#C98B55", bevel=0.03, rotation=(R(-40), 0, 0))
    for i, (dx, tilt) in enumerate(((-0.44, 8), (0.44, -8))):
        box(f"book_page{i}", (5.6 + dx, 1.36, 1.9), (0.84, 1.08, 0.06), "#FFF6E3", bevel=0.02,
            rotation=(R(-40), R(tilt), 0))
    box("ribbon", (5.6, 1.08, 1.55), (0.07, 0.04, 0.55), "#DC2626", bevel=0.0)
    for i, (z, col) in enumerate(((0.15, "#8B72FF"), (0.42, "#F2B33D"), (0.66, "#4CC38A"))):
        box(f"floor_book{i}", (7.4, 1.1, z), (1.2, 0.9, 0.24), col, bevel=0.04)
    cylinder("pot", (4.0, 0.4, 0.35), 0.45, 0.7, WORKSHOP_ORANGE)
    sphere("bush", (4.0, 0.4, 1.0), (0.6, 0.55, 0.5), "#5FB97A")

    for i, x in enumerate((-3.4, 3.4)):
        cylinder(f"lantern_cord{i}", (x, 2.5, 6.4), 0.03, 1.8, INK_HEX, vertices=8)
        box(f"lantern{i}", (x, 2.5, 5.2), (0.55, 0.55, 0.75), "#FFE3B3", bevel=0.12)
        box(f"lantern_cap{i}", (x, 2.5, 5.66), (0.66, 0.66, 0.16), WORKSHOP_ORANGE, bevel=0.05)

    report_anchors([
        ("borde der. pizarra (≤33%)", (-3.3, 2.92, 3.6)),
        ("farol izq. borde der. (≤33%)", (-3.12, 2.5, 5.2)),
        ("farol der. borde izq. (≥67%)", (3.12, 2.5, 5.2)),
        ("maceta borde izq. (≥67%)", (3.55, 0.4, 0.35)),
    ])
    render_piece("m2_3-patterns", (1024, 768), transparent=False, outline_px=2.2, wash=0.08)


# ═════════════════════════════════════════════════════════════════════════════
# NIVEL 3 · CRYPTO — Ciudad Bitcoin (Conchagua, El Salvador) · acento #F7931A
# ═════════════════════════════════════════════════════════════════════════════
# LevelLab en modo `meter` (m3c_2..m3c_4): la tarjeta mide ~110 px de alto.
# Medido a 375 y 1280 px, en % de la imagen:
#   · visible: escritorio y≈35–65 %; móvil y≈12–88 % o 18–82 % (según si el
#     titular se parte en dos líneas);
#   · fila de textos y≈24–47 % a todo lo ancho; barra (opaca) y≈47–67 %;
#     nota "línea = umbral" x≈68–97 %, y≈56–77 %;
#   · libre para detalle: abajo a la izquierda y≈67–82 %, x≤64 %, y una tira
#     superior y≈18–23 % que sólo asoma en móvil.
# El arte aquí es sobre todo ambientación de color; la identidad va abajo-izq.
# Cámara recta: f = 0.5 − (z − 4.8) / 9.6 → z 5.1–7.4 tranquilo, z 1.7–3.1 detalle.
CRYPTO = "#F7931A"
METER_CAM = dict(ortho_scale=16.0, elev_deg=0.0, target=(0, 0, 4.8))


def btc_glyph(prefix, center, height, color, depth_y):
    """₿ geométrico (sin depender de fuentes): trazo, dos lóbulos y remates."""
    cx, cy, cz = center
    h = height
    box(f"{prefix}_stem", (cx - 0.18 * h, cy, cz), (0.14 * h, depth_y, h * 0.86), color, bevel=0.0)
    for i, dz in enumerate((0.2, -0.2)):
        box(f"{prefix}_lobe{i}", (cx + 0.02 * h, cy, cz + dz * h), (0.36 * h, depth_y, 0.3 * h), color,
            bevel=0.08 * h)
    for i, dz in enumerate((0.5, -0.5)):
        for j, dx in enumerate((-0.2, 0.0)):
            box(f"{prefix}_tick{i}_{j}", (cx + dx * h, cy, cz + dz * h), (0.06 * h, depth_y, 0.14 * h), color,
                bevel=0.0)


def piece_m3c_1_plaza_bloque():
    """GaugeLab (misma zona libre que m1_4: x≈50–72 %, y≈22–52 %).
    Torre de bloques encadenados en la Plaza del Bloque, volcán suave al fondo."""
    reset_scene()
    daylight()
    camera(16.0, 8.0, (0, 0, 3.0))
    sky_plane("sky", (0, 70, 10), (120, 60), "#FFE7C2")
    # Fondo sin tinta (sus bordes no rayan textos): volcán, mar y palmeras lejanas.
    # Volcán más pequeño, claro y a la izquierda: grande y oscuro dominaba la escena
    # y apagaba la etiqueta "Tu posición" (visto en el lab, móvil).
    no_ink(cone("volcano", (-6.0, 40, 3.5), 7.0, 1.4, 7.0, "#F2CDA8"))
    no_ink(cone("volcano_cap", (-6.0, 40, 7.3), 1.5, 0.9, 0.8, "#F9A94D"))
    no_ink(plane("sea", (0, 30, -0.02), (80, 30), "#BFE6F0"))
    for i, x in enumerate((-8.6, 8.8)):
        no_ink(cylinder(f"palm_trunk{i}", (x, 13, 1.4), 0.12, 2.8, "#D9B08A"))
        no_ink(sphere(f"palm_crown{i}", (x, 13, 3.0), (1.1, 1.1, 0.5), "#BFE3B0"))
    # Plaza (borde lejano sin tinta: la línea del horizonte cruzaría el % en móvil).
    no_ink(plane("plaza", (0, 1.5, 0), (40, 27), "#F1DCC0"))
    for i, (x, y) in enumerate(((-6.2, -2.0), (-3.4, 4.0), (5.8, 1.5), (7.4, -3.5), (-1.2, -5.0))):
        no_ink(cylinder(f"tile{i}", (x, y, 0.01), 0.7, 0.02, "#E8CDA9"))

    # Motivo: torre de tres bloques encadenados sobre pedestal (x 51–68 %).
    tx, ty = 1.76, 3.0
    cylinder("pedestal", (tx, ty, 0.3), 1.35, 0.6, "#E8CDA9")
    colors = (CRYPTO, "#FFF3DC", CRYPTO)
    for i, col in enumerate(colors):
        z = 1.55 + i * 2.1
        box(f"block{i}", (tx, ty, z), (1.9, 1.9, 1.7), col, bevel=0.18)
        if i < 2:
            torus(f"link{i}", (tx, ty - 0.2, z + 1.05), 0.32, 0.09, "#8A96A8", rotation=(R(90), 0, 0))
    btc_glyph("glyph", (tx, ty - 0.98, 3.65), 1.1, CRYPTO, 0.06)

    report_anchors([
        ("torre borde izq. (≥50%)", (tx - 0.95, ty, 3.0)),
        ("torre borde der. (≤72%)", (tx + 0.95, ty, 3.0)),
        ("tope torre (≈22%)", (tx, ty, 1.55 + 2 * 2.1 + 0.85)),
        ("base pedestal", (tx, ty - 1.35, 0.0)),
    ])
    render_piece("m3c_1-plaza-bloque", (1024, 683), transparent=False, outline_px=2.2, wash=0.05)


def piece_m3c_1_coin():
    reset_scene()
    daylight(0.75)
    camera(2.35, 0.0, (0, 0, 0))
    rot = (R(90), 0, R(18))
    cylinder("coin", (0, 0, 0), 1.0, 0.22, GOLD_HEX, rotation=rot, vertices=64)
    torus("ring", (0, -0.12, 0), 0.78, 0.05, "#B9760A", rotation=rot)
    cylinder("emblem", (0, -0.1, 0), 0.62, 0.24, CRYPTO, rotation=rot, vertices=48)
    btc_glyph("glyph", (0.03, -0.26, 0.0), 0.8, "#FFFFFF", 0.05)
    no_ink(sphere("shine", (-0.5, -0.24, 0.5), (0.11, 0.05, 0.17), "#FFF4D6"))
    render_piece("m3c_1-coin", (96, 96), transparent=True, outline_px=0.9,
                 supersample=SPRITE_SUPERSAMPLE)


def _meter_backdrop(wall_hex, floor_hex):
    """Base común de los fondos en modo meter: pared lisa + suelo, cámara recta."""
    camera(**METER_CAM)
    box("wall", (0, 3.0, 5.0), (30, 0.2, 12.0), wall_hex, bevel=0.0)
    box("floor", (0, 0.0, 0.6), (30, 6.0, 1.2), floor_hex, bevel=0.0)


def piece_m3c_2_nexus():
    """Pantallas de mercado: reparto BTC / altcoins."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF1DE", "#F1DCC0")
    # Tira superior (sólo móvil): fila de pantallas con barras de reparto.
    for i, x in enumerate((-6.4, -3.2, 0.0, 3.2, 6.4)):
        box(f"top_screen{i}", (x, 2.7, 7.95), (2.6, 0.2, 1.0), "#3A4660", bevel=0.06)
        split = 0.35 + 0.1 * ((i * 7) % 5) / 4
        box(f"top_btc{i}", (x - 1.1 + 1.1 * split, 2.55, 7.95), (2.2 * split, 0.05, 0.6), CRYPTO, bevel=0.0)
        box(f"top_alt{i}", (x + 1.1 * split, 2.55, 7.95), (2.2 * (1 - split), 0.05, 0.6), "#C8D2DE", bevel=0.0)
    # Abajo-izquierda: quiosco con la pantalla grande del reparto de mercado.
    cylinder("kiosk_post", (-4.0, 2.2, 1.6), 0.12, 2.0, "#8A96A8", vertices=12)
    box("kiosk_screen", (-4.0, 2.0, 2.45), (4.4, 0.25, 1.4), "#3A4660", bevel=0.08)
    box("kiosk_btc", (-4.95, 1.84, 2.45), (2.3, 0.05, 1.0), CRYPTO, bevel=0.0)
    box("kiosk_alt", (-2.7, 1.84, 2.45), (1.6, 0.05, 1.0), "#C8D2DE", bevel=0.0)
    for i, (x, col) in enumerate(((-7.6, "#5FB97A"), (0.6, "#5FB97A"))):
        cylinder(f"pot{i}", (x, 1.4, 1.55), 0.35, 0.7, CRYPTO)
        sphere(f"plant{i}", (x, 1.4, 2.15), (0.5, 0.45, 0.45), col)
    # Moldura por DEBAJO de la nota "línea = umbral" (y≈70–77 %): a z 3.1 pasaba
    # justo encima del texto (visto en el lab, móvil).
    no_ink(box("trim", (0, 2.85, 1.35), (30, 0.06, 0.12), "#F6C58A", bevel=0.0))
    report_anchors([
        ("pantallas sup. borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("pantalla quiosco tope (≥67%)", (-4.0, 2.0, 3.15)),
        ("pantalla quiosco borde der. (≤64%)", (-1.8, 2.0, 2.45)),
        ("planta der. borde der. (≤64%)", (1.1, 1.4, 2.15)),
    ])
    render_piece("m3c_2-nexus", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3c_3_ciclo():
    """Ánimo del mercado al atardecer (contrato: 'de noche'; atardecer cálido para
    que el panel y los textos del lab se lean). Medidor analógico Fear & Greed."""
    reset_scene()
    daylight(0.6, key=1.6)
    camera(**METER_CAM)
    sky_plane("sky_mid", (0, 20, 5.0), (60, 30), "#FFE3C0")
    no_ink(sky_plane("sky_top", (0, 19.5, 9.4), (60, 3.2), "#F7C29B"))
    # Tira superior: siluetas de Ciudad Bitcoin y el volcán con resplandor. Todo con
    # base en z≥7.6 (y≤21 %): con la base en y≈43 % el volcán quedaba detrás de la
    # etiqueta "Termómetro de sentimiento" (visto en el lab, móvil).
    no_ink(cone("volcano", (-2.0, 15, 8.5), 3.6, 0.7, 1.8, "#D9B8C9"))
    no_ink(cone("volcano_glow", (-2.0, 14.8, 9.45), 0.75, 0.5, 0.25, "#F9A94D"))
    for i, (x, hgt, col) in enumerate(((-7.2, 1.0, "#B58DB6"), (-5.6, 1.4, "#C99BB0"), (4.4, 1.2, "#B58DB6"),
                                      (6.0, 1.6, "#C99BB0"), (7.6, 1.1, "#B58DB6"))):
        box(f"tower{i}", (x, 10, 7.6 + hgt / 2), (1.2, 1.0, hgt), col, bevel=0.05)
        box(f"window{i}", (x, 9.45, 7.6 + hgt / 2 + 0.1), (0.3, 0.05, 0.3), "#FFE3B3", bevel=0.0)
    # Suelo de la plaza.
    box("ground", (0, 2.0, 0.85), (30, 8.0, 1.7), "#E9C9A6", bevel=0.0)
    # Abajo-izquierda: medidor analógico de sentimiento (pánico → euforia).
    gx, gz = -4.0, 1.95
    for i, col in enumerate(("#DC2626", "#F28B3C", "#F2C14E", "#8CCB6E", "#16A34A")):
        a0 = R(180 - i * 36 - 18)
        seg = cylinder(f"dial_seg{i}", (gx + 1.25 * math.cos(a0), 1.2, gz + 1.25 * math.sin(a0)), 0.34, 0.14,
                       col, rotation=(R(90), 0, 0), vertices=20)
    box("dial_base", (gx, 1.25, gz - 0.2), (3.6, 0.3, 0.3), "#8A96A8", bevel=0.05)
    box("needle", (gx + 0.35, 1.05, gz + 0.55), (0.1, 0.06, 1.2), INK_HEX, bevel=0.0, rotation=(0, R(-30), 0))
    sphere("needle_hub", (gx, 1.0, gz + 0.02), (0.16, 0.08, 0.16), INK_HEX)
    report_anchors([
        ("siluetas borde inf. (≤23%)", (0, 10, 7.6)),
        ("medidor tope (≥67%)", (gx, 1.2, gz + 1.25 + 0.34)),
        ("medidor borde der. (≤64%)", (gx + 1.8, 1.2, gz)),
    ])
    render_piece("m3c_3-ciclo", (1024, 614), transparent=False, outline_px=2.2, wash=0.03)


def piece_m3c_4_bloques():
    """Sala de gráficos de BTC: tira de velas arriba, escritorio con monitor abajo-izq."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF4E6", "#EAD3B6")
    # Tira superior (sólo móvil): pantalla panorámica con velas de BTC.
    box("wide_screen", (0, 2.7, 7.95), (15.0, 0.2, 1.0), "#3A4660", bevel=0.06)
    heights = (0.5, 0.35, 0.6, 0.3, 0.55, 0.45, 0.62, 0.28, 0.5, 0.4, 0.58, 0.33)
    for i, hgt in enumerate(heights):
        x = -6.6 + i * 1.2
        col = "#4CC38A" if i % 3 != 1 else "#EF6B5B"
        box(f"strip_wick{i}", (x, 2.56, 7.95), (0.04, 0.03, min(0.84, hgt + 0.24)), "#FFF3DC", bevel=0.0)
        box(f"strip_candle{i}", (x, 2.55, 7.95), (0.3, 0.05, hgt), col, bevel=0.0)
    # Abajo-izquierda: escritorio con monitor de velas y silla.
    box("desk", (-4.6, 1.6, 2.0), (4.2, 1.2, 0.18), "#C98B55", bevel=0.04)
    for i, x in enumerate((-6.5, -2.7)):
        box(f"desk_leg{i}", (x, 1.6, 1.55), (0.14, 0.14, 0.9), "#A86B3C", bevel=0.02)
    box("monitor", (-4.8, 1.8, 2.65), (2.4, 0.15, 1.05), "#3A4660", bevel=0.06)
    for i, (dx, hgt, col) in enumerate(((-0.8, 0.5, "#4CC38A"), (-0.35, 0.3, "#EF6B5B"),
                                        (0.1, 0.55, "#4CC38A"), (0.55, 0.4, "#4CC38A"))):
        box(f"monitor_candle{i}", (-4.8 + dx, 1.7, 2.65), (0.22, 0.04, hgt), col, bevel=0.0)
    box("mug", (-3.0, 1.5, 2.25), (0.3, 0.3, 0.32), CRYPTO, bevel=0.06)
    box("chair_seat", (0.4, 1.0, 1.9), (1.3, 1.1, 0.2), CRYPTO, bevel=0.08)
    box("chair_back", (0.4, 1.5, 2.55), (1.3, 0.16, 1.1), CRYPTO, bevel=0.08)
    no_ink(box("trim", (0, 2.85, 1.35), (30, 0.06, 0.12), "#F6C58A", bevel=0.0))  # bajo la nota, ver m3c_2
    report_anchors([
        ("pantalla sup. borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("monitor tope (≥67%)", (-4.8, 1.8, 3.17)),
        ("silla borde der. (≤64%)", (1.05, 1.5, 2.55)),
    ])
    render_piece("m3c_4-bloques", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


# ═════════════════════════════════════════════════════════════════════════════
# NIVEL 3 · FOREX — Distrito FX (Nueva York · Wall Street) · acento #38BDF8
# ═════════════════════════════════════════════════════════════════════════════
# Mismas zonas del modo meter (medido otra vez en m3f_1 y m3f_3 a 375/1280 px).
# Diferencia: con `centered` la nota "centro = sin relación" es más ancha: en
# móvil ocupa x≈54–94 %, así que en m3f_3 el detalle abajo-izq va en x≤52 %.
FX = "#38BDF8"
FX_MUTED = "#5B8DB8"
FX_PALE = "#CFEBFA"


def clock(prefix, center, radius, hour, minute):
    """Reloj de pared mirando a -Y: esfera blanca, aro azul y dos agujas."""
    cx, cy, cz = center
    cylinder(f"{prefix}_face", (cx, cy, cz), radius, 0.08, "#FFFFFF", rotation=(R(90), 0, 0), vertices=40)
    torus(f"{prefix}_rim", (cx, cy - 0.05, cz), radius, radius * 0.1, FX, rotation=(R(90), 0, 0))
    for name, turns, length, width in (("hour", hour / 12, 0.5, 0.09), ("min", minute / 60, 0.78, 0.06)):
        a = turns * 2 * math.pi
        L = radius * length
        box(f"{prefix}_{name}", (cx + math.sin(a) * L / 2, cy - 0.1, cz + math.cos(a) * L / 2),
            (width * radius, 0.03, L), INK_HEX, bevel=0.0, rotation=(0, a, 0))
    sphere(f"{prefix}_hub", (cx, cy - 0.12, cz), (radius * 0.1, 0.04, radius * 0.1), INK_HEX)


def polyline(prefix, points, y, width, color):
    """Línea quebrada en el plano XZ (mirando a -Y) hecha de segmentos."""
    for i, ((x0, z0), (x1, z1)) in enumerate(zip(points, points[1:])):
        dx, dz = x1 - x0, z1 - z0
        length = math.hypot(dx, dz)
        box(f"{prefix}{i}", ((x0 + x1) / 2, y, (z0 + z1) / 2), (width, 0.04, length + width * 0.8),
            color, bevel=0.0, rotation=(0, math.atan2(dx, dz), 0))


def _frieze(color):
    """Friso superior (sólo asoma en móvil, y≈12–23 %)."""
    box("frieze", (0, 2.75, 7.95), (15.0, 0.2, 1.0), color, bevel=0.05)


def piece_m3f_1_sesiones():
    """Sesiones: skyline de Londres y Nueva York arriba, relojes de sesión abajo-izq."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EAF6FD", "#D6E4F0")
    _frieze(FX_PALE)
    # Londres (izq.): torre del reloj; Nueva York (der.): rascacielos escalonado.
    box("ldn_tower", (-4.8, 2.6, 7.85), (0.45, 0.06, 0.7), FX_MUTED, bevel=0.0)
    cone("ldn_roof", (-4.8, 2.6, 8.3), 0.3, 0.0, 0.25, FX_MUTED, vertices=4)
    cylinder("ldn_clock", (-4.8, 2.55, 7.95), 0.14, 0.02, "#FFFFFF", rotation=(R(90), 0, 0), vertices=20)
    for i, (x, h) in enumerate(((-6.4, 0.5), (-5.6, 0.6), (-3.9, 0.45), (-3.2, 0.55))):
        box(f"ldn_bldg{i}", (x, 2.62, 7.5 + h / 2), (0.6, 0.05, h), "#7FA8CC", bevel=0.0)
    # Capas del rascacielos: sólo la exterior lleva tinta. Con las tres entintadas,
    # los contornos superpuestos lo volvían una mancha negra a ese tamaño.
    for i, (w, h, col) in enumerate(((0.8, 0.45, FX_MUTED), (0.56, 0.65, "#6E9CC4"), (0.32, 0.85, "#86B0D4"))):
        tier = box(f"ny_tier{i}", (4.6, 2.6 - i * 0.02, 7.5 + h / 2), (w, 0.06, h), col, bevel=0.0)
        if i > 0:
            no_ink(tier)
    for i, (x, h) in enumerate(((3.1, 0.5), (3.8, 0.35), (5.5, 0.6), (6.3, 0.4))):
        box(f"ny_bldg{i}", (x, 2.62, 7.5 + h / 2), (0.6, 0.05, h), "#7FA8CC", bevel=0.0)
    # Abajo-izquierda: tablero con cuatro relojes de sesión (horas distintas).
    box("clock_board", (-3.9, 2.85, 2.45), (6.0, 0.1, 1.4), "#FFFFFF", bevel=0.08)
    no_ink(box("clock_board_rail", (-3.9, 2.82, 1.78), (6.0, 0.06, 0.08), FX, bevel=0.0))
    for i, (x, hour, minute) in enumerate(((-6.0, 8, 0), (-4.6, 13, 30), (-3.2, 21, 0), (-1.8, 7, 15))):
        clock(f"clock{i}", (x, 2.75, 2.5), 0.45, hour % 12, minute)
    cylinder("pot", (1.2, 1.6, 1.55), 0.35, 0.7, FX)
    sphere("plant", (1.2, 1.6, 2.15), (0.5, 0.45, 0.45), "#5FB97A")
    report_anchors([
        ("friso borde inf. (≤23%)", (0, 2.75, 7.45)),
        ("tablero tope (≥67%)", (-3.9, 2.85, 3.15)),
        ("tablero borde der. (≤64%)", (-0.9, 2.85, 2.45)),
        ("planta borde der. (≤64%)", (1.7, 1.6, 2.15)),
    ])
    render_piece("m3f_1-sesiones", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3f_2_lotes():
    """GaugeLab (zona libre x≈50–72 %, y≈22–52 %): la Torre de Liquidez."""
    reset_scene()
    daylight()
    camera(16.0, 8.0, (0, 0, 3.0))
    sky_plane("sky", (0, 70, 10), (120, 60), "#D6EEFB")
    # Skyline bajo, con los techos dentro del cuadro: altos se salían por arriba y
    # se leían como paneles en blanco.
    for i, (x, w, h, col) in enumerate(((-8.6, 2.2, 3.0, "#BFD7EC"), (-6.3, 1.8, 4.2, "#CADFF0"),
                                        (-4.0, 2.4, 2.6, "#BFD7EC"), (6.2, 2.0, 3.6, "#CADFF0"),
                                        (8.6, 2.4, 2.8, "#BFD7EC"))):
        no_ink(box(f"skyline{i}", (x, 30, h / 2), (w, 2.0, h), col, bevel=0.1))
        no_ink(box(f"skyline{i}_roof", (x, 30, h + 0.15), (w * 0.6, 1.4, 0.3), "#B3CDE6", bevel=0.05))
    no_ink(plane("plaza", (0, 1.5, 0), (40, 27), "#E4ECF3"))
    for i, (x, y) in enumerate(((-6.2, -2.0), (-3.4, 4.0), (5.8, 1.5), (7.4, -3.5), (-1.2, -5.0))):
        no_ink(cylinder(f"tile{i}", (x, y, 0.01), 0.7, 0.02, "#D6E2EE"))

    tx, ty = 1.76, 3.0
    cylinder("pedestal", (tx, ty, 0.3), 1.35, 0.6, "#D6E2EE")
    z = 0.6
    for i, (w, h) in enumerate(((1.9, 2.4), (1.5, 2.0), (1.1, 1.6))):
        box(f"tier{i}", (tx, ty, z + h / 2), (w, w, h), "#9FD8F5" if i % 2 == 0 else FX_PALE, bevel=0.12)
        for k in range(int(h / 0.5)):
            no_ink(box(f"tier{i}_window{k}", (tx, ty - w / 2 - 0.01, z + 0.35 + k * 0.5),
                       (w * 0.7, 0.02, 0.14), "#EAF6FD", bevel=0.0))
        z += h
    sphere("drop", (tx, ty, z + 0.4), (0.4, 0.4, 0.4), FX)
    cone("drop_tip", (tx, ty, z + 0.9), 0.3, 0.0, 0.55, FX)
    report_anchors([
        ("torre borde izq. (≥50%)", (tx - 0.95, ty, 3.0)),
        ("torre borde der. (≤72%)", (tx + 0.95, ty, 3.0)),
        ("tope gota (≈22%)", (tx, ty, z + 1.17)),
        ("base pedestal", (tx, ty - 1.35, 0.0)),
    ])
    render_piece("m3f_2-lotes", (1024, 683), transparent=False, outline_px=2.2, wash=0.05)


def piece_m3f_2_coin():
    """Ficha de posición (una por mini-lote): ficha azul con muescas blancas."""
    reset_scene()
    daylight(0.75)
    camera(2.35, 0.0, (0, 0, 0), azim_deg=18)
    rot = (R(90), 0, 0)
    cylinder("chip", (0, 0, 0), 1.0, 0.24, FX, rotation=rot, vertices=64)
    for k in range(6):
        a = R(k * 60)
        box(f"notch{k}", (0.86 * math.sin(a), 0, 0.86 * math.cos(a)), (0.32, 0.27, 0.15), "#FFFFFF",
            bevel=0.03, rotation=(0, a, 0))
    torus("ring", (0, -0.13, 0), 0.6, 0.05, "#FFFFFF", rotation=rot)
    cylinder("emblem", (0, -0.1, 0), 0.4, 0.26, "#8FD6F7", rotation=rot, vertices=48)
    no_ink(sphere("shine", (-0.45, -0.28, 0.45), (0.11, 0.05, 0.17), "#EAF6FD"))
    render_piece("m3f_2-coin", (96, 96), transparent=True, outline_px=0.9,
                 supersample=SPRITE_SUPERSAMPLE)


def piece_m3f_3_correlacion():
    """Correlación: pantallas de pares arriba; dos líneas que se mueven juntas abajo-izq
    (x≤52 %: la nota del medidor centrado es más ancha)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EDF4FD", "#D6E4F0")
    for i, x in enumerate((-6.25, -3.75, -1.25, 1.25, 3.75, 6.25)):
        box(f"pair_screen{i}", (x, 2.7, 7.95), (2.2, 0.2, 1.0), "#3A4660", bevel=0.06)
        together = i % 3 != 1
        for j, (dz, col) in enumerate(((0.16, FX), (-0.16, "#818CF8"))):
            tilt = R(62) if together or j == 0 else R(118)
            box(f"pair{i}_line{j}", (x, 2.55, 7.95 + dz), (0.06, 0.04, 1.2), col, bevel=0.0,
                rotation=(0, tilt, 0))
    box("chart_board", (-3.4, 2.85, 2.45), (5.0, 0.1, 1.4), "#FFFFFF", bevel=0.08)
    base = ((-5.6, 1.95), (-4.7, 2.35), (-3.8, 2.05), (-2.9, 2.6), (-2.0, 2.3), (-1.2, 2.85))
    polyline("line_a", [(x, z + 0.12) for x, z in base], 2.76, 0.08, FX)
    polyline("line_b", [(x, z - 0.12) for x, z in base], 2.76, 0.08, "#818CF8")
    report_anchors([
        ("pantallas borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("tablero tope (≥67%)", (-3.4, 2.85, 3.15)),
        ("tablero borde der. (≤52%)", (-0.9, 2.85, 2.45)),
    ])
    render_piece("m3f_3-correlacion", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3f_4_calendario():
    """Calendario económico: días con impacto arriba; calendario de pared y reloj abajo-izq."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EAF6FD", "#D6E4F0")
    impacts = ("#DC2626", "#9AA8BC", "#F28B3C", "#9AA8BC", "#DC2626", "#9AA8BC", "#F28B3C")
    for i, col in enumerate(impacts):
        x = -6.3 + i * 2.1
        box(f"day{i}", (x, 2.7, 7.95), (1.8, 0.2, 1.0), "#FFFFFF", bevel=0.06)
        box(f"day{i}_tab", (x, 2.58, 8.33), (1.8, 0.05, 0.22), FX, bevel=0.0)
        sphere(f"day{i}_impact", (x, 2.55, 7.85), (0.18, 0.06, 0.18), col)
    box("calendar", (-4.2, 2.85, 2.45), (4.2, 0.1, 1.4), "#FFFFFF", bevel=0.08)
    box("calendar_tab", (-4.2, 2.78, 3.0), (4.2, 0.05, 0.28), FX, bevel=0.0)
    hot = {(0, 2), (1, 0), (1, 4), (0, 4)}
    for r in range(2):
        for c in range(5):
            col = "#DC2626" if (r, c) in hot else "#DCE6F2"
            box(f"cell{r}_{c}", (-5.8 + c * 0.8, 2.78, 2.52 - r * 0.5), (0.6, 0.04, 0.36), col, bevel=0.0)
    clock("wall_clock", (-0.7, 2.8, 2.45), 0.55, 1, 55)
    report_anchors([
        ("días borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("calendario tope (≥67%)", (-4.2, 2.85, 3.15)),
        ("reloj borde der. (≤64%)", (-0.15, 2.8, 2.45)),
    ])
    render_piece("m3f_4-calendario", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


# ═════════════════════════════════════════════════════════════════════════════
# NIVEL 3 · STOCKS — Capital Corporativa (NY · Exchange District) · acento #22C55E
# NIVEL 3 · COMMODITIES — Puerto de Materias (Chicago · Golfo) · acento #EAB308
# ═════════════════════════════════════════════════════════════════════════════
# Todo en modo meter: mismas zonas medidas. Límite derecho del detalle abajo-izq:
# x≤64 % con umbral (m3s_1, m3s_4, m3o_4); x≤52 % con `centered` (el resto).
STOCKS = "#22C55E"
STOCKS_MUTED = "#5FA57E"
COMMOD = "#EAB308"
GOLD_BAR = "#F2B33D"
COPPER = "#D9773B"
OIL = "#3B3F4A"


def arrow(prefix, center, size, color, up=True):
    """Triángulo mirando a -Y (flecha arriba/abajo)."""
    rot = (R(90), 0, 0) if up else (R(90), R(180), 0)
    return cone(prefix, center, size, 0.0, 0.08, color, rotation=rot, vertices=3)


def upright_coin(prefix, center, radius, color=GOLD_BAR):
    cylinder(prefix, center, radius, 0.12, color, rotation=(R(90), 0, 0), vertices=40)
    torus(f"{prefix}_ring", (center[0], center[1] - 0.07, center[2]), radius * 0.7, radius * 0.07, "#B9760A",
          rotation=(R(90), 0, 0))


def piece_m3s_1_capitalizacion():
    """Capitalización: skyline arriba; maqueta small / mid / large cap abajo-izq (x≤64 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EEFBF2", "#D6EBDD")
    _frieze("#D8F5E3")
    for i, (x, h, col) in enumerate(((-6.2, 0.45, STOCKS_MUTED), (-5.3, 0.8, "#7DBE97"), (-4.4, 0.6, STOCKS_MUTED),
                                     (-2.8, 0.85, "#7DBE97"), (2.6, 0.55, STOCKS_MUTED), (3.5, 0.85, "#7DBE97"),
                                     (4.5, 0.7, STOCKS_MUTED), (5.9, 0.5, "#7DBE97"))):
        box(f"frieze_bldg{i}", (x, 2.62, 7.5 + h / 2), (0.7, 0.05, h), col, bevel=0.0)
    box("model_base", (-3.4, 2.0, 1.35), (6.4, 1.2, 0.3), "#FFFFFF", bevel=0.06)
    for i, (x, w, h) in enumerate(((-5.6, 0.7, 0.6), (-3.6, 1.0, 1.0), (-1.3, 1.3, 1.6))):
        box(f"cap_bldg{i}", (x, 1.9, 1.5 + h / 2), (w, 0.8, h), STOCKS if i == 2 else "#9ADBB3", bevel=0.06)
        for k in range(int(h / 0.35)):
            no_ink(box(f"cap_bldg{i}_win{k}", (x, 1.49, 1.72 + k * 0.35), (w * 0.6, 0.02, 0.1), "#EEFBF2", bevel=0.0))
    report_anchors([
        ("friso borde inf. (≤23%)", (0, 2.75, 7.45)),
        ("edificio grande tope (≥67%)", (-1.3, 1.9, 3.1)),
        ("maqueta borde der. (≤64%)", (-0.2, 2.0, 1.35)),
    ])
    render_piece("m3s_1-capitalizacion", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3s_2_resultados():
    """Resultados: pantallas con flechas arriba; tablero de EPS abajo-izq (x≤52 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EEFBF2", "#D6EBDD")
    for i, x in enumerate((-6.25, -3.75, -1.25, 1.25, 3.75, 6.25)):
        box(f"earn_screen{i}", (x, 2.7, 7.95), (2.2, 0.2, 1.0), "#3A4660", bevel=0.06)
        up = i % 3 != 2
        arrow(f"earn_arrow{i}", (x, 2.5, 7.95), 0.33, STOCKS if up else "#DC2626", up=up)
    box("eps_board", (-3.4, 2.85, 2.45), (4.4, 0.1, 1.4), "#FFFFFF", bevel=0.08)
    for i, h in enumerate((0.4, 0.65, 0.95)):
        box(f"eps_bar{i}", (-4.9 + i * 0.9, 2.75, 1.9 + h / 2), (0.55, 0.05, h), STOCKS, bevel=0.0)
    arrow("eps_up", (-1.9, 2.72, 2.55), 0.4, STOCKS, up=True)
    report_anchors([
        ("pantallas borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("tablero tope (≥67%)", (-3.4, 2.85, 3.15)),
        ("tablero borde der. (≤52%)", (-1.2, 2.85, 2.45)),
    ])
    render_piece("m3s_2-resultados", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3s_3_corporativo():
    """Eventos corporativos: fichas de evento arriba; split que no cambia el valor
    abajo-izq: una moneda grande = dos pequeñas (x≤52 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EEFBF2", "#D6EBDD")
    for i in range(6):
        x = -6.25 + i * 2.5
        box(f"event_tile{i}", (x, 2.7, 7.95), (2.2, 0.2, 1.0), "#FFFFFF", bevel=0.06)
        kind = i % 3
        if kind == 0:  # dividendo: moneda
            cylinder(f"event_coin{i}", (x, 2.55, 7.95), 0.3, 0.06, GOLD_BAR, rotation=(R(90), 0, 0), vertices=24)
        elif kind == 1:  # split: barra partida
            for j, dx in enumerate((-0.28, 0.28)):
                box(f"event_split{i}_{j}", (x + dx, 2.55, 7.95), (0.46, 0.05, 0.3), STOCKS, bevel=0.0)
        else:  # fecha ex-dividendo: calendario mínimo
            box(f"event_cal{i}", (x, 2.55, 7.9), (0.6, 0.05, 0.5), "#DCE6F2", bevel=0.0)
            box(f"event_cal_tab{i}", (x, 2.53, 8.18), (0.6, 0.05, 0.12), STOCKS, bevel=0.0)
    box("split_table", (-3.6, 2.0, 1.35), (4.6, 1.2, 0.3), "#FFFFFF", bevel=0.06)
    upright_coin("big_coin", (-5.1, 2.0, 2.2), 0.6)
    for i, dz in enumerate((0.12, -0.12)):
        box(f"equals{i}", (-4.0, 1.9, 2.2 + dz), (0.4, 0.05, 0.1), INK_HEX, bevel=0.0)
    for i, x in enumerate((-3.1, -2.15)):
        upright_coin(f"small_coin{i}", (x, 2.0, 2.02), 0.42)
    report_anchors([
        ("fichas borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("moneda grande tope (≥67%)", (-5.1, 2.0, 2.8)),
        ("mesa borde der. (≤52%)", (-1.3, 2.0, 1.35)),
    ])
    render_piece("m3s_3-corporativo", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3s_4_beta():
    """Beta: sectores arriba; la onda del sector amplifica la del mercado abajo-izq (x≤64 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#EEFBF2", "#D6EBDD")
    # Friso más bajo y más arriba (base z 7.7, y≈20 %): la etiqueta de este lab se
    # parte en 3 líneas en móvil y las fichas quedaban pegadas a su primera línea.
    for i in range(7):
        x = -6.3 + i * 2.1
        box(f"sector_tile{i}", (x, 2.7, 8.1), (1.8, 0.2, 0.8), "#FFFFFF", bevel=0.06)
        amp = 0.2 + 0.1 * ((i * 5) % 4)
        for j, (dx, h, col) in enumerate(((-0.45, amp, STOCKS), (0.0, amp * 0.6, "#9AA8BC"), (0.45, amp * 1.2, STOCKS))):
            box(f"sector{i}_bar{j}", (x + dx, 2.55, 7.82 + h / 2), (0.28, 0.05, h), col, bevel=0.0)
    box("beta_board", (-3.6, 2.85, 2.45), (5.2, 0.1, 1.4), "#FFFFFF", bevel=0.08)
    xs = [-5.9 + i * 0.9 for i in range(6)]
    wave = (0.0, 1.0, -0.4, 0.8, -0.8, 0.5)
    polyline("market_wave", [(x, 2.45 + 0.18 * w) for x, w in zip(xs, wave)], 2.76, 0.07, "#9AA8BC")
    polyline("sector_wave", [(x, 2.45 + 0.45 * w) for x, w in zip(xs, wave)], 2.74, 0.09, STOCKS)
    report_anchors([
        ("sectores borde inf. (≈20%, etiqueta en 3 líneas)", (0, 2.7, 7.7)),
        ("tablero tope (≥67%)", (-3.6, 2.85, 3.15)),
        ("tablero borde der. (≤64%)", (-1.0, 2.85, 2.45)),
    ])
    render_piece("m3s_4-beta", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def barrel(prefix, center, color=OIL, band=COMMOD):
    cylinder(prefix, center, 0.38, 0.9, color, vertices=24)
    for j, dz in enumerate((-0.22, 0.22)):
        no_ink(torus(f"{prefix}_band{j}", (center[0], center[1], center[2] + dz), 0.385, 0.03, band))


def piece_m3o_1_oferta():
    """Oferta física: puerto con grúas, barco y tanques arriba; barriles abajo-izq (x≤52 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF8E6", "#EBDDB8")
    _frieze("#FBF0C8")
    for i, x in enumerate((-5.6, 3.8)):  # grúas: torre + pluma
        box(f"crane{i}_tower", (x, 2.6, 7.85), (0.1, 0.05, 0.75), "#B8912A", bevel=0.0)
        box(f"crane{i}_boom", (x + 0.45, 2.6, 8.2), (1.1, 0.05, 0.08), "#B8912A", bevel=0.0)
    box("ship_hull", (-2.6, 2.6, 7.62), (2.6, 0.05, 0.3), "#5B6B80", bevel=0.0)
    for i, (dx, col) in enumerate(((-0.8, COMMOD), (-0.25, "#D9773B"), (0.3, "#7FA8CC"))):
        box(f"container{i}", (-2.6 + dx, 2.58, 7.94), (0.5, 0.05, 0.3), col, bevel=0.0)
    for i, x in enumerate((1.2, 2.0, 5.6, 6.4)):
        cylinder(f"tank{i}", (x, 2.6, 7.75), 0.34, 0.55, "#E6E0CC", vertices=20)
    for i, x in enumerate((-5.9, -5.1, -4.3)):
        barrel(f"barrel{i}", (x, 1.9, 1.65))
    for i, x in enumerate((-5.5, -4.7)):
        barrel(f"barrel_top{i}", (x, 1.9, 2.55))
    box("pallet", (-5.1, 1.9, 1.15), (2.8, 1.0, 0.1), "#C98B55", bevel=0.02)
    report_anchors([
        ("friso borde inf. (≤23%)", (0, 2.75, 7.45)),
        ("barriles tope (≥67%)", (-5.1, 1.9, 3.0)),
        ("barriles borde der. (≤52%)", (-3.92, 1.9, 1.65)),
    ])
    render_piece("m3o_1-oferta", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3o_2_refugio():
    """Refugio vs cíclico: oro y cobre arriba; balanza oro/cobre abajo-izq (x≤52 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF8E6", "#EBDDB8")
    box("frieze", (0, 2.75, 7.95), (15.0, 0.2, 1.0), "#FFFFFF", bevel=0.05)
    for i in range(7):
        x = -6.3 + i * 2.1
        if i % 2 == 0:
            box(f"frieze_gold{i}", (x, 2.6, 7.85), (0.9, 0.3, 0.35), GOLD_BAR, bevel=0.06)
        else:
            torus(f"frieze_coil{i}", (x, 2.6, 7.95), 0.3, 0.1, COPPER, rotation=(R(90), 0, 0))
    cylinder("scale_post", (-3.2, 2.0, 2.0), 0.08, 1.6, "#8A96A8", vertices=12)
    box("scale_beam", (-3.2, 1.95, 2.8), (3.6, 0.1, 0.1), "#8A96A8", bevel=0.02)
    box("scale_base", (-3.2, 2.0, 1.3), (1.2, 0.8, 0.2), "#8A96A8", bevel=0.04)
    for i, x in enumerate((-4.8, -1.6)):
        box(f"scale_string{i}", (x, 1.95, 2.45), (0.03, 0.03, 0.7), INK_HEX, bevel=0.0)
        cylinder(f"scale_pan{i}", (x, 1.95, 2.1), 0.55, 0.08, "#C8D2DE", vertices=32)
    box("pan_gold_a", (-4.95, 1.95, 2.27), (0.5, 0.3, 0.22), GOLD_BAR, bevel=0.04)
    box("pan_gold_b", (-4.65, 1.95, 2.45), (0.5, 0.3, 0.2), GOLD_BAR, bevel=0.04)
    torus("pan_coil", (-1.6, 1.95, 2.42), 0.3, 0.12, COPPER, rotation=(R(90), 0, 0))
    report_anchors([
        ("friso borde inf. (≤23%)", (0, 2.75, 7.45)),
        ("balanza tope (≥67%)", (-3.2, 1.95, 2.85)),
        ("plato der. borde der. (≤52%)", (-1.05, 1.95, 2.1)),
    ])
    render_piece("m3o_2-refugio", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3o_3_dolar():
    """Dólar vs crudo: billetes y gotas de crudo arriba; billetes junto a un barril abajo-izq."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF8E6", "#EBDDB8")
    box("frieze", (0, 2.75, 7.95), (15.0, 0.2, 1.0), "#FFFFFF", bevel=0.05)
    for i in range(7):
        x = -6.3 + i * 2.1
        if i % 2 == 0:
            box(f"frieze_bill{i}", (x, 2.6, 7.95), (1.1, 0.05, 0.5), "#7CC08A", bevel=0.03)
            no_ink(cylinder(f"frieze_bill_seal{i}", (x, 2.56, 7.95), 0.14, 0.03, "#D8F0DC",
                            rotation=(R(90), 0, 0), vertices=16))
        else:
            sphere(f"frieze_oil{i}", (x, 2.6, 7.85), (0.25, 0.1, 0.25), OIL)
            cone(f"frieze_oil_tip{i}", (x, 2.6, 8.18), 0.2, 0.0, 0.32, OIL, vertices=16)
    # Sobre una caja: apoyados en el suelo quedaban con el tope en ~78 % y casi no
    # entraban en la franja visible (y≈67–82 %).
    box("crate", (-3.9, 1.9, 1.55), (3.8, 1.0, 0.7), "#C98B55", bevel=0.05)
    for k in range(5):
        box(f"bill{k}", (-4.9 + (k % 2) * 0.08, 1.9, 1.96 + k * 0.14), (1.6, 0.8, 0.12), "#7CC08A", bevel=0.02)
    no_ink(cylinder("bill_seal", (-4.86, 1.49, 2.52), 0.16, 0.02, "#D8F0DC", rotation=(R(90), 0, 0), vertices=16))
    barrel("barrel", (-2.8, 1.9, 2.35))
    report_anchors([
        ("friso borde inf. (≤23%)", (0, 2.75, 7.45)),
        ("barril tope (≥67%)", (-2.8, 1.9, 2.8)),
        ("caja borde der. (≤52%)", (-2.0, 1.9, 1.55)),
    ])
    render_piece("m3o_3-dolar", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


def piece_m3o_4_estacional():
    """Estacionalidad: estaciones arriba; terminal de gas con nieve abajo-izq (x≤64 %)."""
    reset_scene()
    daylight(0.7)
    _meter_backdrop("#FFF8E6", "#EBDDB8")
    seasons = (("#F2C14E", "sun"), ("#E8743B", "leaf"), ("#FFFFFF", "snow"), ("#7DCB92", "sprout"))
    for i, (col, kind) in enumerate(seasons):
        x = -5.4 + i * 3.6
        box(f"season_panel{i}", (x, 2.7, 7.95), (3.2, 0.2, 1.0), "#FBF0C8" if kind != "snow" else "#DCEBF7", bevel=0.06)
        if kind == "leaf":
            sphere(f"season_icon{i}", (x, 2.55, 7.95), (0.34, 0.08, 0.2), col, rotation=(0, R(30), 0))
        else:
            sphere(f"season_icon{i}", (x, 2.55, 7.95), (0.3, 0.08, 0.3), col)
    cylinder("gas_leg_a", (-5.0, 1.6, 1.6), 0.07, 0.8, "#8A96A8", vertices=10)
    cylinder("gas_leg_b", (-3.4, 1.6, 1.6), 0.07, 0.8, "#8A96A8", vertices=10)
    sphere("gas_tank", (-4.2, 1.6, 2.35), (0.95, 0.7, 0.7), "#E6E0CC")
    no_ink(sphere("snow_cap", (-4.2, 1.5, 2.95), (0.6, 0.45, 0.14), "#FFFFFF"))
    box("gas_pipe", (-2.3, 1.6, 1.75), (2.0, 0.14, 0.14), "#8A96A8", bevel=0.03)
    cylinder("gas_valve", (-1.4, 1.5, 1.75), 0.18, 0.1, COMMOD, rotation=(R(90), 0, 0), vertices=16)
    for i, x in enumerate((-6.2, -2.8, -0.9)):
        no_ink(sphere(f"snow_drift{i}", (x, 1.0, 1.22), (0.55, 0.4, 0.12), "#FFFFFF"))
    report_anchors([
        ("estaciones borde inf. (≤23%)", (0, 2.7, 7.45)),
        ("tanque tope (≥67%)", (-4.2, 1.6, 3.09)),
        ("válvula borde der. (≤64%)", (-1.22, 1.5, 1.75)),
    ])
    render_piece("m3o_4-estacional", (1024, 614), transparent=False, outline_px=2.2, wash=0.04)


PIECES = {
    "m1_1-stall": piece_m1_1_stall,
    "m1_1-client": piece_m1_1_client,
    "m1_1-apple": piece_m1_1_apple,
    "m1_1-sign": piece_m1_1_sign,
    "m1_2-workshop": piece_m1_2_workshop,
    "m1_3-observatory": piece_m1_3_observatory,
    "m1_4-vault": piece_m1_4_vault,
    "m1_4-coin": piece_m1_4_coin,
    "m2_1-plaza": piece_m2_1_plaza,
    "m2_2-observatory": piece_m2_2_observatory,
    "m2_3-patterns": piece_m2_3_patterns,
    "m3c_1-plaza-bloque": piece_m3c_1_plaza_bloque,
    "m3c_1-coin": piece_m3c_1_coin,
    "m3c_2-nexus": piece_m3c_2_nexus,
    "m3c_3-ciclo": piece_m3c_3_ciclo,
    "m3c_4-bloques": piece_m3c_4_bloques,
    "m3f_1-sesiones": piece_m3f_1_sesiones,
    "m3f_2-lotes": piece_m3f_2_lotes,
    "m3f_2-coin": piece_m3f_2_coin,
    "m3f_3-correlacion": piece_m3f_3_correlacion,
    "m3f_4-calendario": piece_m3f_4_calendario,
    "m3s_1-capitalizacion": piece_m3s_1_capitalizacion,
    "m3s_2-resultados": piece_m3s_2_resultados,
    "m3s_3-corporativo": piece_m3s_3_corporativo,
    "m3s_4-beta": piece_m3s_4_beta,
    "m3o_1-oferta": piece_m3o_1_oferta,
    "m3o_2-refugio": piece_m3o_2_refugio,
    "m3o_3-dolar": piece_m3o_3_dolar,
    "m3o_4-estacional": piece_m3o_4_estacional,
}


def main():
    names = [n for n in PIECES if ONLY is None or n in ONLY]
    unknown = (ONLY or set()) - set(PIECES)
    if unknown:
        print(f"[TraderPath] Piezas desconocidas: {sorted(unknown)}")
    for name in names:
        # Tu arte manual gana: este script no pisa lo que hay en renders/assets/.
        if skip_generated("missions", name, FORCE):
            continue
        print(f"[TraderPath] ▶ {name}")
        PIECES[name]()


main()
