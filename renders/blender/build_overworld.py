# build_overworld.py — TraderPath · Fase 2 (diorama del overworld)
#
# Reemplaza el hero generado por IA (traderpath-world-hero.png) por un diorama
# renderizado, y saca del MISMO render una máscara de caminabilidad. Ese es el
# punto: el terreno y la colisión salen sincronizados por construcción, no
# pintados a mano uno contra el otro.
#
# CÓMO CORRERLO
#   blender --background --python blender/build_overworld.py
#
# Salidas:
#   public/assets/world/overworld.png           diorama (RGBA, fondo opaco)
#   public/assets/world/overworld_walkmask.webp  máscara (blanco = caminable)
#
# LA IDEA CLAVE — se autora en píxeles de Phaser
#   La cámara es ortográfica y fija, así que la proyección del plano del suelo
#   (z=0) sobre la pantalla es afín e invertible. `px_to_world()` invierte esa
#   proyección, de modo que TODO en este archivo se posiciona con las mismas
#   coordenadas que ya usa AcademyAgoraScene.ts (1280x720, Y hacia abajo).
#   Consecuencia: los 5 distritos y los 5 puntos de aproximación de los hotspots
#   caen exactamente donde ya estaban. No hay que mover nada en Phaser.
#
# Probado con Blender 5.2 LTS. Usa Cycles (renderiza headless sin problemas).

import bpy
import os
import sys
import math
import mathutils

# `blender -b --python build_overworld.py -- --mask-only` salta el render
# de belleza (6+ min) y saca sólo la máscara (~25 s). Es el bucle rápido
# para ajustar el trazado: la validación de puntos obligatorios sólo
# necesita la máscara.
MASK_ONLY = "--mask-only" in sys.argv
# Con --force se regenera también lo que tengas hecho a mano en renders/assets/.
FORCE = "--force" in sys.argv

# renders/blender/ al sys.path: Blender ejecuta el script con --python y no
# añade su carpeta, así que sin esto no encontraría manual_overrides.
try:
    _HERE = os.path.dirname(os.path.abspath(__file__))
except NameError:  # pegado en la pestaña Scripting
    _HERE = bpy.path.abspath("//")
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)
from manual_overrides import skip_generated

# ─── CONFIG ──────────────────────────────────────────────────────────────────
# 1:1 con el mundo de AcademyAgoraScene (ACADEMY_WORLD_WIDTH/HEIGHT). Todo en
# este archivo se autora en estas coordenadas.
RESOLUTION = (2560, 1440)
# La máscara no necesita el detalle del diorama: WalkMask escala mundo→píxel,
# así que a media resolución sigue siendo exacta y pesa la cuarta parte.
MASK_RESOLUTION = (1280, 720)
SAMPLES = 96
OUTLINE_THICKNESS = 3.4
# El diorama sale en WebP: en PNG, 2560×1440 rondaba los 4 MB y el presupuesto
# de carga inicial del roadmap es de 8 MB para TODO. La máscara sigue en PNG,
# que debe ser sin pérdida.
DIORAMA_QUALITY = 92

# Paleta. Los acentos de distrito son los de MARKET_CITIES[].accent y los
# marcadores de AcademyAgoraScene; el resto sale de VDD v2.0 (globals.css).
INK_HEX = "#1E2A44"        # navy — contorno Freestyle
SKY_HEX = "#EAF4FE"        # tp-base, ambiente diurno

SEA_HEX = "#4FA9D6"        # mar abierto
SHALLOW_HEX = "#93D6EF"    # bajío
GRASS_HEX = "#7DCB92"      # pasto
SAND_HEX = "#F2DFAE"       # playa
STONE_HEX = "#D6DEE8"      # basamentos y plazas
CREAM_HEX = "#FFF6E6"      # muros (VDD: superficies claras, acento en el techo)
ROCK_HEX = "#8A8FA0"       # roca volcánica
BRIDGE_HEX = "#C9A06A"     # madera
PATH_HEX = "#E7CFA0"       # senderos
TRUNK_HEX = "#7A5A3A"
LEAF_HEX = "#3E8C63"
CRATE_HEX = "#B98A55"
LAVA_HEX = "#FF7A18"
DEMAND_HEX = "#16A34A"     # tp-demand, para la vela alcista del Taller
SUPPLY_HEX = "#DC2626"     # tp-supply
BTC_BLOCK_HEX = "#5D6E8C"  # tp-text-muted, monolitos
TILE_HEX = "#C6D2E0"       # calzada
ROOF_ALT_HEX = "#E4B063"   # tejado secundario, para romper la monotonía
ASH_HEX = "#B9A48F"        # tierra volcánica: cálida, no gris
STEAM_HEX = "#CFEFF5"      # vapor geotérmico (referencia Conchagua)
VAULT_HEX = "#2563EB"      # tp-info, La Bóveda (M1.4)
ARENA_HEX = "#A855F7"      # Arena del Desafío (M1.5)

# Distritos, en píxeles del diorama. Deben coincidir con drawDistrictMarker() y
# con los hotspots de AcademyAgoraScene.createHotspots().
ACADEMIA_PX = (1180, 780)
MERCADO_PX = (2080, 760)
TALLER_PX = (520, 1080)
OBSERVATORIO_PX = (420, 560)
BITCOIN_PX = (1760, 380)
# Sitios nuevos: el mapa sólo tenía lugar para M1.1–M1.3, y VISUAL_DIRECTION.md
# §1 dice que el conocimiento vive en lugares.
BOVEDA_PX = (1000, 1240)        # M1.4 · gestión de riesgo
ARENA_PX = (1660, 1120)         # M1.5 · desafío final

ACADEMIA_HEX = "#E5960A"       # tp-gold
MERCADO_HEX = "#33B77A"
TALLER_HEX = "#E8743B"
OBSERVATORIO_HEX = "#8B72FF"
BITCOIN_HEX = "#F7931A"        # tp-crypto

# Puntos que el jugador DEBE poder pisar: su posición inicial y los `approach`
# de cada hotspot. Al final el script verifica que la máscara los marque
# caminables y aborta si alguno quedó en el agua.
REQUIRED_WALKABLE_PX = {
    "player-start": (1180, 1000),
    "approach:aria": (1225, 976),
    "approach:market-plaza": (1815, 758),
    "approach:candle-workshop": (786, 1011),
    "approach:trend-observatory": (661, 598),
    "approach:bitcoin-portal": (1660, 640),    # sobre el puente
    "approach:risk-vault": (1120, 1200),
    "approach:challenge-arena": (1467, 1163),
}

# `approach` heredados del hero pintado que, con terreno real, caen en agua y
# están pendientes de mover en AcademyAgoraScene.createHotspots(). Vacío: el de
# bitcoin-portal ya se movió a (772,296) en Phaser y aquí.
PENDING_APPROACH_MOVES: set[str] = set()

# Tierra firme, como lóbulos circulares EN PANTALLA (px_x, px_y, radio_px).
# Las tres masas están separadas a propósito: la única unión son los puentes,
# que es lo que obliga al jugador a rodear en vez de cruzar el agua.
# Crecidas ~1.35x respecto del simple x2: con ciudades de verdad encima, los
# lóbulos proporcionales dejaban los edificios colgando sobre el agua.
MAIN_LOBES = [
    (1180, 820, 380),    # meseta de la Academia (hub)
    (1420, 950, 330),    # brazo este, hacia la Arena
    (1660, 1120, 290),   # Arena del Desafío
    (980, 1060, 330),    # sur, hacia La Bóveda
    (1000, 1240, 270),   # La Bóveda
    (700, 1080, 300),    # Taller de Velas
    (520, 900, 300),
    (440, 620, 300),     # Observatorio
    (760, 660, 300),     # istmo norte
]
MERCADO_LOBES = [
    (2160, 620, 320),    # Mercado Plaza
    (2340, 860, 200),
]
BITCOIN_LOBES = [
    (1800, 360, 330),    # Ciudad Bitcoin
    (1560, 250, 210),
]

