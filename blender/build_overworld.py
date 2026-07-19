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
#   public/assets/world/overworld_walkmask.png  máscara (blanco = caminable)
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
import math
import mathutils

# ─── CONFIG ──────────────────────────────────────────────────────────────────
RESOLUTION = (1280, 720)   # 1:1 con WORLD_WIDTH/WORLD_HEIGHT de BaseWorldScene
SAMPLES = 96
OUTLINE_THICKNESS = 2.2

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
BTC_BLOCK_HEX = "#5D6E8C"  # tp-text-muted, monolitos de la Plaza del Bloque

# Distritos, en píxeles de Phaser. Deben coincidir con drawDistrictMarker() y
# con los hotspots de AcademyAgoraScene.createHotspots().
ACADEMIA_PX = (730, 410)
MERCADO_PX = (965, 262)
TALLER_PX = (516, 504)
OBSERVATORIO_PX = (372, 394)
BITCOIN_PX = (805, 196)

ACADEMIA_HEX = "#E5960A"       # tp-gold
MERCADO_HEX = "#33B77A"
TALLER_HEX = "#E8743B"
OBSERVATORIO_HEX = "#8B72FF"
BITCOIN_HEX = "#F7931A"        # tp-crypto

# Puntos que el jugador DEBE poder pisar: su posición inicial y los `approach`
# de cada hotspot. Al final el script verifica que la máscara los marque
# caminables y aborta si alguno quedó en el agua.
REQUIRED_WALKABLE_PX = {
    "player-start": (730, 520),
    "approach:market-plaza": (850, 370),
    "approach:candle-workshop": (620, 535),
    "approach:trend-observatory": (510, 440),
    "approach:bitcoin-portal": (772, 296),
    "approach:aria": (730, 500),
}

# `approach` heredados del hero pintado que, con terreno real, caen en agua y
# están pendientes de mover en AcademyAgoraScene.createHotspots(). Vacío: el de
# bitcoin-portal ya se movió a (772,296) en Phaser y aquí.
PENDING_APPROACH_MOVES: set[str] = set()

# Tierra firme, como lóbulos circulares EN PANTALLA (px_x, px_y, radio_px).
# Las tres masas están separadas a propósito: la única unión son los puentes,
# que es lo que obliga al jugador a rodear en vez de cruzar el agua.
MAIN_LOBES = [
    (700, 455, 132),   # meseta de la Academia (hub) y costa sur de salida
    (590, 505, 118),
    (505, 500, 115),   # Taller de Velas
    (430, 450, 100),
    (380, 395, 100),   # Observatorio
]
MERCADO_LOBES = [
    (985, 265, 110),   # Mercado Plaza
    (1050, 330, 78),
]
BITCOIN_LOBES = [
    (800, 180, 105),   # Ciudad Bitcoin
    (735, 135, 72),
]

