# Arte de escena de las misiones

Las piezas de arte de cada misión (las hace Ronaldo en Blender, incluidas las
ciudades). En los laboratorios **la escena es la visualización**: figuras y
medidores reaccionan en vivo a los controles, y el fondo lleva la **identidad de
la ciudad/lugar** donde ocurre la misión. El arte es **por piezas**: la mecánica
funciona con o sin él. Si una pieza falta, el componente dibuja una **forma
provisional**; un asset faltante nunca rompe nada (cada pieza se precarga antes
de mostrarse).

## Convención general

- **Ruta:** `public/assets/missions/<archivo>.webp` → URL `/assets/missions/<archivo>.webp`
- **Nombre:** `<missionId>-<pieza>.webp` (p. ej. `m1_4-vault.webp`, `m1_1-client.webp`).
- **Formato:** WebP con **alfa** (salvo el fondo, que puede ser opaco). Calidad ~85–90.
- **Contenido:** solo el dibujo de esa pieza; nada de texto de UI ni cifras (las
  pone el componente). Paleta VDD v2.0.
- **Fondo temático:** el fondo de cada misión NO es genérico. Debe llevar la
  ambientación de su lugar (abajo). Cada misión apunta su propio `scene.backdrop`,
  así que puede haber uno distinto por misión/ciudad.

## Ambientación por misión (qué ciudad/lugar dibujar)

Fuente: distritos del overworld (`AcademyAgoraScene`) para N1 y `src/lib/game/marketCities.ts` para N3.

### Nivel 1 — Isla de Academia Ágora (cielo celeste claro, cartoon diurno)

| Misión | Lugar | Acento | Landmark a evocar |
|---|---|---|---|
| m1_1 | **Mercado Plaza** | `#33b77a` verde | Puestos del mercado, plaza de intercambio |
| m1_2 | **Taller de Velas** | `#e8743b` naranja | Taller/herrería de velas japonesas |
| m1_3 | **Observatorio** | `#8b72ff` violeta | Torre-observatorio de tendencias |
| m1_4 | **La Bóveda** | `#2563eb` azul | Cámara acorazada, capital protegido |
| m1_5 | **Arena del Desafío** | `#a855f7` púrpura | Arena/coliseo de la prueba final |

### Nivel 3 — una ciudad por mercado

| Ruta | Ciudad | Referencia | Acento | Cielo | Landmark |
|---|---|---|---|---|---|
| crypto (m3c) | **Ciudad Bitcoin** | Conchagua · El Salvador | `#F7931A` | `#FFE3B3`→`#F9A94D` | Plaza del Bloque, volcán, puerto Lightning |
| forex (m3f) | **Distrito FX** | Nueva York · Wall Street | `#38BDF8` | `#BEE7FB`→`#7CC8F2` | Torre de Liquidez, relojes de sesión |
| stocks (m3s) | **Capital Corporativa** | Nueva York · Exchange | `#22C55E` | `#C9F3D8`→`#7EDCA2` | Bolsa de Empresas |
| commodities (m3o) | **Puerto de Materias** | Chicago · Golfo industrial | `#EAB308` | `#FDEBB0`→`#F3C64F` | Terminal del Mundo Real |
| indices | Observatorio Global | Frankfurt · macro | `#818CF8` | `#DCDCFD`→`#A8AEF5` | Cúpula de Economías |
| futures | Ciudad de Contratos | Chicago · Futures Loop | `#F97316` | `#FFD9BC`→`#F8A468` | Reloj de Vencimientos |
| etfs | Archipiélago Portafolio | Singapur · Investment Bay | `#D946EF` | `#F5D6FB`→`#D89BEE` | Puente de Diversificación |

(N2 comparte la isla de Academia Ágora; su ambientación se asigna al convertir el lote de N2.)

## Piezas por misión (según se van convirtiendo)

### m1_1 — Mercado Plaza · SupplyDemandLab

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Puesto (fondo) | `m1_1-stall.webp` | 4:3 | 1024×768 | Cubre la escena; mostrador + suelo. Ambienta Mercado Plaza |
| Cliente | `m1_1-client.webp` | 3:5 | 120×200 | Cuerpo entero; se repite al frente, apoyado por los pies |
| Manzana | `m1_1-apple.webp` | 1:1 | 96×96 | Se repite en el mostrador |
| Cartel | `m1_1-sign.webp` | 5:2 | 400×160 | Arriba-centro; deja el ~60% central despejado para el precio |

### m1_4 — La Bóveda · GaugeLab

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (bóveda) | `m1_4-vault.webp` | ~3:2 | 1024×683 | Cubre la escena; cámara acorazada, tono azul de La Bóveda. Puede ser opaco |
| Moneda | `m1_4-coin.webp` | 1:1 | 96×96 | Se repite como "tu posición"; una por unidad |

(El medidor de riesgo y el número los dibuja el componente.)

## Cómo se conecta

Cada misión declara sus piezas en `config.scene` (en `src/lib/content/levelX.ts`).
Ronaldo solo deja los `.webp` con esos nombres exactos en esta carpeta y aparecen
—sin tocar código—, ya ambientados a su ciudad/lugar.
