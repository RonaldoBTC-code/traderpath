# Blender — tubería de assets 2.5D de TraderPath

Modelamos personajes y ciudades en Blender, los **renderizamos a PNG** desde una
cámara ortográfica con iluminación cartoon, y Phaser los carga como sprites. Así
ganamos volumen e iluminación 3D **sin reescribir** el mundo Phaser (2D).

## Requisitos

- [Blender](https://www.blender.org/download/) 3.6 LTS o 4.x.
- No hace falta GPU: los scripts usan Cycles y renderizan headless en CPU.

## Fase 1 — El Explorador (prueba de concepto)

Renderiza el personaje del jugador a `public/assets/sprites/explorer.png`.

```bash
# Desde la raíz del repo. Ajusta la ruta a tu ejecutable de Blender.
blender --background --python blender/build_explorer.py

# Windows (ejemplo típico):
# & "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe" --background --python blender/build_explorer.py
```

O bien: abre Blender → pestaña **Scripting** → abre `build_explorer.py` → **Run Script**
(útil para ver el modelo en el viewport mientras iteramos el look).

Al terminar, recarga `/world` en el juego: si el PNG existe, el Explorador aparece
como sprite; si no, se dibujan las formas actuales (fallback, nada se rompe).

## El bucle de iteración

No puedo ver los renders desde aquí, así que trabajamos así:

1. Corres el script → se genera `explorer.png`.
2. Me pasas una captura (o lo ves en `/world`).
3. Ajusto `build_explorer.py` (proporciones, paleta, cámara, luces) y repetimos.

Todo el look se controla en el bloque `CONFIG` y en `build_explorer()`:
paleta VDD v2.0, contorno navy (Freestyle), ángulo 3/4, luz diurna.

## Próximas fases

- **Fase 2** — resto de personajes (ARIA, Elena, Leo) + variantes de color del
  avatar (bucle sobre los 5 hex; ver nota al pie del script).
- **Fase 3** — dioramas de ciudad (Ciudad Bitcoin, Distrito FX, …) como fondos
  que reemplazan el hero AI y las postales SVG de `MarketCityAtlas`.

## Convenciones

- Salida siempre a `public/assets/sprites/` (personajes) o `public/assets/cities/`
  (dioramas), en PNG RGBA con fondo transparente.
- Cámara **ortográfica** y misma iluminación entre assets, para que todo se vea
  como un mismo mundo.
- Un script `bpy` por familia de asset, autocontenido y reproducible (nada de
  `.blend` binarios como única fuente de verdad).