# Puentes (px_x1, px_y1, px_x2, px_y2, ancho_px). Cada uno arranca sobre la
# masa central y aterriza en su isla; los `approach` de Mercado y Bitcoin caen
# justo encima del tablero, así que entrar exige pisar el puente.
BRIDGES = [
    (1700, 880, 2000, 750, 180),   # central → Mercado Plaza (cubre 1900,800)
    (1560, 740, 1720, 560, 190),   # central → Ciudad Bitcoin (cubre 1660,620)
]

DOCKS: list = []

LAND_HEIGHT = 0.35   # bajo a propósito: menos flanco visible = máscara ajustada


# ─── COLOR ───────────────────────────────────────────────────────────────────
def _srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexrgba(h, a=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return (_srgb_to_linear(r), _srgb_to_linear(g), _srgb_to_linear(b), a)


# ─── ESCENA ──────────────────────────────────────────────────────────────────
def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for block in list(coll):
            coll.remove(block)


def make_material(name, hex_color, roughness=0.65):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hexrgba(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    for socket in ("Specular IOR Level", "Specular"):
        if socket in bsdf.inputs:
            bsdf.inputs[socket].default_value = 0.12
            break
    return mat


# ─── CÁMARA Y PROYECCIÓN ─────────────────────────────────────────────────────
# Vista aérea inclinada ~52° sobre el horizonte: se sigue leyendo "desde
# arriba" pero con volumen. Al ser ortográfica, el plano z=0 se proyecta de
# forma afín y por eso px_to_world() puede invertirla exactamente.
CAM_LOCATION = (0.0, -20.0, 26.0)
CAM_LOOK_AT = (0.0, 0.0, 0.0)
CAM_ORTHO_SCALE = 34.0


def setup_camera():
    bpy.ops.object.camera_add(location=CAM_LOCATION)
    cam = bpy.context.active_object
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = CAM_ORTHO_SCALE
    direction = mathutils.Vector(CAM_LOOK_AT) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    bpy.context.view_layer.update()
    return cam


def px_to_world(cam, px, py, z=0.0):
    """Píxel de pantalla (origen arriba-izquierda, como Phaser) → punto en z."""
    width, height = RESOLUTION
    scale = cam.data.ortho_scale
    # ortho_scale cubre siempre la dimensión mayor del sensor.
    if width >= height:
        half_x = scale / 2.0
        half_y = half_x * height / width
    else:
        half_y = scale / 2.0
        half_x = half_y * width / height

    u = (px / width) * 2.0 - 1.0
    v = 1.0 - (py / height) * 2.0

    basis = cam.matrix_world.to_3x3()
    right = (basis @ mathutils.Vector((1.0, 0.0, 0.0))).normalized()
    up = (basis @ mathutils.Vector((0.0, 1.0, 0.0))).normalized()
    forward = (basis @ mathutils.Vector((0.0, 0.0, -1.0))).normalized()

    origin = cam.matrix_world.translation + right * (u * half_x) + up * (v * half_y)
    if abs(forward.z) < 1e-9:
        raise ValueError("La cámara mira paralela al suelo: no hay intersección.")
    t = (z - origin.z) / forward.z
    return origin + forward * t


def pixel_scale(cam):
    """Unidades de mundo por píxel, en X y en Y del suelo.

    En Y son más porque la inclinación de la cámara comprime el suelo lejano:
    un círculo en pantalla es una elipse en el mundo. Devolver ambas escalas
    permite autorar en píxeles y que las formas salgan redondas EN PANTALLA.
    """
    origin = px_to_world(cam, 0, 0)
    step_x = (px_to_world(cam, 100, 0) - origin).length / 100.0
    step_y = (px_to_world(cam, 0, 100) - origin).length / 100.0
    return step_x, step_y


# ─── CONSTRUCCIÓN DEL TERRENO ────────────────────────────────────────────────
WALKABLE = []   # objetos que la máscara pinta de blanco
BLOCKING = []   # todo lo demás


def _finish(obj, mat, walkable, smooth=False, shadow=True):
    obj.data.materials.append(mat)
    if smooth:
        bpy.ops.object.shade_smooth()
    obj.visible_shadow = shadow
    (WALKABLE if walkable else BLOCKING).append(obj)
    return obj


def disc_px(cam, name, px, py, radius_px, z, height, mat,
            walkable=False, smooth=True, shadow=True, verts=48):
    """Cilindro que se lee como un círculo de radius_px EN PANTALLA."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=1.0, depth=height,
                                        location=(center.x, center.y, z + height / 2.0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (radius_px * step_x, radius_px * step_y, 1.0)
    return _finish(obj, mat, walkable, smooth, shadow)


def box_px(cam, name, px, py, w_px, d_px, height, z, mat,
           walkable=False, rot=0.0, bevel=0.05, shadow=True):
    """Caja con planta de w_px × d_px EN PANTALLA."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cube_add(size=1.0,
                                    location=(center.x, center.y, z + height / 2.0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w_px * step_x, d_px * step_y, height)
    obj.rotation_euler = (0.0, 0.0, rot)
    if bevel:
        bev = obj.modifiers.new("bevel", "BEVEL")
        bev.width = bevel
        bev.segments = 2
    return _finish(obj, mat, walkable, False, shadow)


def pyramid_px(cam, name, px, py, w_px, d_px, height, z, mat, verts=4, shadow=True):
    """Techo piramidal cuya base calza exactamente con w_px × d_px."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    # Con 4 lados, un radio de √2/2 inscribe un cuadrado de lado 1; con más
    # lados el polígono se aproxima al círculo y hace falta 0.5 para que el
    # DIÁMETRO sea 1. Sin esta distinción, w_px se interpretaba como radio y
    # los techos salían al doble de ancho.
    radius = math.sqrt(2) / 2 if verts == 4 else 0.5
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=radius, radius2=0.0,
                                    depth=1.0,
                                    location=(center.x, center.y, z + height / 2.0))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (w_px * step_x, d_px * step_y, height)
    if verts == 4:
        obj.rotation_euler = (0.0, 0.0, math.radians(45))
    return _finish(obj, mat, False, verts > 6, shadow)


def dome_px(cam, name, px, py, radius_px, z, mat, squash=0.72):
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1.0,
                                         location=(center.x, center.y, z))
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = (radius_px * step_x, radius_px * step_y, radius_px * step_x * squash)
    return _finish(obj, mat, False, True)


def add_sea(cam, mat_sea):
    """Plano de mar único, más grande que el cuadro por todos lados."""
    corners = [px_to_world(cam, x, y) for x, y in
               ((0, 0), (RESOLUTION[0], 0), (0, RESOLUTION[1]), RESOLUTION)]
    span = max(max(abs(c.x) for c in corners), max(abs(c.y) for c in corners)) * 2.6
    bpy.ops.mesh.primitive_plane_add(size=span, location=(0, 0, -0.10))
    sea = bpy.context.active_object
    sea.name = "sea"
    return _finish(sea, mat_sea, False)


def _raw_disc(cam, px, py, radius_px, z, height, verts=56):
    """Cilindro sin material ni registro, para fusionar después."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=1.0, depth=height,
                                        location=(center.x, center.y, z + height / 2.0))
    obj = bpy.context.active_object
    obj.scale = (radius_px * step_x, radius_px * step_y, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return obj


def union_all(parts, name):
    """Fusiona los lóbulos en una sola malla.

    Sin esto, Freestyle contornea cada cilindro por separado y la isla se lee
    como un racimo de pompas en vez de una costa. La unión deja una única
    silueta, que es lo que se ve a esta escala.
    """
    base = parts[0]
    for other in parts[1:]:
        bpy.context.view_layer.objects.active = base
        modifier = base.modifiers.new(f"union_{other.name}", "BOOLEAN")
        modifier.operation = "UNION"
        modifier.object = other
        modifier.solver = "EXACT"
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        bpy.data.objects.remove(other, do_unlink=True)
    base.name = name
    bpy.context.view_layer.objects.active = base
    # La booleana hereda los slots de material del operando. Como los lóbulos
    # se crean pelados, el resultado queda con un slot 0 VACÍO y todas las caras
    # apuntando a él: el material que se asigne después cae en el slot 1 y la
    # isla se renderiza blanca. Se limpia para que _finish escriba en el 0.
    base.data.materials.clear()
    for polygon in base.data.polygons:
        polygon.material_index = 0
    return base


def add_island_group(cam, group, lobes, mats, ground_mat):
    """Isla en tres anillos fusionados: bajío (agua), playa y pasto.

    Playa y pasto se pisan; el pasto es más pequeño, así que el borde caminable
    queda dentro de la silueta y no justo en el corte con el agua.
    """
    shallow, beach, grass = [], [], []
    for px, py, radius in lobes:
        shallow.append(_raw_disc(cam, px, py, radius * 1.20, -0.05, 0.05))
        beach.append(_raw_disc(cam, px, py, radius, 0.0, LAND_HEIGHT * 0.7))
        grass.append(_raw_disc(cam, px, py, radius * 0.86,
                               LAND_HEIGHT * 0.7 - 0.02, LAND_HEIGHT * 0.5))
    _finish(union_all(shallow, f"shallow_{group}"), mats["shallow"], False,
            smooth=False, shadow=False)
    _finish(union_all(beach, f"beach_{group}"), mats["sand"], True,
            smooth=False, shadow=False)
    _finish(union_all(grass, f"grass_{group}"), ground_mat, True,
            smooth=False, shadow=False)


GRASS_TOP = LAND_HEIGHT * 1.2 - 0.02   # cota de la hierba, base de los edificios


def add_dock(cam, name, px, py, width_px, depth_px, rot, mat):
    """Rellano de madera sobre el agua, alineado con el puente.

    Era un disco y se leía como un nenúfar naranja gigante en medio del canal.
    Rectangular y girado con el puente parece lo que es: un descansillo.
    """
    box_px(cam, name, px, py, width_px, depth_px, 0.16, GRASS_TOP - 0.16, mat,
           walkable=True, rot=rot, bevel=0.0, shadow=False)


def add_bridge(cam, name, px1, py1, px2, py2, width_px, mat):
    step_x, _ = pixel_scale(cam)
    a = px_to_world(cam, px1, py1)
    b = px_to_world(cam, px2, py2)
    mid = (a + b) / 2.0
    delta = b - a
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mid.x, mid.y, GRASS_TOP - 0.08))
    bridge = bpy.context.active_object
    bridge.name = name
    bridge.scale = (delta.length, width_px * step_x, 0.16)
    bridge.rotation_euler = (0.0, 0.0, math.atan2(delta.y, delta.x))
    return _finish(bridge, mat, True, False, False)


