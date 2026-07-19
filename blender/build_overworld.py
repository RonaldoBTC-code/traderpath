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

SEA_HEX = "#5FB4D8"        # mar abierto
SHALLOW_HEX = "#8ECDEA"    # bajío (es el backgroundColor actual de la escena)
GRASS_HEX = "#6FC28B"      # pasto
GRASS_DARK_HEX = "#4E9E6E" # falda de isla
SAND_HEX = "#F0DCA8"       # playa
ROCK_HEX = "#8FA3B8"       # roca
BRIDGE_HEX = "#C9A06A"     # madera de puente
TRUNK_HEX = "#7A5A3A"
LEAF_HEX = "#3E8C63"
ROOF_HEX = "#F7EDCF"

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
    "approach:bitcoin-portal": (770, 310),
    "approach:aria": (730, 500),
}

# `approach` heredados del hero pintado que, con terreno real, caen en agua.
# No abortan el render: son una decisión de diseño pendiente (mover el punto en
# AcademyAgoraScene.createHotspots), no un fallo del diorama. Vaciar esta lista
# cuando Phaser se actualice.
PENDING_APPROACH_MOVES = {"approach:bitcoin-portal"}

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
    (735, 352, 782, 240, 110),  # central → Ciudad Bitcoin
]

# Embarcaderos: plataformas caminables sobre el agua. El del canal norte no es
# decorativo — el `approach` de bitcoin-portal cae en (770,310), en pleno canal,
# y el ancho proyectado del puente no llegaba a cubrirlo. Un rellano a media
# travesía lo resuelve y de paso le da sentido al puente largo.
DOCKS = [
    (770, 312, 58),
]

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


def add_sea(cam, mat_sea, mat_shallow):
    """Plano de mar único, más grande que el cuadro por todos lados.

    Un solo plano: la versión anterior añadía una lámina de bajío más pequeña
    y su borde recto se veía como un rectángulo dibujado sobre el mar.
    El bajío ahora es un disco por lóbulo, en add_shore().
    """
    corners = [px_to_world(cam, x, y) for x, y in
               ((0, 0), (RESOLUTION[0], 0), (0, RESOLUTION[1]), RESOLUTION)]
    span = max(max(abs(c.x) for c in corners), max(abs(c.y) for c in corners)) * 2.6
    bpy.ops.mesh.primitive_plane_add(size=span, location=(0, 0, -0.08))
    sea = bpy.context.active_object
    sea.name = "sea"
    sea.data.materials.append(mat_sea)
    BLOCKING.append(sea)
    return sea


def add_shore(cam, name, px, py, radius_px, mat):
    """Disco de bajío bajo un lóbulo, un poco más ancho: define la costa."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=1.0, depth=0.06,
                                        location=(center.x, center.y, -0.02))
    shore = bpy.context.active_object
    shore.name = name
    shore.scale = (radius_px * step_x * 1.13, radius_px * step_y * 1.13, 1.0)
    shore.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    shore.visible_shadow = False
    BLOCKING.append(shore)
    return shore


def add_land_lobe(cam, name, px, py, radius_px, mat_top, mat_side, height=LAND_HEIGHT):
    """Meseta cilíndrica que se ve como un círculo de radio_px EN PANTALLA."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1.0, depth=height,
                                        location=(center.x, center.y, height / 2.0))
    lobe = bpy.context.active_object
    lobe.name = name
    lobe.scale = (radius_px * step_x, radius_px * step_y, 1.0)
    bev = lobe.modifiers.new("bevel", "BEVEL")
    bev.width = 0.08
    bev.segments = 3
    lobe.data.materials.append(mat_top)
    lobe.data.materials.append(mat_side)
    bpy.ops.object.shade_smooth()
    # El suelo no proyecta sombra. Los lóbulos se solapan y tienen la tapa a la
    # misma altura, así que al sombrearse entre sí manchaban el mapa con
    # regiones negras enormes que tapaban el terreno.
    lobe.visible_shadow = False
    WALKABLE.append(lobe)
    return lobe


def add_dock(cam, name, px, py, radius_px, mat):
    """Rellano de madera sobre el agua, caminable, a la altura del puente."""
    step_x, step_y = pixel_scale(cam)
    center = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=1.0, depth=LAND_HEIGHT * 0.5,
                                        location=(center.x, center.y, LAND_HEIGHT * 0.62))
    dock = bpy.context.active_object
    dock.name = name
    dock.scale = (radius_px * step_x, radius_px * step_y, 1.0)
    dock.data.materials.append(mat)
    dock.visible_shadow = False
    WALKABLE.append(dock)
    return dock