# Puentes (px_x1, px_y1, px_x2, px_y2, ancho_px). Cada uno arranca sobre la
# masa central y aterriza en su isla; los `approach` de Mercado y Bitcoin caen
# justo encima del tablero, así que entrar exige pisar el puente.
BRIDGES = [
    (795, 420, 920, 300, 82),   # central → Mercado Plaza (cubre 850,370)
    # Trazado para que su eje pase por (772,296), el approach de bitcoin-portal:
    # a y=296 la línea da x=771. Antes se resolvía con un embarcadero suelto en
    # medio del canal, que se leía como una losa flotante.
    (740, 350, 800, 246, 90),   # central → Ciudad Bitcoin
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
# Cada distrito tiene que reconocerse por su silueta, no por su color. A esta
# escala un edificio mide ~70 px: se lee la forma, nada más.

def add_academia(cam, px, py, mats):
    """Templo circular: basamento escalonado, columnata y techo cónico dorado.

    Es el hub y el punto de partida, así que se lleva la silueta más noble.
    Redondo a propósito: destaca entre los demás, que son rectos.
    """
    disc_px(cam, "academia_base2", px, py, 40, GRASS_TOP, 0.14, mats["stone"])
    disc_px(cam, "academia_base1", px, py, 33, GRASS_TOP + 0.14, 0.14, mats["stone"])
    columns = 10
    for i in range(columns):
        angle = 2 * math.pi * i / columns
        cx = px + 25 * math.cos(angle)
        cy = py + 25 * math.sin(angle) * 0.85
        disc_px(cam, f"academia_col_{i}", cx, cy, 4.0, GRASS_TOP + 0.28, 1.0,
                mats["cream"], verts=10)
    disc_px(cam, "academia_arq", px, py, 30, GRASS_TOP + 1.28, 0.14, mats["cream"])
    pyramid_px(cam, "academia_roof", px, py, 72, 72, 0.8, GRASS_TOP + 1.42,
               mats["academia"], verts=12)
    disc_px(cam, "academia_finial", px, py, 3.5, GRASS_TOP + 2.22, 0.26,
            mats["academia"], verts=8)


def add_mercado(cam, px, py, mats):
    """Puestos de mercado: cuatro toldos a dos aguas alrededor de una placita."""
    disc_px(cam, "mercado_plaza", px, py, 46, GRASS_TOP, 0.06, mats["stone"])
    stalls = [(-26, -12), (24, -14), (-22, 16), (26, 14)]
    for i, (dx, dy) in enumerate(stalls):
        sx, sy = px + dx, py + dy
        box_px(cam, f"mercado_stall_{i}", sx, sy, 30, 24, 0.75, GRASS_TOP + 0.06,
               mats["cream"])
        pyramid_px(cam, f"mercado_awn_{i}", sx, sy, 40, 32, 0.5, GRASS_TOP + 0.81,
                   mats["mercado"])
    for i, (dx, dy) in enumerate([(-2, -30), (6, 28)]):
        box_px(cam, f"mercado_crate_{i}", px + dx, py + dy, 12, 10, 0.3,
               GRASS_TOP + 0.06, mats["crate"])


def add_taller(cam, px, py, mats):
    """Taller con chimenea + una vela japonesa gigante como enseña.

    La vela es el recurso que hace el distrito reconocible de un vistazo: es
    literalmente lo que se enseña ahí (m1_2, velas OHLC).
    """
    box_px(cam, "taller_body", px, py, 62, 46, 1.15, GRASS_TOP, mats["cream"])
    pyramid_px(cam, "taller_roof", px, py, 74, 56, 0.85, GRASS_TOP + 1.15,
               mats["taller"])
    box_px(cam, "taller_chimney", px + 22, py - 12, 11, 10, 0.9, GRASS_TOP + 1.2,
           mats["stone"])
    # Vela alcista: mecha, cuerpo verde, mecha superior.
    cx, cy = px + 52, py + 4
    box_px(cam, "taller_wick", cx, cy, 3.5, 3.5, 2.15, GRASS_TOP, mats["ink"])
    box_px(cam, "taller_candle", cx, cy, 20, 16, 1.05, GRASS_TOP + 0.55,
           mats["demand"])


def add_observatorio(cam, px, py, mats):
    """Torre cilíndrica con cúpula y telescopio asomando."""
    disc_px(cam, "obs_base", px, py, 26, GRASS_TOP, 0.12, mats["stone"])
    disc_px(cam, "obs_tower", px, py, 20, GRASS_TOP + 0.12, 1.15, mats["cream"],
            verts=20)
    dome_px(cam, "obs_dome", px, py, 21, GRASS_TOP + 1.27, mats["observatorio"])
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px + 4, py - 6)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=1.0, depth=1.0,
        location=(center.x, center.y, GRASS_TOP + 1.95))
    tube = bpy.context.active_object
    tube.name = "obs_telescope"
    tube.scale = (5.5 * step_x, 5.5 * step_x, 1.5)
    tube.rotation_euler = (math.radians(52), 0.0, math.radians(-28))
    _finish(tube, mats["ink"], False, True)


