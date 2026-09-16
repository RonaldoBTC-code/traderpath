# renders/ — arte fuente y renders de TraderPath

El arte tiene **dos orígenes y uno manda sobre el otro**:

1. **A mano** (`renders/assets/`) — lo que diseñas tú en Blender o en cualquier
   programa: `.blend`, `.png`, `.gltf`, `.fbx`… Se publica con `npm run art`.
2. **Por código** (`renders/blender/`) — scripts `bpy` headless que generan el
   resto de forma reproducible.

Si existe una pieza tuya con ese nombre, **el script no la regenera** y te lo
dice por consola. Así conviven las dos vías sin pisarse.

```
renders/
├── assets/           TU ARTE. Deja aquí tus archivos; la ruta espeja public/assets/
│   ├── missions/     → public/assets/missions/<nombre>.webp
│   ├── sprites/      → public/assets/sprites/<nombre>.webp
│   └── world/        → public/assets/world/<nombre>.webp
├── blender/          Scripts que generan lo que no has hecho a mano
│   ├── build_explorer.py        → public/assets/sprites/explorer*.webp
│   ├── build_overworld.py       → public/assets/world/overworld*.webp
│   ├── build_mission_art.py     → public/assets/missions/*.webp
│   ├── import_manual_assets.py  lo llama `npm run art`: convierte y renderiza lo tuyo
│   ├── load_mission_art.py      abre las 29 piezas en un Blender ya abierto
│   └── manual_overrides.py      la regla "lo manual manda", compartida por los build_*
└── legacy/           Arte retirado que ya no sirve el juego, guardado como referencia
    └── traderpath-world-hero.png   Postal generada por IA, sustituida por el diorama
```

```bash
npm run art          # publica tu arte de renders/assets → public/assets
npm run art:watch    # lo hace solo cada vez que guardas
npm run art:check    # dice qué haría y qué está mal, sin escribir
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