def add_path(cam, px1, py1, px2, py2, width_px, mat):
    """Sendero sobre el pasto. Ya es zona caminable, así que no toca la máscara;
    está para que el mapa tenga rutas legibles entre distritos."""
    step_x, _ = pixel_scale(cam)
    a = px_to_world(cam, px1, py1)
    b = px_to_world(cam, px2, py2)
    mid = (a + b) / 2.0
    delta = b - a
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mid.x, mid.y, GRASS_TOP + 0.012))
    path = bpy.context.active_object
    path.name = f"path_{px1}_{py1}"
    path.scale = (delta.length, width_px * step_x, 0.03)
    path.rotation_euler = (0.0, 0.0, math.atan2(delta.y, delta.x))
    return _finish(path, mat, True, False, False)


# ─── ARQUITECTURA POR DISTRITO ───────────────────────────────────────────────
# Son ciudades, no edificios sueltos: cada una es un núcleo con varias
# construcciones, calzada y un landmark dominante que le da identidad. A esta
# escala manda la silueta del conjunto, no el detalle de cada casa.
#
# Regla de composición: el landmark va SOBRE el pin del distrito, desplazado
# hacia arriba en pantalla, y el pin queda sobre plaza libre. Antes el pin y
# ARIA caían encima del edificio.

def street(cam, px1, py1, px2, py2, width_px, mat):
    """Calzada urbana. Va sobre terreno ya caminable, no toca la máscara."""
    step_x, _ = pixel_scale(cam)
    a = px_to_world(cam, px1, py1)
    b = px_to_world(cam, px2, py2)
    mid = (a + b) / 2.0
    delta = b - a
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mid.x, mid.y, GRASS_TOP + 0.014))
    road = bpy.context.active_object
    road.name = f"street_{px1}_{py1}"
    road.scale = (delta.length, width_px * step_x, 0.03)
    road.rotation_euler = (0.0, 0.0, math.atan2(delta.y, delta.x))
    return _finish(road, mat, True, False, False)


def house(cam, name, px, py, w_px, d_px, height, mat_roof, mats, rot=0.0):
    """Casa urbana: muro claro y tejado de acento. La unidad de las ciudades.

    El tejado es casi tan alto como el muro a propósito. Con la proporción
    anterior (0.42) la pirámide, vista desde una cámara casi cenital, se
    proyectaba como un rombo plano: las ciudades parecían naipes de colores
    tirados sobre la hierba en vez de casas.
    """
    box_px(cam, name, px, py, w_px, d_px, height, GRASS_TOP, mats["cream"], rot=rot)
    pyramid_px(cam, f"{name}_roof", px, py, w_px * 1.16, d_px * 1.16, height * 0.95,
               GRASS_TOP + height, mat_roof)


def skyline(cam, name, px, py, blocks, mats, mat_roof):
    """Manzana de edificios alrededor de un centro.

    `blocks` es una lista de (dx, dy, ancho, fondo, altura). La altura varía a
    propósito: con todos los edificios a la misma cota el conjunto se leía como
    una aldea plana en vez de un núcleo urbano.
    """
    for i, (dx, dy, w, d, h) in enumerate(blocks):
        house(cam, f"{name}_blk_{i}", px + dx, py + dy, w, d, h, mat_roof, mats)


