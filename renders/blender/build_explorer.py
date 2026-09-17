# build_explorer.py — TraderPath · Fase 1 (prueba de concepto de la tubería 2.5D)
#
# Construye el "Explorador" como personaje cartoon 3D y lo renderiza a un WebP
# ortográfico con fondo transparente, listo para que Phaser lo cargue como sprite.
#
# CÓMO CORRERLO
#   Opción A (recomendada, sin abrir la UI):
#     blender --background --python renders/blender/build_explorer.py
#   Opción B (para iterar viendo el modelo):
#     Abre Blender → pestaña Scripting → abre este archivo → Run Script (Alt+P)
#
# Salida (public/assets/sprites/), por cada color (base + 5 del selector):
#   explorer_walk[_i].webp  hoja animada 3×9 (frente/perfil/espalda × quieto+8)
#   explorer[_i].webp       pose fija, respaldo si falta la hoja
#
#   -- --sheets-only   solo las hojas (~80 s por color)
#   -- --static-only   solo las poses fijas
#
# El juego precarga únicamente el color elegido, así que el peso de las seis
# hojas no se suma en la carga inicial.
#
# Probado con Blender 3.6 LTS, 4.x y 5.2 LTS. Usa Cycles (renderiza headless
# sin problemas).
# El look (paleta VDD v2.0, contorno navy tipo cartoon) se controla en CONFIG.

import bpy
import os
import sys
import math
import mathutils

# ─── CONFIG ──────────────────────────────────────────────────────────────────
BODY_HEX = "#E5960A"   # ámbar (tp-gold). Color por defecto → explorer.png
SKIN_HEX = "#FFD4AD"

# Fase 2 · variantes del selector de avatar. El orden IMPORTA: el índice de cada
# hex es el que termina en explorer_{i}.webp, así que debe coincidir 1:1 con
# AVATAR_COLORS en src/components/world/AcademyWorld.tsx (fuente de verdad).
# Si allá se reordenan o agregan colores, hay que reflejarlo acá y re-renderizar.
AVATAR_HEXES = ["#F0C040", "#38BDF8", "#22C55E", "#F97316", "#D946EF"]
INK_HEX = "#1E2A44"    # navy — contorno Freestyle + ojos + piernas
BLUSH_HEX = "#F5A97F"
WHITE_HEX = "#FFFFFF"
SKY_HEX = "#EAF4FE"    # luz de ambiente diurna (tp-base)


# renders/blender/ al sys.path: Blender ejecuta el script con --python y no
# añade su carpeta, así que sin esto no encontraría manual_overrides.
try:
    _HERE = os.path.dirname(os.path.abspath(__file__))
except NameError:  # pegado en la pestaña Scripting
    _HERE = bpy.path.abspath("//")
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)
from manual_overrides import skip_generated

# Con --force se regenera también lo que tengas hecho a mano en renders/assets/.
FORCE = "--force" in sys.argv

RESOLUTION = (512, 640)
SAMPLES = 96
# 92 es el punto donde el lossy deja de notarse en el sprite (error medio 0,006
# sobre los píxeles opacos) y el archivo baja de 255 KB a 21 KB.
SPRITE_QUALITY = 92
OUTLINE_THICKNESS = 4.5


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


def make_material(name, hex_color, roughness=0.55):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hexrgba(hex_color)
    bsdf.inputs["Roughness"].default_value = roughness
    # El nombre del socket de especular cambió entre Blender 3.x y 4.x.
    for socket in ("Specular IOR Level", "Specular"):
        if socket in bsdf.inputs:
            bsdf.inputs[socket].default_value = 0.15
            break
    return mat


