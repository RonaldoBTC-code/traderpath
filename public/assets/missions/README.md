# Arte de escena de las misiones

Aquí van las piezas de arte de cada misión (las hace Ronaldo en Blender y las
exporta a esta carpeta). En los laboratorios, **la escena es la visualización**:
los clientes y las manzanas se dibujan uno a uno según los deslizadores, y el
precio se escribe sobre un cartel dentro de la escena. El arte es **decorativo y
por piezas**: la mecánica funciona con o sin él. Si una pieza falta, el
componente dibuja una **forma provisional** en su lugar — un asset faltante nunca
rompe nada ni deja un icono roto (cada pieza se precarga antes de mostrarse).

## Convención general

- **Ruta en disco:** `public/assets/missions/<archivo>.webp`
- **URL servida:** `/assets/missions/<archivo>.webp` (se referencia en
  `config.scene` de la misión, en `src/lib/content/levelX.ts`).
- **Formato:** WebP con canal **alfa** (fondo transparente), salvo el fondo de
  escena que puede ser opaco. Calidad ~85–90.
- **Nombre:** `<missionId>-<pieza>.webp` (p. ej. `m1_1-client.webp`).
- **Contenido:** solo el dibujo de esa pieza. Nada de texto de UI ni el número
  del precio — ese lo escribe el componente sobre el cartel. Paleta VDD v2.0.

## Piezas del laboratorio de oferta y demanda (m1_1)

| Pieza | Archivo | Relación | Tamaño recomendado | Peso | Anclaje / dónde la coloca el componente |
|---|---|---|---|---|---|
| **Puesto (fondo)** | `m1_1-stall.webp` | 4:3 | 1024×768 (2× ok) | < 200 KB | Cubre toda la escena (`cover`). Debe incluir el mostrador y el suelo; los clientes se paran sobre el suelo y las manzanas sobre el mostrador. Puede ser opaco. |
| **Cliente** | `m1_1-client.webp` | 3:5 (vertical) | 120×200 | < 40 KB | UNA figura de cliente de cuerpo entero, mirando al puesto. Se repite en la banda frontal (60–97% de la altura), apoyada por los **pies (abajo-centro)**. Se muestra a ~24×40 px, `contain`. |
| **Manzana** | `m1_1-apple.webp` | 1:1 | 96×96 | < 20 KB | UNA manzana. Se repite en la banda del mostrador (26–52% de la altura), centrada. Se muestra a ~20×20 px, `contain`. |
| **Cartel** | `m1_1-sign.webp` | 5:2 (horizontal) | 400×160 | < 40 KB | El letrero de la tienda. Va arriba-centro (~5% desde arriba, 46% de ancho). **El precio se escribe centrado encima**, así que deja el ~60% central despejado (sin dibujo) para que el número se lea. |

Si una pieza falta, el componente usa: silueta azul para el cliente, círculo
dorado con hoja para la manzana, un rectángulo con borde para el cartel, y un
degradado celeste con una línea de mostrador para el fondo.

## Cómo se conecta

Cada misión convertida declara sus piezas en `config.scene`:

```ts
scene: {
  alt: "Puesto de manzanas en la plaza del mercado",
  stall:  { image: "/assets/missions/m1_1-stall.webp" },
  client: { image: "/assets/missions/m1_1-client.webp" },
  apple:  { image: "/assets/missions/m1_1-apple.webp" },
  sign:   { image: "/assets/missions/m1_1-sign.webp" },
}
```

Ronaldo solo deja los `.webp` en esta carpeta con esos nombres exactos y
aparecen solos — sin tocar código.