def add_academia(cam, px, py, mats):
    """Academia Ágora — capital académica. Rotonda con columnata sobre plaza.

    Es el hub y el punto de partida: se lleva la silueta más noble y la única
    planta circular. La rotonda va al norte del pin para que el pin y ARIA
    queden sobre la plaza libre.
    """
    disc_px(cam, "academia_plaza", px, py + 40, 190, GRASS_TOP, 0.05, mats["tile"],
            walkable=True)
    for angle_deg, dist in ((200, 250), (340, 250), (90, 235)):
        angle = math.radians(angle_deg)
        street(cam, px, py + 40, px + dist * math.cos(angle),
               py + 40 + dist * math.sin(angle) * 0.8, 46, mats["path"])

    lx, ly = px, py - 90
    disc_px(cam, "academia_base2", lx, ly, 108, GRASS_TOP, 0.22, mats["stone"])
    disc_px(cam, "academia_base1", lx, ly, 90, GRASS_TOP + 0.22, 0.2, mats["stone"])
    for i in range(14):
        angle = 2 * math.pi * i / 14
        disc_px(cam, f"academia_col_{i}", lx + 68 * math.cos(angle),
                ly + 68 * math.sin(angle) * 0.85, 9, GRASS_TOP + 0.42, 1.5,
                mats["cream"], verts=10)
    disc_px(cam, "academia_arq", lx, ly, 80, GRASS_TOP + 1.92, 0.18, mats["cream"])
    pyramid_px(cam, "academia_roof", lx, ly, 196, 196, 1.15, GRASS_TOP + 2.10,
               mats["academia"], verts=14)
    disc_px(cam, "academia_finial", lx, ly, 9, GRASS_TOP + 3.25, 0.4,
            mats["academia"], verts=8)

    # Ala académica alrededor de la plaza.
    for i, (dx, dy, w, d, rot) in enumerate((
        (-186, 26, 108, 74, 0.0), (188, 16, 100, 72, 0.0),
        (-140, 132, 92, 66, 0.12), (150, 140, 96, 68, -0.12),
        (-16, 178, 120, 70, 0.0),
    )):
        house(cam, f"academia_wing_{i}", px + dx, py + dy, w, d, 1.25,
              mats["academia"], mats, rot)
    for i, (dx, dy) in enumerate(((-96, -34), (104, -40))):
        disc_px(cam, f"academia_obelisk_{i}", px + dx, py + dy, 13,
                GRASS_TOP, 1.5, mats["stone"], verts=6)
    # Nada al sur del pin: por ahí sale el jugador y ahí está ARIA. Dos bloques
    # a ±70 px encerraron la plaza y la búsqueda no encontraba salida desde el
    # punto de partida.
    skyline(cam, "academia", px, py, [
        (-268, 96, 84, 60, 1.9), (262, 104, 88, 62, 2.2), (-232, -66, 76, 56, 1.5),
        (238, -78, 80, 58, 1.7), (-300, 268, 92, 64, 1.3), (312, 262, 86, 60, 1.6),
        (-340, 40, 72, 54, 1.1), (346, 36, 74, 56, 1.2),
    ], mats, mats["roof_alt"])


def add_mercado(cam, px, py, mats):
    """Mercado Plaza — villa de mercado: lonja con campanario y puestos."""
    disc_px(cam, "mercado_plaza", px, py + 34, 168, GRASS_TOP, 0.05, mats["tile"],
            walkable=True)
    street(cam, px, py + 34, px - 210, py + 150, 44, mats["path"])
    street(cam, px, py + 34, px + 180, py + 130, 44, mats["path"])

    lx, ly = px + 4, py - 96
    box_px(cam, "mercado_hall", lx, ly, 210, 130, 1.5, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "mercado_hall_roof", lx, ly, 232, 148, 1.9, GRASS_TOP + 1.5,
               mats["mercado"])
    box_px(cam, "mercado_tower", lx + 118, ly + 18, 46, 42, 2.6, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "mercado_tower_roof", lx + 118, ly + 18, 58, 54, 1.5,
               GRASS_TOP + 2.6, mats["mercado"])
    disc_px(cam, "mercado_clock", lx + 118, ly + 6, 15, GRASS_TOP + 2.2, 0.1,
            mats["academia"], verts=14)

    # Puestos con toldo alrededor de la plaza.
    for i, (dx, dy) in enumerate((
        (-124, 6), (-96, 96), (10, 116), (116, 82), (140, -10), (-40, 150),
    )):
        box_px(cam, f"mercado_stall_{i}", px + dx, py + dy, 60, 46, 0.72,
               GRASS_TOP, mats["cream"])
        pyramid_px(cam, f"mercado_awn_{i}", px + dx, py + dy, 82, 62, 0.9,
                   GRASS_TOP + 0.72, mats["mercado"] if i % 2 == 0 else mats["roof_alt"])
    for i, (dx, dy) in enumerate(((-170, 74), (66, 168), (176, 60))):
        box_px(cam, f"mercado_crate_{i}", px + dx, py + dy, 26, 22, 0.34,
               GRASS_TOP, mats["crate"])
    skyline(cam, "mercado", px, py, [
        (-238, -40, 84, 60, 2.0), (232, -58, 80, 58, 2.3), (-206, 130, 78, 56, 1.4),
        (214, 138, 82, 58, 1.6), (-40, 244, 88, 62, 1.2), (128, 232, 76, 54, 1.5),
        (280, 40, 70, 52, 1.8),
    ], mats, mats["mercado"])


def add_taller(cam, px, py, mats):
    """Taller de Velas — villa artesana con una vela japonesa gigante.

    La vela es la enseña que hace el distrito reconocible de un vistazo: es
    literalmente lo que se enseña ahí (m1_2, velas OHLC). Ahora domina el
    conjunto en vez de ser un adorno al lado del taller.
    """
    disc_px(cam, "taller_plaza", px, py + 26, 140, GRASS_TOP, 0.05, mats["tile"],
            walkable=True)
    street(cam, px, py + 26, px + 230, py - 26, 44, mats["path"])
    street(cam, px, py + 26, px - 150, py + 120, 40, mats["path"])

    lx, ly = px - 30, py - 86
    box_px(cam, "taller_body", lx, ly, 168, 108, 1.4, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "taller_roof", lx, ly, 190, 126, 1.8, GRASS_TOP + 1.4,
               mats["taller"])
    box_px(cam, "taller_chimney", lx + 62, ly - 22, 28, 26, 1.5, GRASS_TOP + 1.0,
           mats["stone"])
    for i, (dx, dy, w, d) in enumerate((
        (-160, 34, 84, 62), (150, 46, 90, 64), (-88, 140, 78, 58), (86, 148, 82, 60),
    )):
        house(cam, f"taller_house_{i}", px + dx, py + dy, w, d, 1.1,
              mats["roof_alt"] if i % 2 else mats["taller"], mats)

    # Vela alcista gigante: mecha, cuerpo verde, mecha superior.
    cx, cy = px + 132, py - 24
    box_px(cam, "taller_wick", cx, cy, 9, 9, 4.6, GRASS_TOP, mats["ink"])
    box_px(cam, "taller_candle", cx, cy, 58, 46, 2.3, GRASS_TOP + 1.15,
           mats["demand"])
    # Vela bajista pequeña al lado: el par enseña la lectura alcista/bajista.
    box_px(cam, "taller_wick2", cx + 74, cy + 30, 7, 7, 3.0, GRASS_TOP, mats["ink"])
    box_px(cam, "taller_candle2", cx + 74, cy + 30, 42, 34, 1.3, GRASS_TOP + 0.8,
           mats["supply"])
    skyline(cam, "taller", px, py, [
        (-236, -30, 80, 58, 1.7), (-208, 118, 76, 56, 1.3), (-92, 216, 84, 60, 1.5),
        (96, 222, 78, 56, 1.2), (222, 128, 74, 54, 1.6), (-282, 76, 68, 50, 1.1),
    ], mats, mats["roof_alt"])