# ─── PRIMITIVAS ──────────────────────────────────────────────────────────────
def add_sphere(name, location, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    return obj


def add_round_cube(name, location, scale, mat, bevel=0.14):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bev = obj.modifiers.new("bevel", "BEVEL")
    bev.width = bevel
    bev.segments = 4
    sub = obj.modifiers.new("subsurf", "SUBSURF")
    sub.levels = 1
    sub.render_levels = 2
    bpy.ops.object.shade_smooth()
    obj.data.materials.append(mat)
    return obj


# ─── PERSONAJE ───────────────────────────────────────────────────────────────
# El personaje mira hacia +Y (hacia la cámara). Z es arriba. Proporciones
# cartoon: cabeza grande, cuerpo rechoncho, extremidades cortas. Refleja el
# arte 2D de characterArt.ts (gorra + mochila + cara con rubor).
def build_explorer(body_hex=BODY_HEX):
    body_mat = make_material("body", body_hex)
    skin_mat = make_material("skin", SKIN_HEX)
    ink_mat = make_material("ink", INK_HEX, roughness=0.7)
    blush_mat = make_material("blush", BLUSH_HEX)
    white_mat = make_material("white", WHITE_HEX, roughness=0.4)

    parts = []
    # Piernas: bajan bastante por debajo del torso (que termina en z=0.12) para
    # que se lean como piernas y no como dos tacos de pie.
    parts.append(add_round_cube("leg_l", (-0.24, 0, 0.02), (0.15, 0.16, 0.36), ink_mat))
    parts.append(add_round_cube("leg_r", (0.24, 0, 0.02), (0.15, 0.16, 0.36), ink_mat))
    # Pies: asoman hacia +Y (adelante) y apoyan la silueta en el suelo.
    parts.append(add_round_cube("foot_l", (-0.24, 0.10, -0.30), (0.17, 0.24, 0.09), ink_mat, bevel=0.2))
    parts.append(add_round_cube("foot_r", (0.24, 0.10, -0.30), (0.17, 0.24, 0.09), ink_mat, bevel=0.2))
    # Torso: bevel alto = silueta redondeada, menos "caja".
    parts.append(add_round_cube("torso", (0, 0, 0.70), (0.6, 0.5, 0.58), body_mat, bevel=0.32))
    # Mochila (detrás, en -Y). Más ancha que el torso a propósito: así siluetea
    # por los costados y se lee aunque la cámara esté al frente.
    parts.append(add_round_cube("backpack", (0, -0.50, 0.82), (0.56, 0.26, 0.44), ink_mat, bevel=0.2))
    # Tirantes: llegan hasta el tope del torso (z=1.28) para que se lean pasando
    # por encima del hombro. Si terminan antes, parecen dos barras flotando.
    parts.append(add_round_cube("strap_l", (-0.30, 0.47, 0.92), (0.07, 0.05, 0.38), ink_mat, bevel=0.3))
    parts.append(add_round_cube("strap_r", (0.30, 0.47, 0.92), (0.07, 0.05, 0.38), ink_mat, bevel=0.3))
    # Brazos más cortos, rematados en una mano esférica. Retrasados en -Y para
    # que el brazo cercano a la cámara no se coma el frente del torso en 3/4.
    parts.append(add_round_cube("arm_l", (-0.66, -0.05, 0.82), (0.13, 0.14, 0.32), body_mat, bevel=0.3))
    parts.append(add_round_cube("arm_r", (0.66, -0.05, 0.82), (0.13, 0.14, 0.32), body_mat, bevel=0.3))
    parts.append(add_sphere("hand_l", (-0.70, -0.05, 0.44), (0.15, 0.15, 0.15), skin_mat))
    parts.append(add_sphere("hand_r", (0.70, -0.05, 0.44), (0.15, 0.15, 0.15), skin_mat))
    # Cuello: ahora que el mentón despeja el torso, evita que la cabeza flote.
    parts.append(add_round_cube("neck", (0, 0, 1.24), (0.2, 0.2, 0.12), skin_mat, bevel=0.3))
    # Cabeza: base en z=1.26, justo sobre el torso (tope 1.28) → mentón visible.
    parts.append(add_sphere("head", (0, 0, 1.88), (0.62, 0.6, 0.62), skin_mat))
    # Gorra: media esfera aplastada + visera (compacta, que no coma la cara)
    cap = add_sphere("cap", (0, 0, 2.24), (0.6, 0.58, 0.32), body_mat)
    parts.append(cap)
    parts.append(add_round_cube("brim", (0, 0.48, 2.16), (0.38, 0.26, 0.045), body_mat, bevel=0.04))
    # Ojos + brillos (en la cara, hacia +Y)
    parts.append(add_sphere("eye_l", (-0.22, 0.52, 1.88), (0.1, 0.08, 0.12), ink_mat))
    parts.append(add_sphere("eye_r", (0.22, 0.52, 1.88), (0.1, 0.08, 0.12), ink_mat))
    parts.append(add_sphere("glint_l", (-0.19, 0.6, 1.94), (0.035, 0.03, 0.035), white_mat))
    parts.append(add_sphere("glint_r", (0.25, 0.6, 1.94), (0.035, 0.03, 0.035), white_mat))
    # Rubor
    parts.append(add_sphere("blush_l", (-0.42, 0.47, 1.74), (0.11, 0.04, 0.08), blush_mat))
    parts.append(add_sphere("blush_r", (0.42, 0.47, 1.74), (0.11, 0.04, 0.08), blush_mat))
    # Sonrisa: arco de esferitas navy solapadas → trazo continuo
    xs = [i * 0.03 - 0.12 for i in range(9)]
    for i, x in enumerate(xs):
        z = 1.68 + 1.6 * x * x
        parts.append(add_sphere(f"smile_{i}", (x, 0.565, z), (0.034, 0.03, 0.034), ink_mat))
    return parts


# ─── CÁMARA / LUCES / MUNDO ──────────────────────────────────────────────────
def setup_camera():
    # La cara del personaje apunta a +Y. La cámara vive en +X/+Y: atan(2.7/2.9)
    # ≈ 43° de giro horizontal, que es un 3/4 real. Con menos giro (el 25° que
    # teníamos) la ortográfica se lee frontal y la mochila queda oculta.
    bpy.ops.object.camera_add(location=(2.7, 2.9, 2.1))
    cam = bpy.context.active_object
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 3.35
    look_at = mathutils.Vector((0.0, 0.0, 1.05))
    direction = look_at - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam


def setup_lights():
    # Key desde arriba-derecha del lado de la cámara (+Y).
    bpy.ops.object.light_add(type="SUN", location=(2.5, 3.0, 4.5))
    key = bpy.context.active_object
    key.data.energy = 3.2
    key.data.angle = math.radians(18)  # sombras suaves
    key.rotation_euler = (math.radians(-48), 0, math.radians(148))

    bpy.ops.object.light_add(type="SUN", location=(-3.0, 1.5, 2.0))
    fill = bpy.context.active_object
    fill.data.energy = 1.0
    fill.rotation_euler = (math.radians(-65), 0, math.radians(215))


def setup_world():
    world = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = hexrgba(SKY_HEX)
    bg.inputs["Strength"].default_value = 0.7  # ambiente diurno (sombras no negras)


# ─── RENDER ──────────────────────────────────────────────────────────────────
def setup_render():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.film_transparent = True
    scene.render.resolution_x, scene.render.resolution_y = RESOLUTION
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.quality = SPRITE_QUALITY
    # Colores planos y punchy (evita el lavado de Filmic/AgX).
    try:
        scene.view_settings.view_transform = "Standard"
    except TypeError:
        pass
    # Contorno cartoon navy tipo "border-2" del design system.
    scene.render.use_freestyle = True
    view_layer = scene.view_layers[0]
    view_layer.use_freestyle = True
    fs = view_layer.freestyle_settings
    lineset = fs.linesets[0] if len(fs.linesets) else fs.linesets.new("LineSet")
    if lineset.linestyle is None:
        lineset.linestyle = bpy.data.linestyles.new("LineStyle")
    # Sin declarar los edge types el contorno casi no se lee: falta sobre todo
    # material_boundary, que es donde vive el look "border-2" del design system
    # (los bordes piel/ámbar/navy entre partes).
    lineset.select_by_edge_types = True
    lineset.select_silhouette = True
    lineset.select_border = True
    lineset.select_crease = True
    lineset.select_material_boundary = True
    fs.crease_angle = math.radians(120)
    lineset.linestyle.color = hexrgba(INK_HEX)[:3]
    lineset.linestyle.thickness = OUTLINE_THICKNESS


def output_path(filename):
    # Relativo a este script → repo/public/assets/sprites/. Fallback para cuando
    # se pega en la pestaña Scripting (sin __file__).
    try:
        base = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        base = bpy.path.abspath("//")
    out_dir = os.path.normpath(os.path.join(base, "..", "..", "public", "assets", "sprites"))
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, filename)


