# Arte de escena de las misiones

Aquí van los dibujos de escena de cada misión (los hace Ronaldo en Blender y los
exporta a esta carpeta). El arte es **decorativo**: la mecánica interactiva del
laboratorio (precio, deslizadores, puntos) vive en el componente y funciona con o
sin imagen. Si el archivo no existe, el laboratorio cae con gracia a su versión
abstracta y la misión sigue jugable — un asset faltante nunca rompe nada.

## Convención

- **Nombre:** `<missionId>-<slug>.webp` — p. ej. `m1_1-apple-stall.webp`.
- **Ruta en disco:** `public/assets/missions/<archivo>.webp`
- **URL servida:** `/assets/missions/<archivo>.webp` (así se referencia en el
  `config.scene.image` de la misión, dentro de `src/lib/content/levelX.ts`).
- **Formato:** WebP con canal alfa (fondo transparente), para que se apoye sobre
  la superficie clara del juego sin un rectángulo duro.
- **Dimensiones:** relación 16:9. Recomendado 1024×576 (o 2× para retina, 2048×1152).
  Se muestra con `background-size: contain`, así que nunca se recorta.
- **Peso:** por debajo de ~150 KB (calidad WebP ~85–90).
- **Contenido:** SOLO la escena. Nada de texto de UI, precios ni deslizadores —
  esos los pinta el componente encima. Paleta VDD v2.0 (cartoon claro).
- **Zona que ocupa:** un banner decorativo en la parte superior de la tarjeta del
  laboratorio, encima del precio.

## Assets esperados

| Misión | Archivo | Escena |
|---|---|---|
| m1_1 | `m1_1-apple-stall.webp` | Puesto de manzanas en la plaza del mercado |

(Se irá ampliando conforme se conviertan las demás misiones a laboratorios.)