def add_observatorio(cam, px, py, mats):
    """Observatorio — campus en terrazas con cúpula y telescopio."""
    disc_px(cam, "obs_terrace2", px, py + 20, 172, GRASS_TOP, 0.16, mats["stone"],
            walkable=True)
    disc_px(cam, "obs_terrace1", px, py - 10, 128, GRASS_TOP + 0.16, 0.16,
            mats["stone"], walkable=True)
    street(cam, px, py + 40, px + 230, py + 130, 42, mats["path"])

    lx, ly = px, py - 66
    disc_px(cam, "obs_tower", lx, ly, 62, GRASS_TOP + 0.32, 1.9, mats["cream"], verts=22)
    dome_px(cam, "obs_dome", lx, ly, 66, GRASS_TOP + 2.22, mats["observatorio"])
    step_x, _ = pixel_scale(cam)
    centre = px_to_world(cam, lx + 12, ly - 16)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=1.0, depth=1.0,
        location=(centre.x, centre.y, GRASS_TOP + 3.0))
    tube = bpy.context.active_object
    tube.name = "obs_telescope"
    tube.scale = (13 * step_x, 13 * step_x, 2.4)
    tube.rotation_euler = (math.radians(54), 0.0, math.radians(-28))
    _finish(tube, mats["ink"], False, True)

    for i, (dx, dy, w, d) in enumerate((
        (-150, 78, 86, 62), (146, 86, 90, 64), (-56, 150, 78, 58),
    )):
        house(cam, f"obs_house_{i}", px + dx, py + dy, w, d, 1.1,
              mats["observatorio"], mats)
    # Antena parabólica: lee el cielo, igual que el distrito lee la tendencia.
    dome_px(cam, "obs_dish", px + 128, py - 26, 40, GRASS_TOP + 0.9,
            mats["cream"], squash=0.34)
    skyline(cam, "obs", px, py, [
        (-232, -18, 78, 56, 1.6), (236, -34, 74, 54, 1.9), (-186, 168, 80, 58, 1.2),
        (196, 176, 76, 56, 1.4), (24, 254, 84, 60, 1.1),
    ], mats, mats["observatorio"])


def add_boveda(cam, px, py, mats):
    """La Bóveda (M1.4) — gestión de riesgo.

    Fortaleza compacta con puerta de cámara acorazada y un faro al lado: el
    faro es el stop loss, la señal que avisa antes de que sea tarde.
    """
    disc_px(cam, "boveda_plaza", px, py + 30, 130, GRASS_TOP, 0.05, mats["tile"],
            walkable=True)
    street(cam, px, py + 30, px + 210, py - 90, 42, mats["path"])

    lx, ly = px, py - 70
    box_px(cam, "boveda_body", lx, ly, 170, 112, 1.5, GRASS_TOP, mats["stone"])
    pyramid_px(cam, "boveda_roof", lx, ly, 188, 128, 1.35, GRASS_TOP + 1.5, mats["vault"])
    disc_px(cam, "boveda_door", lx, ly + 54, 38, GRASS_TOP + 0.2, 1.0,
            mats["vault"], verts=18)
    disc_px(cam, "boveda_dial", lx, ly + 54, 16, GRASS_TOP + 1.2, 0.14,
            mats["academia"], verts=12)
    # Faro-señal.
    disc_px(cam, "boveda_light_base", lx + 118, ly + 12, 34, GRASS_TOP, 0.2, mats["stone"])
    disc_px(cam, "boveda_light", lx + 118, ly + 12, 24, GRASS_TOP + 0.2, 2.6,
            mats["cream"], verts=14)
    disc_px(cam, "boveda_lamp", lx + 118, ly + 12, 20, GRASS_TOP + 2.8, 0.42,
            mats["supply"], verts=12)
    for i, (dx, dy) in enumerate(((-140, 66), (128, 92))):
        house(cam, f"boveda_house_{i}", px + dx, py + dy, 78, 58, 1.0,
              mats["vault"], mats)
    skyline(cam, "boveda", px, py, [
        (-216, -46, 74, 54, 1.5), (206, -58, 78, 56, 1.7), (-166, 150, 72, 52, 1.1),
        (176, 156, 70, 52, 1.3),
    ], mats, mats["vault"])


def add_arena(cam, px, py, mats):
    """Arena del Desafío (M1.5) — evaluación final.

    Anfiteatro: gradas concéntricas y pista abierta. Es el único sitio del mapa
    sin techo, porque aquí no se aprende, se demuestra.
    """
    disc_px(cam, "arena_ring3", px, py, 176, GRASS_TOP, 0.28, mats["stone"])
    disc_px(cam, "arena_ring2", px, py, 142, GRASS_TOP + 0.28, 0.28, mats["arena"])
    disc_px(cam, "arena_ring1", px, py, 108, GRASS_TOP + 0.56, 0.26, mats["stone"])
    disc_px(cam, "arena_floor", px, py, 78, GRASS_TOP + 0.2, 0.1, mats["tile"],
            walkable=True)
    for i in range(10):
        angle = 2 * math.pi * i / 10
        disc_px(cam, f"arena_post_{i}", px + 150 * math.cos(angle),
                py + 150 * math.sin(angle) * 0.85, 11, GRASS_TOP + 0.28, 1.5,
                mats["arena"], verts=8)
    street(cam, px, py + 150, px - 190, py + 60, 44, mats["path"])
    # Estandarte de Marco, el mentor que pone la prueba.
    box_px(cam, "arena_banner_pole", px, py - 116, 10, 10, 3.2, GRASS_TOP, mats["ink"])
    box_px(cam, "arena_banner", px + 30, py - 116, 54, 8, 1.2, GRASS_TOP + 1.8,
           mats["academia"])