def add_bridge(cam, name, px1, py1, px2, py2, width_px, mat):
    step_x, _ = pixel_scale(cam)
    a = px_to_world(cam, px1, py1)
    b = px_to_world(cam, px2, py2)
    mid = (a + b) / 2.0
    delta = b - a
    length = delta.length
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(mid.x, mid.y, LAND_HEIGHT * 0.62))
    bridge = bpy.context.active_object
    bridge.name = name
    bridge.scale = (length, width_px * step_x, LAND_HEIGHT * 0.5)
    bridge.rotation_euler = (0.0, 0.0, math.atan2(delta.y, delta.x))
    bridge.data.materials.append(mat)
    WALKABLE.append(bridge)
    return bridge


def add_building(cam, name, px, py, width_px, depth_px, height, mat_body, mat_roof):
    """Edificio de distrito. NO caminable: el jugador lo rodea.

    width_px va con step_x y depth_px con step_y, para que la planta se lea
    con esas medidas EN PANTALLA pese a la inclinación de la cámara.
    """
    step_x, step_y = pixel_scale(cam)
    world_w = width_px * step_x
    world_d = depth_px * step_y
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cube_add(size=1.0,
                                    location=(base.x, base.y, LAND_HEIGHT + height / 2.0))
    body = bpy.context.active_object
    body.name = name
    body.scale = (world_w, world_d, height)
    bev = body.modifiers.new("bevel", "BEVEL")
    bev.width = 0.06
    bev.segments = 2
    body.data.materials.append(mat_body)
    BLOCKING.append(body)

    # Pirámide de base exactamente igual a la planta: un cono de 4 lados con
    # radio √2/2 girado 45° inscribe un cuadrado de lado 1, que al escalar por
    # (world_w, world_d) calza con el cuerpo. La versión anterior escalaba el
    # radio por 1.5 y el techo salía al doble del edificio.
    roof_height = 0.62
    bpy.ops.mesh.primitive_cone_add(
        vertices=4, radius1=math.sqrt(2) / 2, radius2=0.0, depth=1.0,
        location=(base.x, base.y, LAND_HEIGHT + height + roof_height / 2.0))
    roof = bpy.context.active_object
    roof.name = f"{name}_roof"
    roof.scale = (world_w * 1.12, world_d * 1.12, roof_height)
    roof.rotation_euler = (0.0, 0.0, math.radians(45))
    roof.data.materials.append(mat_roof)
    BLOCKING.append(roof)
    return body


def add_volcano(cam, name, px, py, radius_px, height, mat_rock, mat_glow):
    step_x, step_y = pixel_scale(cam)
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=1.0, radius2=0.34, depth=height,
                                    location=(base.x, base.y, LAND_HEIGHT + height / 2.0))
    cone = bpy.context.active_object
    cone.name = name
    cone.scale = (radius_px * step_x, radius_px * step_y, 1.0)
    cone.data.materials.append(mat_rock)
    bpy.ops.object.shade_smooth()
    BLOCKING.append(cone)

    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=1.0, depth=0.12,
                                        location=(base.x, base.y, LAND_HEIGHT + height - 0.02))
    crater = bpy.context.active_object
    crater.name = f"{name}_crater"
    crater.scale = (radius_px * step_x * 0.3, radius_px * step_y * 0.3, 1.0)
    crater.data.materials.append(mat_glow)
    BLOCKING.append(crater)
    return cone


def add_tree(cam, px, py, mat_trunk, mat_leaf, scale=1.0):
    step_x, step_y = pixel_scale(cam)
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.13 * scale, depth=0.72 * scale,
                                        location=(base.x, base.y, LAND_HEIGHT + 0.36 * scale))
    trunk = bpy.context.active_object
    trunk.name = f"tree_trunk_{px}_{py}"
    trunk.data.materials.append(mat_trunk)
    BLOCKING.append(trunk)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=0.46 * scale,
                                         location=(base.x, base.y, LAND_HEIGHT + 0.95 * scale))
    leaves = bpy.context.active_object
    leaves.name = f"tree_leaves_{px}_{py}"
    leaves.scale = (1.0, 1.0 * (step_y / step_x) * 0.55 + 0.45, 0.9)
    leaves.data.materials.append(mat_leaf)
    bpy.ops.object.shade_smooth()
    BLOCKING.append(leaves)


