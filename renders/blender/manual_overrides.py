# manual_overrides.py — el arte hecho a mano manda sobre el generado por código.
#
# Los scripts build_*.py generan arte de forma determinista: si los vuelves a
# correr, reescriben su salida. Eso es justo lo que NO queremos cuando una pieza
# ya la has hecho tú a mano en Blender o en tu programa de diseño.
#
# Regla: si existe `renders/assets/<categoria>/<nombre>.<algo>`, esa pieza es
# tuya y el script la salta (a menos que se pase --force). El aviso sale por
# consola para que no haya sorpresas silenciosas.
#
# Lo usan build_mission_art.py, build_explorer.py y build_overworld.py.

import os

# Mismas extensiones que acepta scripts/build-art.mjs.
SOURCE_EXTS = (
    ".blend",
    ".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp", ".tga",
    ".gltf", ".glb", ".fbx", ".obj", ".dae", ".stl", ".ply",
)


def assets_root():
    """renders/assets/, resuelto desde este archivo."""
    base = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(base, "..", "assets"))


def manual_source(category, name):
    """Devuelve la ruta del archivo hecho a mano para esa pieza, o None.

    `category` es la carpeta de destino ("missions", "sprites", "world") y
    `name` el nombre del asset sin extensión ("m1_1-apple", "explorer").
    """
    folder = os.path.join(assets_root(), category)
    if not os.path.isdir(folder):
        return None
    for ext in SOURCE_EXTS:
        candidate = os.path.join(folder, name + ext)
        if os.path.exists(candidate):
            return candidate
    return None


def skip_generated(category, name, force=False):
    """True si hay que saltarse esta pieza porque existe una versión manual."""
    source = manual_source(category, name)
    if source is None:
        return False
    if force:
        print(f"[TraderPath] ⚠ {name}: --force ignora tu versión manual ({os.path.basename(source)})")
        return False
    print(
        f"[TraderPath] ⏭ {name}: hay arte manual en renders/assets/{category}/"
        f"{os.path.basename(source)} — no se regenera. Publícalo con `npm run art`."
    )
    return True