def add_ciudad_bitcoin(cam, px, py, mats):
    """Ciudad Bitcoin — planta circular al pie del volcán.

    Sigue lo documentado: WORLD_3D_ROADMAP.md ("planta circular al pie de un
    volcán, plaza del bloque y puerto Lightning"), la referencia de Conchagua
    con energía geotérmica, y las cinco zonas de BITCOIN_CURRICULUM.md —
    Plaza Genesis, Taller de Bloques, Casa de Custodia, Puente Lightning y
    Mercado BTC — repartidas como barrios alrededor de la plaza central.
    """
    # Anillo urbano y calzada circular.
    disc_px(cam, "btc_ring", px, py + 96, 250, GRASS_TOP, 0.05, mats["ash"],
            walkable=True)
    disc_px(cam, "btc_ring_road", px, py + 96, 208, GRASS_TOP + 0.05, 0.04,
            mats["tile"], walkable=True)
    disc_px(cam, "btc_inner", px, py + 96, 166, GRASS_TOP + 0.09, 0.04, mats["ash"],
            walkable=True)

    # Plaza Genesis: centro exacto, con el monolito del bloque fundacional.
    disc_px(cam, "btc_genesis", px, py + 96, 104, GRASS_TOP + 0.13, 0.05,
            mats["tile"], walkable=True)
    box_px(cam, "btc_genesis_block", px, py + 74, 54, 46, 2.2, GRASS_TOP + 0.18,
           mats["bitcoin"])
    disc_px(cam, "btc_genesis_seal", px, py + 74, 20, GRASS_TOP + 2.38, 0.12,
            mats["cream"], verts=16)
    for i in range(8):
        angle = 2 * math.pi * i / 8
        disc_px(cam, f"btc_genesis_post_{i}", px + 92 * math.cos(angle),
                py + 96 + 92 * math.sin(angle) * 0.85, 9, GRASS_TOP + 0.13, 0.8,
                mats["btc_block"], verts=6)

    # Cuatro barrios alrededor de la plaza, uno por zona del currículo.
    # Taller de Bloques — noroeste: cubos apilados, la cadena.
    bx, by = px - 172, py + 40
    box_px(cam, "btc_blocks_hall", bx, by, 128, 88, 1.3, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "btc_blocks_roof", bx, by, 146, 102, 1.3, GRASS_TOP + 1.3,
               mats["bitcoin"])
    for i in range(4):
        box_px(cam, f"btc_chain_{i}", bx - 30 + i * 34, by + 74, 30, 26,
               0.5 + 0.22 * (i % 3), GRASS_TOP, mats["btc_block"])

    # Casa de Custodia — noreste: cámara con puerta blindada.
    cx, cy = px + 176, py + 44
    box_px(cam, "btc_custody", cx, cy, 122, 86, 1.5, GRASS_TOP, mats["stone"])
    pyramid_px(cam, "btc_custody_roof", cx, cy, 140, 100, 1.3, GRASS_TOP + 1.5,
               mats["vault"])
    disc_px(cam, "btc_custody_door", cx, cy + 42, 28, GRASS_TOP + 0.2, 0.9,
            mats["vault"], verts=16)

    # Mercado BTC — sureste: puestos con toldo naranja y tablero de precio.
    mx, my = px + 150, py + 214
    for i, (dx, dy) in enumerate(((-52, 0), (14, 22), (74, -6))):
        box_px(cam, f"btc_market_{i}", mx + dx, my + dy, 54, 42, 0.7, GRASS_TOP,
               mats["cream"])
        pyramid_px(cam, f"btc_market_awn_{i}", mx + dx, my + dy, 74, 58, 0.85,
                   GRASS_TOP + 0.7, mats["bitcoin"])
    box_px(cam, "btc_ticker_pole", mx - 108, my - 8, 10, 10, 2.4, GRASS_TOP, mats["ink"])
    box_px(cam, "btc_ticker", mx - 108, my - 8, 76, 12, 0.7, GRASS_TOP + 2.1,
           mats["ink"])

    # Puente Lightning — suroeste, saliendo al agua: el puerto documentado.
    lx, ly = px - 150, py + 218
    box_px(cam, "btc_lightning_hall", lx, ly, 116, 80, 1.2, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "btc_lightning_roof", lx, ly, 134, 94, 1.25, GRASS_TOP + 1.2,
               mats["academia"])
    step_x, _ = pixel_scale(cam)
    for i in range(3):
        box_px(cam, f"btc_pier_{i}", lx - 60 - i * 54, ly + 88 + i * 30, 62, 26,
               0.16, GRASS_TOP - 0.16, mats["bridge"], rot=math.radians(-22))
    # Rayo: la marca del puerto.
    box_px(cam, "btc_bolt_a", lx + 8, ly - 62, 14, 12, 1.5, GRASS_TOP + 0.2,
           mats["academia"], rot=math.radians(22))
    box_px(cam, "btc_bolt_b", lx - 6, ly - 88, 14, 12, 1.2, GRASS_TOP + 1.5,
           mats["academia"], rot=math.radians(-22))

    # Volcán al norte, con fumarolas geotérmicas: la energía de Conchagua.
    vx, vy = px + 6, py - 190
    disc_px(cam, "btc_cone_base", vx, vy, 190, GRASS_TOP, 0.5, mats["ash"])
    centre = px_to_world(cam, vx, vy)
    bpy.ops.mesh.primitive_cone_add(vertices=9, radius1=0.5, radius2=0.15, depth=4.4,
                                    location=(centre.x, centre.y, GRASS_TOP + 2.6))
    cone = bpy.context.active_object
    cone.name = "btc_cone"
    cone.scale = (300 * step_x, 300 * pixel_scale(cam)[1], 1.0)
    _finish(cone, mats["rock"], False, smooth=False)
    disc_px(cam, "btc_crater", vx, vy, 40, GRASS_TOP + 4.72, 0.14, mats["lava"], verts=9)
    for i, (dx, dy, r) in enumerate(((-150, 96, 26), (140, 110, 22), (-24, 150, 18))):
        disc_px(cam, f"btc_steam_{i}", vx + dx, vy + dy, r, GRASS_TOP + 0.3, 0.5,
                mats["steam"], verts=14)

    # Torres del anillo exterior. Es la ciudad con más material documentado y
    # tiene que verse como la más imponente del mapa: aquí está el salto de
    # aldea a skyline.
    for i, (angle_deg, dist, w, h) in enumerate((
        (18, 258, 62, 3.4), (52, 268, 56, 2.6), (86, 250, 66, 4.0),
        (124, 262, 58, 2.9), (158, 256, 60, 3.6), (196, 268, 54, 2.4),
        (232, 252, 64, 3.1), (268, 262, 58, 2.7), (306, 256, 60, 3.8),
        (342, 264, 56, 2.5),
    )):
        angle = math.radians(angle_deg)
        tx = px + dist * math.cos(angle)
        ty = py + 96 + dist * math.sin(angle) * 0.82
        box_px(cam, f"btc_tower_{i}", tx, ty, w, w * 0.82, h, GRASS_TOP,
               mats["cream"])
        pyramid_px(cam, f"btc_tower_top_{i}", tx, ty, w * 1.14, w * 0.94, h * 0.34,
                   GRASS_TOP + h, mats["bitcoin"] if i % 2 == 0 else mats["btc_block"])

# ─── VEGETACIÓN Y ROCAS ──────────────────────────────────────────────────────
def add_tree(cam, px, py, mats, scale=1.0):
    """Árbol de copa ancha.

    Antes la copa medía 13 px sobre un tronco de 3,4: a la escala del mapa se
    leían como alfileres clavados en la hierba. Copa más ancha y baja, tronco
    más corto y grueso.
    """
    step_x, step_y = pixel_scale(cam)
    disc_px(cam, f"trunk_{px}_{py}", px, py, 5.5 * scale, GRASS_TOP, 0.4 * scale,
            mats["trunk"], verts=8)
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=2, radius=1.0,
        location=(base.x, base.y, GRASS_TOP + 0.78 * scale))
    leaves = bpy.context.active_object
    leaves.name = f"leaves_{px}_{py}"
    leaves.scale = (24 * scale * step_x, 24 * scale * step_y, 15 * scale * step_x)
    _finish(leaves, mats["leaf"], False, True)


def add_islet(cam, name, px, py, radius_px, mats, palm=True):
    """Islote decorativo. NO caminable: equilibra la composición sin prometer
    terreno al jugador — el mar ya es negro en la máscara y estos también."""
    disc_px(cam, f"islet_halo_{name}", px, py, radius_px * 1.35, -0.05, 0.05,
            mats["shallow"], shadow=False)
    disc_px(cam, f"islet_sand_{name}", px, py, radius_px, 0.0, LAND_HEIGHT * 0.6,
            mats["sand"], shadow=False)
    if palm:
        add_tree(cam, px, py - 2, mats, 0.62)
    else:
        add_rock(cam, px + 2, py - 2, radius_px * 0.42, mats["rock"])


def add_rock(cam, px, py, size_px, mat):
    step_x, step_y = pixel_scale(cam)
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=1.0,
                                          location=(base.x, base.y, GRASS_TOP + 0.05))
    rock = bpy.context.active_object
    rock.name = f"rock_{px}_{py}"
    rock.scale = (size_px * step_x, size_px * step_y * 0.8, size_px * step_x * 0.7)
    _finish(rock, mat, False, False)