def add_ciudad_bitcoin(cam, px, py, mats):
    """Volcán + Plaza del Bloque.

    marketCities.ts fija para crypto: acento #F7931A, landmark "Plaza del
    Bloque", referencia Conchagua (El Salvador). De ahí el volcán y los
    monolitos cúbicos al pie.
    """
    disc_px(cam, "btc_cone_base", px, py - 4, 52, GRASS_TOP, 0.4, mats["rock"])
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py - 4)
    bpy.ops.mesh.primitive_cone_add(vertices=9, radius1=0.5, radius2=0.15, depth=2.5,
                                    location=(center.x, center.y, GRASS_TOP + 1.65))
    cone = bpy.context.active_object
    cone.name = "btc_cone"
    cone.scale = (86 * step_x, 86 * step_y, 1.0)
    # Facetado a propósito: sombreado suave lo convertía en una bola gris.
    _finish(cone, mats["rock"], False, smooth=False)
    disc_px(cam, "btc_crater", px, py - 4, 12, GRASS_TOP + 2.88, 0.1,
            mats["lava"], verts=9)
    # Plaza del Bloque: monolitos cúbicos al pie, en el lado que da a la cámara.
    for i, (dx, dy) in enumerate([(-46, 46), (-18, 56), (16, 54), (44, 42)]):
        box_px(cam, f"btc_block_{i}", px + dx, py + dy, 17, 15, 0.55 + 0.14 * (i % 3),
               GRASS_TOP, mats["btc_block"])
    box_px(cam, "btc_monolith", px - 2, py + 70, 13, 12, 1.35, GRASS_TOP,
           mats["bitcoin"])