def render_variant(body_hex, filename):
    # Reconstruye la escena entera por variante. Es más lento que sólo cambiar
    # el Base Color, pero garantiza que cámara, luces y Freestyle sean idénticos
    # entre assets — que es justamente la convención del pipeline.
    reset_scene()
    build_explorer(body_hex)
    setup_camera()
    setup_lights()
    setup_world()
    setup_render()
    path = output_path(filename)
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[TraderPath] {filename} ({body_hex}) → {path}")
    return path


# ─── HOJA DE CAMINAR (Fase 3 · sprites animados) ─────────────────────────────
# Una hoja por color con 3 filas × 9 columnas de cuadros de 192×240:
#
#   fila 0 · "down"  camina hacia la cámara (frente, girado 30° a la derecha)
#   fila 1 · "side"  perfil hacia la derecha de la pantalla
#   fila 2 · "up"    se aleja (espalda, girado 30° a la derecha)
#   columna 0 = quieto · columnas 1–8 = ciclo de caminar
#
# La izquierda NO se renderiza: Phaser voltea la fila correspondiente. Es exacto
# porque el modelo es simétrico y el volteo refleja respecto del plano vertical
# de la cámara. El mismo volteo en "down"/"up" da las diagonales hacia la
# izquierda, así que con 3 filas el personaje mira hacia 6 lados.
#
# ESTE LAYOUT ES UN CONTRATO con src/game/phaser/characterArt.ts
# (EXPLORER_SHEET). Si lo cambias aquí, cámbialo allá. Una hoja dibujada a mano
# con el mismo layout funciona igual (renders/assets/sprites/explorer_walk.png).
SHEET_FRAME = (192, 240)          # misma proporción 4:5 que el sprite fijo
SHEET_ROWS = ("down", "side", "up")
WALK_FRAMES = 8
SHEET_COLS = 1 + WALK_FRAMES
SHEET_SAMPLES = 24                # cuadros pequeños: el denoiser basta
SHEET_QUALITY = 82                # el cuadro se ve a ~55 % de su tamaño: el lossy no se nota
LEG_SWING = math.radians(32)
ARM_SWING = math.radians(26)
BOB = 0.05                        # rebote del cuerpo, en unidades de mundo
DIAGONAL_TURN = math.radians(30)  # conserva volumen en frente/espalda