# ─── ENSAMBLADO ──────────────────────────────────────────────────────────────
def build_overworld(cam):
    mats = {
        "sea": make_material("sea", SEA_HEX, roughness=0.22),
        "shallow": make_material("shallow", SHALLOW_HEX, roughness=0.28),
        "grass": make_material("grass", GRASS_HEX),
        "sand": make_material("sand", SAND_HEX),
        "stone": make_material("stone", STONE_HEX),
        "cream": make_material("cream", CREAM_HEX),
        "rock": make_material("rock", ROCK_HEX),
        "bridge": make_material("bridge", BRIDGE_HEX),
        "path": make_material("path", PATH_HEX),
        "trunk": make_material("trunk", TRUNK_HEX),
        "leaf": make_material("leaf", LEAF_HEX),
        "ink": make_material("ink", INK_HEX, roughness=0.75),
        "demand": make_material("demand", DEMAND_HEX),
        "crate": make_material("crate", CRATE_HEX),
        "lava": make_material("lava", LAVA_HEX, roughness=0.35),
        "academia": make_material("academia", ACADEMIA_HEX),
        "mercado": make_material("mercado", MERCADO_HEX),
        "taller": make_material("taller", TALLER_HEX),
        "observatorio": make_material("observatorio", OBSERVATORIO_HEX),
        "bitcoin": make_material("bitcoin", BITCOIN_HEX),
        "btc_block": make_material("btc_block", BTC_BLOCK_HEX),
        "supply": make_material("supply", SUPPLY_HEX),
        "tile": make_material("tile", TILE_HEX),
        "roof_alt": make_material("roof_alt", ROOF_ALT_HEX),
        "ash": make_material("ash", ASH_HEX),
        "steam": make_material("steam", STEAM_HEX, roughness=0.9),
        "vault": make_material("vault", VAULT_HEX),
        "arena": make_material("arena", ARENA_HEX),
    }

    add_sea(cam, mats["sea"])

    for group, lobes in (("main", MAIN_LOBES), ("mercado", MERCADO_LOBES),
                         ("bitcoin", BITCOIN_LOBES)):
        # La isla de Bitcoin era toda roca gris y se leía apagada. Tierra
        # volcánica cálida, que además contrasta mejor con el naranja cripto.
        ground = mats["ash"] if group == "bitcoin" else mats["grass"]
        add_island_group(cam, group, lobes, mats, ground)

    for index, (x1, y1, x2, y2, width) in enumerate(BRIDGES):
        add_bridge(cam, f"bridge_{index}", x1, y1, x2, y2, width, mats["bridge"])
    for index, (px, py, w_px, d_px, rot) in enumerate(DOCKS):
        add_dock(cam, f"dock_{index}", px, py, w_px, d_px, rot, mats["bridge"])

    # Red de caminos: la Academia como plaza central de la que sale todo.
    for x1, y1, x2, y2, width in (
        (1180, 880, 900, 1010, 54),     # → Taller
        (900, 1010, 640, 1030, 50),
        (900, 1010, 700, 780, 48),      # → Observatorio
        (700, 780, 500, 620, 46),
        (1180, 880, 1400, 940, 54),     # → puente de Mercado
        (1400, 940, 1690, 880, 54),
        (1220, 840, 1540, 700, 54),     # → puente de Bitcoin
        (1050, 1010, 1010, 1180, 48),   # → La Bóveda
        (1400, 960, 1620, 1080, 48),    # → Arena del Desafío
    ):
        add_path(cam, x1, y1, x2, y2, width, mats["path"])
    add_path(cam, 2020, 740, 2090, 700, 48, mats["path"])

    add_academia(cam, ACADEMIA_PX[0], ACADEMIA_PX[1], mats)
    add_mercado(cam, MERCADO_PX[0], MERCADO_PX[1], mats)
    add_taller(cam, TALLER_PX[0], TALLER_PX[1], mats)
    add_observatorio(cam, OBSERVATORIO_PX[0], OBSERVATORIO_PX[1], mats)
    add_boveda(cam, BOVEDA_PX[0], BOVEDA_PX[1], mats)
    add_arena(cam, ARENA_PX[0], ARENA_PX[1], mats)
    add_ciudad_bitcoin(cam, BITCOIN_PX[0], BITCOIN_PX[1], mats)

    for px, py, scale in [
        (1330, 1150, 1.5), (1560, 950, 1.3), (1300, 640, 1.2), (860, 880, 1.4),
        (620, 780, 1.2), (300, 780, 1.3), (820, 1250, 1.4), (1180, 1120, 1.15),
        (2280, 420, 1.3), (2380, 700, 1.2), (1960, 300, 1.1), (1500, 1200, 1.0),
        (1760, 950, 1.1), (420, 1000, 1.2),
    ]:
        add_tree(cam, px, py, mats, scale)

    for px, py, size in [
        (1480, 860, 13), (860, 1180, 11), (560, 720, 12), (2320, 520, 11),
        (1640, 130, 10), (1960, 180, 9),
    ]:
        add_rock(cam, px, py, size, mats["rock"])

    # Islotes: los distritos viven en el centro-derecha del cuadro y dejaban un
    # vacío azul enorme a la izquierda. Rellenan la composición sin tocar la
    # máscara, porque no son caminables.
    for name, px, py, radius, palm in [
        ("w1", 130, 1080, 60, True),
        ("w2", 180, 300, 44, False),
        ("s1", 620, 1360, 56, True),
        ("s2", 1240, 1390, 40, False),
        ("n1", 940, 260, 52, True),
        ("n2", 1180, 180, 36, False),
        ("e1", 2460, 320, 48, True),
        ("e2", 2420, 1160, 60, True),
        ("e3", 1980, 1320, 42, False),
        ("n3", 2380, 160, 40, True),
        ("s3", 300, 1300, 46, False),
    ]:
        add_islet(cam, name, px, py, radius, mats, palm)

# ─── LUCES / MUNDO ───────────────────────────────────────────────────────────
def setup_lights():
    # Mismo esquema que build_explorer.py para que el personaje case sobre el
    # mapa: key cálida desde arriba-derecha y un fill suave desde la izquierda.
    # Sol alto y de disco ancho: en un diorama visto casi desde arriba, un sol
    # bajo tira sombras larguísimas que se leen como manchas negras sobre el
    # mapa y tapan el terreno. Sombra corta y difusa.
    bpy.ops.object.light_add(type="SUN", location=(14, 8, 30))
    key = bpy.context.active_object
    key.data.energy = 2.6
    key.data.angle = math.radians(7)   # disco angular; 38° emborronaba la sombra
    key.rotation_euler = (math.radians(-22), 0, math.radians(148))

    bpy.ops.object.light_add(type="SUN", location=(-16, 4, 18))
    fill = bpy.context.active_object
    fill.data.energy = 1.2
    fill.rotation_euler = (math.radians(-40), 0, math.radians(215))


def setup_world():
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hexrgba(SKY_HEX)
    bg.inputs["Strength"].default_value = 1.05  # levanta las sombras: nada de negros


