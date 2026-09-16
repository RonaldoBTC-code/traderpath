# Blender — tubería de assets 2.5D de TraderPath

Modelamos personajes y ciudades en Blender, los **renderizamos a WebP** desde una
cámara ortográfica con iluminación cartoon, y Phaser los carga como sprites. Así
ganamos volumen e iluminación 3D **sin reescribir** el mundo Phaser (2D).

## Requisitos

- [Blender](https://www.blender.org/download/) 3.6 LTS o 4.x.
- No hace falta GPU: los scripts usan Cycles y renderizan headless en CPU.

## Fase 1 — El Explorador (prueba de concepto)

Renderiza el personaje del jugador a `public/assets/sprites/explorer.webp`.

```bash
# Desde la raíz del repo. Ajusta la ruta a tu ejecutable de Blender.
blender --background --python renders/blender/build_explorer.py

# Windows (ejemplo típico):
# & "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" --background --python renders/blender/build_explorer.py
```

O bien: abre Blender → pestaña **Scripting** → abre `build_explorer.py` → **Run Script**
(útil para ver el modelo en el viewport mientras iteramos el look).

Al terminar, recarga `/world` en el juego: si el WebP existe, el Explorador aparece
como sprite; si no, se dibujan las formas actuales (fallback, nada se rompe).

## El bucle de iteración

Renderiza en modo rápido, abre la imagen de salida (PNG o WebP), ajusta el script
y repite. En el juego basta recargar la misión o `/world`: los assets se precargan
y, si falta alguno, se dibuja la forma provisional.

Todo el look se controla en el bloque `CONFIG` y en `build_explorer()`:
paleta VDD v2.0, contorno navy (Freestyle), ángulo 3/4, luz diurna.

## Scripts

| Script | Salida | Estado |
|---|---|---|
| `build_explorer.py` | `public/assets/sprites/explorer*.webp` | ✅ Explorador + 5 variantes de color |
| `build_overworld.py` | `public/assets/world/overworld*` | ✅ Diorama del overworld + máscara de caminabilidad |
| `build_mission_art.py` | `public/assets/missions/*.webp` | ✅ Contrato completo: Niveles 1, 2 y 3 (Crypto, Forex, Stocks, Commodities) · 29 piezas |

### Arte de misiones (`build_mission_art.py`)

Genera las piezas del contrato `public/assets/missions/README.md` con su nombre
exacto: el lab las carga solo, sin tocar código.

```bash
blender -b --python renders/blender/build_mission_art.py                          # todas
blender -b --python renders/blender/build_mission_art.py -- --only m1_1-apple     # una o varias (coma)
blender -b --python renders/blender/build_mission_art.py -- --preview             # pocas muestras
```

Cada pieza se verifica al guardarse (tamaño del contrato y alfa en sprites) y el
puesto de m1_1 imprime dónde caen sus anclas respecto a las líneas del lab. Los
objetos en la colección `NoInk` (brillos, juntas, adoquines) no llevan contorno
Freestyle: con tinta, un brillo se lee como agujero.

Pendiente: Fase 2 de personajes (ARIA, Elena, Leo como sprites renderizados).

## Convenciones

- Salida siempre a `public/assets/sprites/` (personajes) o `public/assets/world/`
  (dioramas), en WebP RGBA con fondo transparente. Nunca fuera de `public/`: es
  lo único que Next.js sirve, y el código referencia rutas absolutas `/assets/…`.
- Máscaras y cualquier imagen que el código **lea como dato** (caminabilidad)
  van en WebP con `quality=100`, que en Blender activa el codificador lossless.
- Cámara **ortográfica** y misma iluminación entre assets, para que todo se vea
  como un mismo mundo.
- Un script `bpy` por familia de asset, autocontenido y reproducible. Los
  `.blend` hechos a mano **sí** son fuente válida: viven en `renders/assets/` y
  `npm run art` los renderiza sin modificarlos. Lo que no vale es un `.blend`
  suelto fuera de esa carpeta, que nadie sabría de dónde salió.
- Si una pieza tiene versión manual en `renders/assets/`, estos scripts **la
  saltan** (`manual_overrides.skip_generated`). Con `-- --force` se regenera y se
  pierde lo hecho a mano: hay que pedirlo a propósito.