# Pivotes, en las coordenadas de build_explorer(): cadera y hombro.
HIP_Z = 0.38
SHOULDER_Z = 1.12
LEG_PARTS = {"l": ("leg_l", "foot_l"), "r": ("leg_r", "foot_r")}
ARM_PARTS = {"l": ("arm_l", "hand_l"), "r": ("arm_r", "hand_r")}


def _add_empty(name, location, parent=None):
    empty = bpy.data.objects.new(name, None)
    empty.location = location
    bpy.context.scene.collection.objects.link(empty)
    if parent is not None:
        empty.parent = parent
    return empty


def _parent_keep(child, parent):
    """Emparenta sin mover: el hijo queda donde estaba en el mundo."""
    bpy.context.view_layer.update()
    child.parent = parent
    child.matrix_parent_inverse = parent.matrix_world.inverted()


def rig_explorer(parts):
    """Raíz (giro + rebote) → caderas y hombros (balanceo) → piezas.

    No es un esqueleto: el modelo son primitivas sueltas, así que basta con
    colgar cada extremidad de un empty en su articulación y girar el empty.
    """
    by_name = {obj.name: obj for obj in parts}
    root = _add_empty("rig_root", (0, 0, 0))
    joints = {}
    for side, x in (("l", -0.24), ("r", 0.24)):
        hip = _add_empty(f"hip_{side}", (x, 0, HIP_Z), root)
        joints[f"hip_{side}"] = hip
    for side, x in (("l", -0.66), ("r", 0.66)):
        shoulder = _add_empty(f"shoulder_{side}", (x, -0.05, SHOULDER_Z), root)
        joints[f"shoulder_{side}"] = shoulder

    limb_parts = set()
    for side, names in LEG_PARTS.items():
        for name in names:
            _parent_keep(by_name[name], joints[f"hip_{side}"])
            limb_parts.add(name)
    for side, names in ARM_PARTS.items():
        for name in names:
            _parent_keep(by_name[name], joints[f"shoulder_{side}"])
            limb_parts.add(name)
    for obj in parts:
        if obj.name not in limb_parts:
            _parent_keep(obj, root)
    return {"root": root, **joints}