# ─── VEGETACIÓN Y ROCAS ──────────────────────────────────────────────────────
def add_tree(cam, px, py, mats, scale=1.0):
    step_x, step_y = pixel_scale(cam)
    disc_px(cam, f"trunk_{px}_{py}", px, py, 3.4 * scale, GRASS_TOP, 0.55 * scale,
            mats["trunk"], verts=8)
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_ico_sphere_add(
        subdivisions=2, radius=1.0,
        location=(base.x, base.y, GRASS_TOP + 0.95 * scale))
    leaves = bpy.context.active_object
    leaves.name = f"leaves_{px}_{py}"
    leaves.scale = (13 * scale * step_x, 13 * scale * step_y, 11 * scale * step_x)
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
    }

    add_sea(cam, mats["sea"])

    for group, lobes in (("main", MAIN_LOBES), ("mercado", MERCADO_LOBES),
                         ("bitcoin", BITCOIN_LOBES)):
        ground = mats["rock"] if group == "bitcoin" else mats["grass"]
        add_island_group(cam, group, lobes, mats, ground)

    for index, (x1, y1, x2, y2, width) in enumerate(BRIDGES):
        add_bridge(cam, f"bridge_{index}", x1, y1, x2, y2, width, mats["bridge"])
    for index, (px, py, w_px, d_px, rot) in enumerate(DOCKS):
        add_dock(cam, f"dock_{index}", px, py, w_px, d_px, rot, mats["bridge"])

    # Senderos: la Academia como centro del que salen las rutas.
    for x1, y1, x2, y2 in (
        (730, 455, 620, 520),    # → Taller
        (620, 520, 470, 470),    # → Observatorio
        (470, 470, 400, 410),
        (730, 455, 795, 420),    # → puente de Mercado
        (730, 455, 738, 355),    # → puente de Bitcoin
    ):
        add_path(cam, x1, y1, x2, y2, 26, mats["path"])
    add_path(cam, 935, 300, 985, 268, 24, mats["path"])

    add_academia(cam, ACADEMIA_PX[0], ACADEMIA_PX[1] - 6, mats)
    add_mercado(cam, MERCADO_PX[0] + 12, MERCADO_PX[1] - 6, mats)
    # Desplazado a la izquierda del pin: un edificio se proyecta ~23 px hacia
    # arriba en pantalla por unidad de altura y tapaba el approach del
    # Observatorio en (510,440).
    add_taller(cam, TALLER_PX[0] - 58, TALLER_PX[1] + 4, mats)
    add_observatorio(cam, OBSERVATORIO_PX[0], OBSERVATORIO_PX[1] - 4, mats)
    add_ciudad_bitcoin(cam, BITCOIN_PX[0], BITCOIN_PX[1] - 10, mats)

    for px, py, scale in [
        (648, 578, 1.0), (596, 592, 0.8), (786, 540, 0.95), (818, 500, 0.8),
        (330, 442, 0.9), (322, 372, 0.8), (452, 344, 0.85), (426, 556, 0.9),
        (500, 578, 0.75), (1046, 250, 0.85), (1074, 344, 0.8), (940, 320, 0.7),
        (896, 232, 0.75),
    ]:
        add_tree(cam, px, py, mats, scale)

    for px, py, size in [
        (676, 470, 7), (556, 452, 6), (392, 486, 6.5), (1082, 286, 6),
        (742, 230, 5.5), (868, 214, 5),
    ]:
        add_rock(cam, px, py, size, mats["rock"])

    # Islotes: los distritos viven en el centro-derecha del cuadro y dejaban un
    # vacío azul enorme a la izquierda. Rellenan la composición sin tocar la
    # máscara, porque no son caminables.
    for name, px, py, radius, palm in [
        ("w1", 150, 470, 34, True),
        ("w2", 96, 372, 22, False),
        ("s1", 372, 648, 28, True),
        ("s2", 560, 676, 20, False),
        ("n1", 300, 176, 26, True),
        ("n2", 452, 120, 18, False),
        ("e1", 1196, 214, 24, True),
        ("e2", 1150, 520, 30, True),
        ("e3", 992, 592, 21, False),
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
def setup_render(freestyle=True):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = False
    scene.render.resolution_x, scene.render.resolution_y = RESOLUTION
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
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
    out_dir = os.path.normpath(os.path.join(base, "..", "public", "assets", "world"))
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
    setup_render(freestyle=False)   # el contorno arruinaría los bordes binarios
    return render_to("overworld_walkmask.png")


def _sample(pixels, width, height, px, py):
    ix = min(max(int(px), 0), width - 1)
    iy = min(max(int(height - 1 - py), 0), height - 1)   # Blender: origen abajo
    return pixels[(iy * width + ix) * 4]


def _nearest_walkable(pixels, width, height, px, py, max_radius=140):
    """Píxel caminable más cercano, para sugerir a dónde mover un `approach`."""
    best = None
    for radius in range(6, max_radius, 4):
        for step in range(0, 360, 10):
            angle = math.radians(step)
            cx = px + radius * math.cos(angle)
            cy = py + radius * math.sin(angle)
            if _sample(pixels, width, height, cx, cy) > 0.9:
                # exige margen: que sus vecinos también sean caminables
                if all(_sample(pixels, width, height, cx + dx, cy + dy) > 0.9
                       for dx, dy in ((-14, 0), (14, 0), (0, -14), (0, 14))):
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
    setup_render()
    render_to("overworld.png")
    mask_path = render_walkmask()
    verify_required_points(mask_path)
    print("[TraderPath] Diorama y máscara listos.")


main()

# ─── NOTA · CABLEADO EN PHASER (Fase 1, pendiente) ───────────────────────────
# La máscara se consume leyendo el píxel (x, y) en un canvas fuera de pantalla:
# blanco = pisable. Con eso, handlePointerDown deja de usar el clamp
# rectangular de walkArea y resuelve el destino contra la máscara, y el
# pathfinding puede bordear obstáculos muestreando la misma textura.
