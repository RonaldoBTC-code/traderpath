# renders/ — arte fuente y renders de TraderPath

Todo el arte del juego se **genera con código**: scripts `bpy` de Blender que se
corren headless y escriben la imagen final. No hay `.blend` binarios como fuente
de verdad ni capas de Photoshop que alguien tenga en su máquina. Para cambiar un
asset se edita su script y se vuelve a renderizar.

```
renders/
├── blender/          FUENTE. Un script por familia de asset (ver blender/README.md)
│   ├── build_explorer.py      → public/assets/sprites/explorer*.webp
│   ├── build_overworld.py     → public/assets/world/overworld*.webp
│   └── build_mission_art.py   → public/assets/missions/*.webp
└── legacy/           Arte retirado que ya no sirve el juego, guardado como referencia
    └── traderpath-world-hero.png   Postal generada por IA, sustituida por el diorama
```

## Por qué los renders viven en `public/assets/`, no aquí

Next.js sirve archivos estáticos **solo** desde `public/`, y todas las
referencias del código son URLs absolutas (`/assets/missions/m1_1-apple.webp`,
`/assets/sprites/explorer.webp`). Mover los renders a `renders/` los dejaría
fuera del servidor: el arte desaparecería del juego y los labs caerían a sus
formas provisionales. Por eso esta carpeta guarda **la fuente** (los scripts) y
**lo retirado** (`legacy/`), mientras la imagen servida se queda donde el juego
la lee. No hay copias duplicadas a propósito: dos copias de un render se
desincronizan en cuanto alguien vuelve a renderizar.

## Inventario de renders (salida de estos scripts)

| Destino servido | Piezas | Peso | Script |
|---|---|---|---|
| `public/assets/sprites/explorer*.webp` | 6 (base + 5 colores de avatar) | ~125 KB | `build_explorer.py` |
| `public/assets/world/overworld.webp` | diorama del overworld 2560×1440 | 452 KB | `build_overworld.py` |
| `public/assets/world/overworld_minimap.webp` | minimapa | 46 KB | `build_overworld.py` |
| `public/assets/world/overworld_walkmask.webp` | máscara de caminabilidad 1280×720, lossless | 162 KB | `build_overworld.py` |
| `public/assets/missions/*.webp` | 29 piezas del contrato de misiones | 448 KB | `build_mission_art.py` |

El contrato de nombres, tamaños y anclas de las piezas de misión está en
`public/assets/missions/README.md`; el lab carga por nombre exacto, sin tocar
código.

## Reglas de formato

- **WebP siempre.** El mismo sprite del explorador pesaba 255 KB en PNG y pesa
  21 KB en WebP calidad 92, sin diferencia visible (error medio 0,006 sobre los
  píxeles opacos).
- **Lossless para lo que el código lee como dato.** `overworld_walkmask.webp` se
  renderiza con `quality=100`, que en Blender cambia al codificador sin pérdida:
  un artefacto de compresión ahí no se ve fea, cambia qué píxeles son pisables.
  Verificado píxel a píxel contra el PNG anterior: 0 diferencias, 532 KB → 162 KB.
- **Alfa real en los sprites**, fondo transparente. Cada pieza se verifica al
  guardarse (tamaño del contrato y alfa en las esquinas).

Guía paso a paso para editar y ver los cambios en el juego:
`Instrucciones_Edicion_Renders.md` (Escritorio) o la versión corta en
`renders/blender/README.md`.