def camera_axes():
    """Direcciones horizontales de la cámara: hacia ella y a su derecha."""
    cam = bpy.context.scene.camera
    forward = cam.matrix_world.to_quaternion() @ mathutils.Vector((0, 0, -1))
    forward.z = 0
    forward.normalize()
    right = mathutils.Vector((forward.y, -forward.x, 0))
    return -forward, forward, right


def facing_yaw(direction):
    """Giro en Z para que el personaje (que mira a +Y) mire hacia `direction`."""
    toward, away, right = camera_axes()
    turn = math.tan(DIAGONAL_TURN)
    target = {
        "down": toward + right * turn,
        "side": right,
        "up": away + right * turn,
    }[direction].normalized()
    return math.atan2(-target.x, target.y)


def pose_explorer(rig, yaw, frame):
    """frame None = quieto; 0..WALK_FRAMES-1 = fase del ciclo de caminar."""
    root = rig["root"]
    root.rotation_euler = (0, 0, yaw)
    if frame is None:
        swing = 0.0
        lift = 0.0
    else:
        phase = 2 * math.pi * frame / WALK_FRAMES
        swing = math.sin(phase)
        # El cuerpo sube cuando las piernas pasan por la vertical (swing≈0) y
        # baja en el apoyo, con las piernas abiertas.
        lift = BOB * (1 - abs(swing)) - BOB / 2
    root.location = (0, 0, lift)
    # Eje X local = lateral: el giro lleva la pierna hacia delante/atrás (±Y).
    rig["hip_l"].rotation_euler = (LEG_SWING * swing, 0, 0)
    rig["hip_r"].rotation_euler = (-LEG_SWING * swing, 0, 0)
    # Brazos en contrafase con la pierna del mismo lado, como al caminar.
    rig["shoulder_l"].rotation_euler = (-ARM_SWING * swing, 0, 0)
    rig["shoulder_r"].rotation_euler = (ARM_SWING * swing, 0, 0)
    bpy.context.view_layer.update()


def compose_sheet(frames, out_path):
    """Pega los cuadros en una hoja. Fila 0 arriba (pixels de Blender van de abajo arriba)."""
    import numpy as np

    fw, fh = SHEET_FRAME
    width, height = fw * SHEET_COLS, fh * len(SHEET_ROWS)
    sheet = np.zeros((height, width, 4), dtype=np.float32)
    for (row, col), path in frames.items():
        img = bpy.data.images.load(path, check_existing=False)
        px = np.empty(fw * fh * 4, dtype=np.float32)
        img.pixels.foreach_get(px)
        bpy.data.images.remove(img)
        y0 = height - (row + 1) * fh
        sheet[y0:y0 + fh, col * fw:(col + 1) * fw] = px.reshape(fh, fw, 4)

    out = bpy.data.images.new("explorer_sheet", width, height, alpha=True)
    out.pixels.foreach_set(sheet.ravel())
    settings = bpy.context.scene.render.image_settings
    settings.file_format = "WEBP"
    settings.color_mode = "RGBA"
    settings.quality = SHEET_QUALITY
    out.save_render(out_path, scene=bpy.context.scene)
    bpy.data.images.remove(out)

    # Verificación: tamaño de la hoja, alfa en la esquina y que cada cuadro
    # tenga personaje (un cuadro vacío es un fotograma que parpadea en el juego).
    check = bpy.data.images.load(out_path, check_existing=False)
    w, h = check.size
    px = np.empty(w * h * 4, dtype=np.float32)
    check.pixels.foreach_get(px)
    bpy.data.images.remove(check)
    px = px.reshape(h, w, 4)
    empty_cells = [
        (r, c)
        for r in range(len(SHEET_ROWS))
        for c in range(SHEET_COLS)
        if px[h - (r + 1) * fh:h - r * fh, c * fw:(c + 1) * fw, 3].max() < 0.5
    ]
    ok = (w, h) == (width, height) and px[0, 0, 3] == 0 and not empty_cells
    kb = os.path.getsize(out_path) / 1024
    print(f"[TraderPath] {os.path.basename(out_path)} {w}x{h} {kb:.0f}KB "
          f"cuadros_vacios={empty_cells or 0} {'OK' if ok else 'REVISAR'}")


