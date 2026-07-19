# build_explorer.py — TraderPath · Fase 1 (prueba de concepto de la tubería 2.5D)
#
# Construye el "Explorador" como personaje cartoon 3D y lo renderiza a un PNG
# ortográfico con fondo transparente, listo para que Phaser lo cargue como sprite.
#
# CÓMO CORRERLO
#   Opción A (recomendada, sin abrir la UI):
#     blender --background --python blender/build_explorer.py
#   Opción B (para iterar viendo el modelo):
#     Abre Blender → pestaña Scripting → abre este archivo → Run Script (Alt+P)
#
# Salida: public/assets/sprites/explorer.png
#
# Probado con Blender 3.6 LTS y 4.x. Usa Cycles (renderiza headless sin problemas).
# El look (paleta VDD v2.0, contorno navy tipo cartoon) se controla en CONFIG.

import bpy
import os
import math
import mathutils

# ─── CONFIG ──────────────────────────────────────────────────────────────────
BODY_HEX = "#E5960A"   # ámbar (tp-gold). Para variantes de color, ver nota al final.
SKIN_HEX = "#FFD4AD"
INK_HEX = "#1E2A44"    # navy — contorno Freestyle + ojos + piernas
BLUSH_HEX = "#F5A97F"
WHITE_HEX = "#FFFFFF"
SKY_HEX = "#EAF4FE"    # luz de ambiente diurna (tp-base)

RESOLUTION = (512, 640)
SAMPLES = 96
OUTLINE_THICKNESS = 3.0


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
def build_explorer():
    body_mat = make_material("body", BODY_HEX)
    skin_mat = make_material("skin", SKIN_HEX)
    ink_mat = make_material("ink", INK_HEX, roughness=0.7)
    blush_mat = make_material("blush", BLUSH_HEX)
    white_mat = make_material("white", WHITE_HEX, roughness=0.4)

    parts = []
    # Piernas
    parts.append(add_round_cube("leg_l", (-0.24, 0, 0.16), (0.15, 0.16, 0.22), ink_mat))
    parts.append(add_round_cube("leg_r", (0.24, 0, 0.16), (0.15, 0.16, 0.22), ink_mat))
    # Torso
    parts.append(add_round_cube("torso", (0, 0, 0.74), (0.6, 0.5, 0.62), body_mat))
    # Mochila (detrás, en -Y)
    parts.append(add_round_cube("backpack", (0, -0.5, 0.78), (0.42, 0.22, 0.5), ink_mat))
    # Brazos
    parts.append(add_round_cube("arm_l", (-0.66, 0, 0.78), (0.14, 0.16, 0.4), body_mat))
    parts.append(add_round_cube("arm_r", (0.66, 0, 0.78), (0.14, 0.16, 0.4), body_mat))
    # Cabeza
    parts.append(add_sphere("head", (0, 0, 1.62), (0.62, 0.6, 0.62), skin_mat))
    # Gorra: media esfera aplastada + visera
    cap = add_sphere("cap", (0, 0, 1.9), (0.66, 0.64, 0.42), body_mat)
    parts.append(cap)
    parts.append(add_round_cube("brim", (0, 0.5, 1.78), (0.4, 0.28, 0.05), body_mat, bevel=0.04))
    # Ojos + brillos (en la cara, hacia +Y)
    parts.append(add_sphere("eye_l", (-0.22, 0.52, 1.6), (0.1, 0.08, 0.12), ink_mat))
    parts.append(add_sphere("eye_r", (0.22, 0.52, 1.6), (0.1, 0.08, 0.12), ink_mat))
    parts.append(add_sphere("glint_l", (-0.19, 0.6, 1.66), (0.035, 0.03, 0.035), white_mat))
    parts.append(add_sphere("glint_r", (0.25, 0.6, 1.66), (0.035, 0.03, 0.035), white_mat))
    # Rubor
    parts.append(add_sphere("blush_l", (-0.42, 0.46, 1.46), (0.11, 0.04, 0.08), blush_mat))
    parts.append(add_sphere("blush_r", (0.42, 0.46, 1.46), (0.11, 0.04, 0.08), blush_mat))
    return parts


# ─── CÁMARA / LUCES / MUNDO ──────────────────────────────────────────────────
def setup_camera():
    bpy.ops.object.camera_add(location=(1.6, -3.2, 2.0))
    cam = bpy.context.active_object
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 2.85
    look_at = mathutils.Vector((0.0, 0.0, 0.95))
    direction = look_at - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam


def setup_lights():
    bpy.ops.object.light_add(type="SUN", location=(2.5, -3.0, 4.5))
    key = bpy.context.active_object
    key.data.energy = 3.2
    key.data.angle = math.radians(18)  # sombras suaves
    key.rotation_euler = (math.radians(52), 0, math.radians(35))

    bpy.ops.object.light_add(type="SUN", location=(-3.0, -1.5, 2.0))
    fill = bpy.context.active_object
    fill.data.energy = 1.0
    fill.rotation_euler = (math.radians(70), 0, math.radians(-40))


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
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
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
    lineset.linestyle.color = hexrgba(INK_HEX)[:3]
    lineset.linestyle.thickness = OUTLINE_THICKNESS


def output_path():
    # Relativo a este script → repo/public/assets/sprites/. Fallback para cuando
    # se pega en la pestaña Scripting (sin __file__).
    try:
        base = os.path.dirname(os.path.abspath(__file__))
    except NameError:
        base = bpy.path.abspath("//")
    out_dir = os.path.normpath(os.path.join(base, "..", "public", "assets", "sprites"))
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, "explorer.png")


def main():
    reset_scene()
    build_explorer()
    setup_camera()
    setup_lights()
    setup_world()
    setup_render()
    path = output_path()
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[TraderPath] Sprite renderizado en: {path}")


main()

# ─── NOTA · VARIANTES DE COLOR (Fase 2) ──────────────────────────────────────
# El selector de avatar del juego ofrece 5 colores. Para renderizarlos, envolvé
# la asignación de material del cuerpo/gorra/brazos en un bucle sobre los hex y
# renderizá a explorer_0.png … explorer_4.png cambiando body_mat.Base Color.
# Lo dejamos para cuando valides el look del Explorador por defecto.