def add_rock(cam, px, py, size, mat):
    base = px_to_world(cam, px, py)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=size,
                                          location=(base.x, base.y, LAND_HEIGHT * 0.4))
    rock = bpy.context.active_object
    rock.name = f"rock_{px}_{py}"
    rock.scale = (1.0, 0.8, 0.62)
    rock.data.materials.append(mat)
    BLOCKING.append(rock)


def build_overworld(cam):
    mat_sea = make_material("sea", SEA_HEX, roughness=0.25)
    mat_shallow = make_material("shallow", SHALLOW_HEX, roughness=0.3)
    mat_grass = make_material("grass", GRASS_HEX)
    mat_grass_dark = make_material("grass_side", GRASS_DARK_HEX)
    mat_sand = make_material("sand", SAND_HEX)
    mat_rock = make_material("rock", ROCK_HEX)
    mat_bridge = make_material("bridge", BRIDGE_HEX)
    mat_trunk = make_material("trunk", TRUNK_HEX)
    mat_leaf = make_material("leaf", LEAF_HEX)
    mat_roof = make_material("roof", ROOF_HEX)
    mat_glow = make_material("crater", BITCOIN_HEX, roughness=0.4)

    add_sea(cam, mat_sea, mat_shallow)

    all_lobes = (
        [(f"main_{i}", px, py, r, mat_grass, mat_grass_dark)
         for i, (px, py, r) in enumerate(MAIN_LOBES)]
        + [(f"mercado_{i}", px, py, r, mat_grass, mat_grass_dark)
           for i, (px, py, r) in enumerate(MERCADO_LOBES)]
        + [(f"bitcoin_{i}", px, py, r, mat_rock, mat_rock)
           for i, (px, py, r) in enumerate(BITCOIN_LOBES)]
    )
    # El bajío va primero para que quede debajo de la tierra.
    for name, px, py, radius, _top, _side in all_lobes:
        add_shore(cam, f"shore_{name}", px, py, radius, mat_shallow)
    for name, px, py, radius, mat_top, mat_side in all_lobes:
        add_land_lobe(cam, f"land_{name}", px, py, radius, mat_top, mat_side)

    for index, (x1, y1, x2, y2, width) in enumerate(BRIDGES):
        add_bridge(cam, f"bridge_{index}", x1, y1, x2, y2, width, mat_bridge)
    for index, (px, py, radius) in enumerate(DOCKS):
        add_dock(cam, f"dock_{index}", px, py, radius, mat_bridge)

    # Edificios de distrito, desplazados hacia arriba respecto del pin para que
    # el punto de aproximación quede libre delante de la puerta.
    add_building(cam, "academia", ACADEMIA_PX[0], ACADEMIA_PX[1] - 18, 74, 58, 2.2,
                 make_material("academia", ACADEMIA_HEX), mat_roof)
    add_building(cam, "mercado", MERCADO_PX[0] + 20, MERCADO_PX[1] - 14, 62, 50, 1.8,
                 make_material("mercado", MERCADO_HEX), mat_roof)
    # Desplazado a la izquierda del pin a propósito: un edificio se proyecta
    # ~23 px hacia arriba en pantalla por cada unidad de altura, así que puesto
    # bajo el pin tapaba el `approach` del Observatorio en (510,440).
    add_building(cam, "taller", TALLER_PX[0] - 46, TALLER_PX[1] + 2, 62, 50, 1.8,
                 make_material("taller", TALLER_HEX), mat_roof)
    add_building(cam, "observatorio", OBSERVATORIO_PX[0], OBSERVATORIO_PX[1] - 12, 58, 48, 2.0,
                 make_material("observatorio", OBSERVATORIO_HEX), mat_roof)

    # Ciudad Bitcoin: volcán, coherente con la referencia de Conchagua que
    # marketCities.ts fija para la ciudad cripto.
    add_volcano(cam, "volcan_bitcoin", BITCOIN_PX[0], BITCOIN_PX[1] - 8, 62, 3.0,
                mat_rock, mat_glow)

    for px, py, scale in [
        (640, 560, 1.0), (560, 555, 0.85), (790, 520, 0.95), (760, 545, 0.8),
        (335, 420, 0.9), (330, 355, 0.8), (445, 355, 0.85), (470, 560, 0.9),
        (1035, 240, 0.85), (1060, 355, 0.8), (930, 300, 0.7),
    ]:
        add_tree(cam, px, py, mat_trunk, mat_leaf, scale)

    for px, py, size in [
        (630, 430, 0.28), (620, 560, 0.24), (395, 465, 0.26), (1070, 290, 0.24),
        (745, 205, 0.22),
    ]:
        add_rock(cam, px, py, size, mat_rock)


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