# ─── RENDER ──────────────────────────────────────────────────────────────────
def setup_render(freestyle=True, resolution=None, image_format="WEBP", quality=None):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = False
    scene.render.resolution_x, scene.render.resolution_y = resolution or RESOLUTION
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = image_format
    scene.render.image_settings.color_mode = "RGBA"
    if image_format == "WEBP":
        # quality=100 en WebP no es "casi sin pérdida": Blender cambia al
        # codificador lossless. Es lo que pide la máscara.
        scene.render.image_settings.quality = DIORAMA_QUALITY if quality is None else quality
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass

    scene.render.use_freestyle = freestyle
    view_layer = scene.view_layers[0]
    view_layer.use_freestyle = freestyle
    if not freestyle:
        return
    fs = view_layer.freestyle_settings
    lineset = fs.linesets[0] if len(fs.linesets) else fs.linesets.new("LineSet")
    if lineset.linestyle is None:
        lineset.linestyle = bpy.data.linestyles.new("LineStyle")
    lineset.select_by_edge_types = True
    lineset.select_silhouette = True
    lineset.select_border = True
    lineset.select_crease = True
    lineset.select_material_boundary = True
    fs.crease_angle = math.radians(120)
    lineset.linestyle.color = hexrgba(INK_HEX)[:3]
    lineset.linestyle.thickness = OUTLINE_THICKNESS


def output_path(filename):
    try:
        base = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        base = bpy.path.abspath("//")
    out_dir = os.path.normpath(os.path.join(base, "..", "..", "public", "assets", "world"))
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, filename)


def render_to(filename):
    path = output_path(filename)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[TraderPath] {filename} → {path}")
    return path


def render_walkmask():
    """Segunda pasada: emisión plana, blanco = caminable, negro = todo lo demás.

    Sale de la misma cámara y la misma geometría, así que cada píxel de la
    máscara corresponde exactamente al mismo píxel del diorama. La oclusión la
    resuelve el propio render: si un edificio tapa el suelo, ese píxel queda
    negro, que es justo lo que queremos (no se puede pisar lo que no se ve).
    """
    white = bpy.data.materials.new("mask_walkable")
    white.use_nodes = True
    nodes = white.node_tree.nodes
    nodes.clear()
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    emission.inputs["Strength"].default_value = 1.0
    output = nodes.new("ShaderNodeOutputMaterial")
    white.node_tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])

    black = bpy.data.materials.new("mask_blocked")
    black.use_nodes = True
    nodes = black.node_tree.nodes
    nodes.clear()
    emission = nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    emission.inputs["Strength"].default_value = 1.0
    output = nodes.new("ShaderNodeOutputMaterial")
    black.node_tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])

    for obj in WALKABLE:
        obj.data.materials.clear()
        obj.data.materials.append(white)
    for obj in BLOCKING:
        obj.data.materials.clear()
        obj.data.materials.append(black)

    scene = bpy.context.scene
    scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.0
    scene.cycles.samples = 16
    scene.cycles.use_denoising = False
    # El contorno arruinaría los bordes binarios, y WebP lossless (quality=100)
    # porque la máscara debe ser exacta: un artefacto de compresión aquí es una
    # celda de terreno que cambia de estado. Verificado píxel a píxel contra el
    # PNG anterior — 0 diferencias y un tercio del peso (532 KB → 162 KB).
    setup_render(freestyle=False, resolution=MASK_RESOLUTION, image_format="WEBP", quality=100)
    return render_to("overworld_walkmask.webp")


def _sample(pixels, width, height, px, py):
    """Muestrea la máscara con coordenadas de AUTORÍA (las de RESOLUTION).

    La máscara se renderiza más pequeña que el diorama, así que hay que escalar;
    es la misma conversión que hace WalkMask en el juego.
    """
    mx = px * width / RESOLUTION[0]
    my = py * height / RESOLUTION[1]
    ix = min(max(int(mx), 0), width - 1)
    iy = min(max(int(height - 1 - my), 0), height - 1)   # Blender: origen abajo
    return pixels[(iy * width + ix) * 4]


def _nearest_walkable(pixels, width, height, px, py, max_radius=300):
    """Píxel caminable más cercano, para sugerir a dónde mover un `approach`."""
    best = None
    for radius in range(12, max_radius, 8):
        for step in range(0, 360, 10):
            angle = math.radians(step)
            cx = px + radius * math.cos(angle)
            cy = py + radius * math.sin(angle)
            if _sample(pixels, width, height, cx, cy) > 0.9:
                # exige margen: que sus vecinos también sean caminables
                if all(_sample(pixels, width, height, cx + dx, cy + dy) > 0.9
                       for dx, dy in ((-28, 0), (28, 0), (0, -28), (0, 28))):
                    best = (int(cx), int(cy), radius)
                    return best
    return best


def verify_required_points(mask_path):
    """Comprueba que el juego pueda pisar los puntos que ya usa Phaser.

    Si alguno cae en agua propone el caminable más cercano: con terreno real,
    un `approach` heredado del hero pintado puede quedar en un canal, y eso es
    una decisión de diseño (mover el punto en Phaser), no un bug del render.
    """
    image = bpy.data.images.load(mask_path)
    width, height = image.size
    pixels = image.pixels[:]
    failures = []
    for name, (px, py) in REQUIRED_WALKABLE_PX.items():
        value = _sample(pixels, width, height, px, py)
        if value > 0.5:
            print(f"[TraderPath]   OK   {name} px=({px},{py}) valor={value:.3f}")
            continue
        suggestion = _nearest_walkable(pixels, width, height, px, py)
        hint = (f" → caminable más cercano: ({suggestion[0]},{suggestion[1]}), "
                f"a {suggestion[2]} px") if suggestion else " → sin caminable cerca"
        print(f"[TraderPath]   AGUA {name} px=({px},{py}) valor={value:.3f}{hint}")
        failures.append(name)
    bpy.data.images.remove(image)

    if failures:
        pending = [f for f in failures if f in PENDING_APPROACH_MOVES]
        blocking = [f for f in failures if f not in PENDING_APPROACH_MOVES]
        if blocking:
            raise SystemExit(
                "[TraderPath] La máscara deja fuera puntos obligatorios: "
                + ", ".join(blocking)
                + ". Ajusta MAIN_LOBES/BRIDGES/DOCKS y vuelve a renderizar."
            )
        print("[TraderPath] AVISO: " + ", ".join(pending)
              + " sigue en agua, pendiente de mover el approach en Phaser.")
    else:
        print("[TraderPath] Todos los puntos obligatorios caen en zona caminable.")


def main():
    reset_scene()
    cam = setup_camera()
    build_overworld(cam)
    setup_lights()
    setup_world()
    manual_map = skip_generated("world", "overworld", FORCE)
    if not MASK_ONLY and not manual_map:
        setup_render()
        render_to("overworld.webp")

    if skip_generated("world", "overworld_walkmask", FORCE):
        print("[TraderPath] Máscara manual: no se regenera ni se valida.")
        return
    mask_path = render_walkmask()
    if manual_map:
        # El mapa y la máscara son el mismo render visto de dos maneras. Si uno
        # es manual y la otra sale de la geometría del script, dejan de
        # corresponderse y el jugador camina sobre edificios.
        print(
            "[TraderPath] ⚠ El mapa es tuyo pero la máscara viene de la geometría "
            "de este script. Si tu mapa cambia por dónde se puede caminar, entrega "
            "también renders/assets/world/overworld_walkmask.png (blanco = pisable)."
        )
    verify_required_points(mask_path)
    print("[TraderPath] Diorama y máscara listos.")


main()

# ─── NOTA · CABLEADO EN PHASER (Fase 1, pendiente) ───────────────────────────
# La máscara se consume leyendo el píxel (x, y) en un canvas fuera de pantalla:
# blanco = pisable. Con eso, handlePointerDown deja de usar el clamp
# rectangular de walkArea y resuelve el destino contra la máscara, y el
# pathfinding puede bordear obstáculos muestreando la misma textura.
