# renders/assets/ — tu arte hecho a mano

Deja aquí tus diseños. Esta carpeta es tuya: los scripts de Blender **no la
tocan nunca** y lo que pongas aquí manda sobre el arte generado por código.

## La única regla: el nombre y la carpeta

La ruta dentro de `renders/assets/` es la ruta dentro de `public/assets/`, con
la extensión que quieras:

```
renders/assets/missions/m1_1-apple.png     →  public/assets/missions/m1_1-apple.webp
renders/assets/missions/m1_4-vault.blend   →  public/assets/missions/m1_4-vault.webp
renders/assets/sprites/explorer.blend      →  public/assets/sprites/explorer.webp
renders/assets/world/overworld.glb         →  public/assets/world/overworld.webp
```

El juego pide `/assets/missions/m1_1-apple.webp` y punto: no sabe si esa imagen
la hizo un script o la dibujaste tú. Por eso **el nombre es lo único que tiene
que coincidir** — los nombres exactos están en `public/assets/missions/README.md`.

## Publicar

```bash
npm run art          # convierte y publica lo que haya cambiado
npm run art:watch    # se queda mirando: guardas en tu programa y se publica solo
npm run art:check    # no escribe nada, solo dice qué haría y qué falla
```

Después, recarga la pestaña del juego (en `npm run dev` basta F5: el servidor
manda `max-age=0` y el navegador revalida).

## Qué formatos acepta

| Tipo | Extensiones | Qué hace |
|---|---|---|
| Imagen | `.png` `.jpg` `.webp` `.tif` `.bmp` `.tga` | La convierte a WebP conservando el alfa |
| Blender | `.blend` | Lo **abre y renderiza con tu cámara y tu escena**. Tu archivo nunca se guarda ni se modifica |
| Modelo 3D | `.gltf` `.glb` `.fbx` `.obj` `.dae` `.stl` `.ply` | Lo importa a la cámara ortográfica y la luz cartoon del proyecto y lo renderiza |

El juego es 2D (Phaser): el navegador no carga `.blend` ni `.fbx`, así que
siempre hay un paso de render. Lo hace `npm run art` por ti; tu fuente 3D se
queda aquí, versionada, y es la que editas.

## Ajustes por archivo (opcional)

Un JSON con el mismo nombre al lado del archivo:

```jsonc
// renders/assets/missions/m1_4-vault.json
{
  "size": [1024, 683],   // resolución de salida (por defecto: la del arte que sustituye)
  "transparent": true,   // fondo con alfa
  "quality": 92,         // 1–100 (100 = WebP sin pérdida)
  "lossless": false
}
```

Sin JSON, `npm run art` deduce todo del arte que estás sustituyendo: mismo
tamaño y misma transparencia. Es lo normal.

## Avisos que verás (y que conviene leer)

- **«el código no pide /assets/…»** — el nombre no coincide con ninguno que el
  juego cargue. Casi siempre es una errata; si no, es arte que aún no está
  cableado en el contenido.
- **«proporción distinta a la del arte que sustituye»** — la imagen se dibuja
  con `cover`, así que una proporción distinta recorta por los lados. El texto
  del mini-juego tiene zonas libres medidas en
  `public/assets/missions/README.md`: si cambias la proporción, revísalas.
- **«el arte anterior tenía transparencia y este no»** — te saldrá un rectángulo
  opaco encima de la escena. Exporta con alfa.

## El explorador (personaje del jugador)

Cada color del selector usa dos archivos:

| Archivo | Qué es |
|---|---|
| `sprites/explorer_walk.<ext>` · `explorer_walk_0` … `_4` | **Hoja animada** (lo que se ve al caminar) |
| `sprites/explorer.<ext>` · `explorer_0` … `_4` | Pose fija de respaldo |

El número es el color del selector, en orden: `0` amarillo, `1` celeste,
`2` verde, `3` naranja, `4` magenta. Sin número = color base (ámbar), que solo
se usa si falta el del color elegido.

### Formato de la hoja animada

```
          col 0     col 1 … col 8
         (quieto)  (ciclo de caminar, 8 cuadros)
fila 0   frente →  camina hacia la cámara
fila 1   perfil →  camina hacia la DERECHA de la pantalla
fila 2   espalda → se aleja
```

- Cada cuadro mide **192 × 240 px** → la hoja completa mide **1728 × 720 px**.
- Fondo transparente. Los pies, a la misma altura en todos los cuadros.
- **No dibujes la izquierda:** el juego voltea la fila 1 (y también las filas
  0 y 2 cuando camina en diagonal hacia la izquierda). Por eso frente y espalda
  van ligeramente girados hacia la derecha.
- Para empezar, abre la hoja actual como plantilla:
  `public/assets/sprites/explorer_walk.webp`.

Si solo entregas la **pose fija** (`explorer.png`), el juego la muestra sin
animación: `npm run art` retira la hoja generada de ese color para que se vea tu
dibujo, y te lo avisa. Si la quieres animada, entrega también `explorer_walk`.

## ¿Y los scripts de Blender?

Siguen ahí (`renders/blender/`) y generan todo lo que no hayas hecho a mano. En
cuanto existe un archivo tuyo con ese nombre, el script lo salta y lo dice:

```
[TraderPath] ⏭ m1_1-apple: hay arte manual en renders/assets/missions/m1_1-apple.png
             — no se regenera. Publícalo con `npm run art`.
```

Para forzar la regeneración (y perder lo manual) hay que pedirlo a propósito con
`-- --force`.

**Caso especial — el mapa del mundo.** `overworld.webp` y
`overworld_walkmask.webp` son el mismo render visto de dos maneras: el mapa que
se ve y los píxeles blancos por donde se puede caminar. Si haces el mapa a mano,
entrega también su máscara; si no, el jugador caminará sobre tus edificios.
`build_overworld.py` te lo avisa cuando detecta solo una de las dos.
