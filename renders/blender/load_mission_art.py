# load_mission_art.py — abre TODAS las piezas de misión en el Blender que ya
# tienes en marcha, una escena por pieza, sin renderizar y sin borrar nada.
#
# CÓMO CORRERLO
#   Blender → pestaña Scripting → Open → este archivo → Run Script (Alt+P).
#   Después: selector de escena (cabecera, arriba) para saltar entre piezas.
#   La vista queda en cámara + material preview, que es lo que verá el juego.
#
# Para qué: iterar el look de una pieza mirándola, en vez de renderizar a ciegas.
# Cuando te guste, renderiza solo esa desde la terminal:
#   blender -b --python renders/blender/build_mission_art.py -- --only m1_1-apple
#
# Reejecutarlo reemplaza las escenas que ya existían con ese nombre, así que
# puedes editar build_mission_art.py y volver a lanzarlo sin reiniciar Blender.

import json
import os

import bpy


def script_dir():
    try:
        return os.path.dirname(os.path.abspath(__file__))
    except NameError:  # pegado en la pestaña Scripting
        return bpy.path.abspath("//")


PATH = os.path.join(script_dir(), "build_mission_art.py")
src = open(PATH, encoding="utf-8").read()

# Cortamos la llamada final a main(): queremos los constructores, no el render.
marker = "\nmain()\n"
idx = src.rfind(marker)
if idx == -1:
    raise RuntimeError("no encontré la llamada final a main() en build_mission_art.py")
src = src[:idx] + "\n"

ns = {"__name__": "traderpath_mission_art", "__file__": PATH}
exec(compile(src, PATH, "exec"), ns)

win = bpy.context.window_manager.windows[0]


def fresh_scene(name):
    """Escena nueva por pieza. Si ya existía (reejecución), se reemplaza solo esa."""
    old = bpy.data.scenes.get(name)
    if old is not None:
        for ob in list(old.objects):
            if len(ob.users_scene) <= 1:
                bpy.data.objects.remove(ob, do_unlink=True)
        bpy.data.scenes.remove(old)
    return bpy.data.scenes.new(name)


# En el espacio de trabajo: ni borrar datos globales ni renderizar. reset_scene
# del script borraría los datablocks de TU sesión abierta.
ns["reset_scene"] = lambda: None


def _ready_without_render(name, size, transparent, outline_px, supersample=1, wash=0.0):
    ns["render_settings"](size, transparent, outline_px)
    ns["flush_anchors"]()


ns["render_piece"] = _ready_without_render

created = []
for name, builder in ns["PIECES"].items():
    scn = fresh_scene(name)
    win.scene = scn
    with bpy.context.temp_override(window=win, scene=scn, view_layer=scn.view_layers[0]):
        builder()
    created.append([name, len(scn.objects)])

first = bpy.data.scenes[created[0][0]]
win.scene = first
for area in win.screen.areas:
    if area.type == "VIEW_3D":
        space = area.spaces.active
        space.region_3d.view_perspective = "CAMERA"
        space.shading.type = "MATERIAL"

print(json.dumps({"piezas": len(created), "activa": win.scene.name}))
print("[TraderPath] " + ", ".join(n for n, _ in created))