def render_sheet(body_hex, filename):
    reset_scene()
    parts = build_explorer(body_hex)
    rig = rig_explorer(parts)
    setup_camera()
    setup_lights()
    setup_world()
    setup_render()
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = SHEET_FRAME
    scene.cycles.samples = SHEET_SAMPLES
    # El contorno se autoró para 512 px de alto: escalarlo mantiene el trazo.
    lineset = scene.view_layers[0].freestyle_settings.linesets[0]
    lineset.linestyle.thickness = OUTLINE_THICKNESS * SHEET_FRAME[1] / RESOLUTION[1]
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    tmp_dir = os.path.join(bpy.app.tempdir, "explorer_sheet")
    os.makedirs(tmp_dir, exist_ok=True)
    frames = {}
    for row, direction in enumerate(SHEET_ROWS):
        yaw = facing_yaw(direction)
        for col in range(SHEET_COLS):
            pose_explorer(rig, yaw, None if col == 0 else col - 1)
            path = os.path.join(tmp_dir, f"{row}_{col}.png")
            scene.render.filepath = path
            bpy.ops.render.render(write_still=True)
            frames[(row, col)] = path
    compose_sheet(frames, output_path(filename))


def _skip_sheet(suffix):
    # Un explorador fijo dibujado a mano también manda sobre la hoja generada:
    # si no, el juego mostraría la animación por código en vez de su dibujo.
    return skip_generated("sprites", f"explorer_walk{suffix}", FORCE) or \
        skip_generated("sprites", f"explorer{suffix}", FORCE)


def main():
    sheets_only = "--sheets-only" in sys.argv
    static_only = "--static-only" in sys.argv

    if not sheets_only:
        # Sprite por defecto (tp-gold), el que consume EXPLORER_SPRITE_PATH hoy.
        if not skip_generated("sprites", "explorer", FORCE):
            render_variant(BODY_HEX, "explorer.webp")
        # Fase 2: una variante por color del selector de avatar.
        for i, body_hex in enumerate(AVATAR_HEXES):
            if skip_generated("sprites", f"explorer_{i}", FORCE):
                continue
            render_variant(body_hex, f"explorer_{i}.webp")
        print(f"[TraderPath] Listo: 1 sprite base + {len(AVATAR_HEXES)} variantes.")

    if not static_only:
        # Fase 3: hojas de caminar. El sprite fijo sigue existiendo como
        # respaldo si falta la hoja.
        if not _skip_sheet(""):
            render_sheet(BODY_HEX, "explorer_walk.webp")
        for i, body_hex in enumerate(AVATAR_HEXES):
            if not _skip_sheet(f"_{i}"):
                render_sheet(body_hex, f"explorer_walk_{i}.webp")
        print(f"[TraderPath] Listo: {1 + len(AVATAR_HEXES)} hojas de caminar.")


main()

# ─── NOTA · CABLEADO EN PHASER (pendiente) ───────────────────────────────────
# Los PNG ya existen, pero characterArt.ts todavía apunta a un único
# EXPLORER_SPRITE_PATH = "/assets/sprites/explorer.png". Para que el selector de
# avatar use las variantes hay que cargar las 5 texturas en preload() y elegir
# por índice de color. Es un cambio en TS, no en este script.
