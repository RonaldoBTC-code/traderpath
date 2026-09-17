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

## Producción del arte

Cada pieza puede venir de dos sitios, y **lo hecho a mano manda**:

- **Tuya:** deja el archivo en `renders/assets/missions/<nombre>.<lo-que-sea>`
  (`.blend`, `.png`, `.gltf`…) y publícalo con `npm run art`. El nombre de este
  contrato es lo único que tiene que coincidir. Ver `renders/assets/README.md`.
- **Generada:** scripts `bpy` reproducibles (ver `renders/blender/README.md`).
  Si existe la versión manual, el script salta esa pieza y lo avisa.

Piezas que hoy entrega el script, con el nombre exacto del contrato:

| Script | Piezas entregadas |
|---|---|
| `renders/blender/build_mission_art.py` | ✅ **Nivel 1 completo**: `m1_1-stall`, `m1_1-client`, `m1_1-apple`, `m1_1-sign`, `m1_2-workshop`, `m1_3-observatory`, `m1_4-vault`, `m1_4-coin` |
| `renders/blender/build_mission_art.py` | ✅ **Nivel 2 completo**: `m2_1-plaza`, `m2_2-observatory`, `m2_3-patterns` |
| `renders/blender/build_mission_art.py` | ✅ **N3 Crypto completo**: `m3c_1-plaza-bloque`, `m3c_1-coin`, `m3c_2-nexus`, `m3c_3-ciclo`, `m3c_4-bloques` |

| `renders/blender/build_mission_art.py` | ✅ **N3 Forex completo**: `m3f_1-sesiones`, `m3f_2-lotes`, `m3f_2-coin`, `m3f_3-correlacion`, `m3f_4-calendario` |

| `renders/blender/build_mission_art.py` | ✅ **N3 Stocks completo**: `m3s_1-capitalizacion`, `m3s_2-resultados`, `m3s_3-corporativo`, `m3s_4-beta` |
| `renders/blender/build_mission_art.py` | ✅ **N3 Commodities completo**: `m3o_1-oferta`, `m3o_2-refugio`, `m3o_3-dolar`, `m3o_4-estacional` |

Todo el contrato actual está entregado. Indices, futures y ETFs aún no tienen misiones.

Nota `m3f_3`: con `centered: true` la nota del medidor ("centro = sin relación")
es más ancha: en móvil ocupa x≈54–94 %, así que el detalle abajo a la izquierda
debe quedar en x≤52 %.

Nota `m3c_3-ciclo`: el contrato pedía "Ciudad Bitcoin de noche"; se hizo **atardecer
cálido** para que el panel blanco y los textos del lab sigan legibles.

Reglas de composición medidas en los componentes (valen también si dibujas a mano):

- **Fondos de GaugeLab/LevelLab/CandleLab/StructureLab:** la tarjeta es ancha y
  baja y usa `cover`, así que sólo se ve una **franja central horizontal**, y
  **el recorte cambia con el ancho de la pantalla** (en escritorio es más fina
  que en móvil). Medidores y texto van encima, así que cada lab reserva zonas
  distintas:
  - **CandleLab** (vela al centro) y **StructureLab** (gráfico a todo lo ancho,
    etiquetas arriba a izquierda y derecha): detalle en los laterales, centro
    tranquilo y claro.
  - **GaugeLab** es la excepción: sus textos ocupan los bordes y, en móvil, casi
    la mitad izquierda (etiquetas "Tu posición" / "Capital en riesgo" y monedas a
    la izquierda; % de riesgo y la nota "línea = 2%…" a la derecha). La única zona
    sin textos en **todos** los anchos (medida en móvil, panel y escritorio ancho)
    es **x≈50–72 %, y≈22–52 % de la imagen**: ahí va el motivo principal. El resto,
    liso y claro. Las monedas pueden pasar por encima del arte sin problema.
- **LevelLab en modo medidor (`region: "meter"`, casi todo N3):** la tarjeta mide
  ~110 px de alto. En escritorio sólo se ve **y≈35–65 %** de la imagen, y ahí
  están los textos y la barra. Textos arriba a todo lo ancho (y≈24–47 %), barra
  opaca (y≈47–67 %), nota "línea = umbral" abajo a la derecha (x≈68–97 %,
  y≈56–77 %). Libre para detalle: **abajo a la izquierda (y≈67–82 %, x≤64 %)** y
  una tira superior (y≈18–23 %) que sólo asoma en móvil. El arte es sobre todo
  ambientación de color; la identidad de la ciudad va abajo a la izquierda.
- **m1_1 (SupplyDemandLab, 4:3):** el cartel va arriba al centro, las manzanas se
  apoyan en una línea de mostrador a **y≈52 %** y los clientes se paran de
  **y≈60 %** hacia abajo.
- **Figuras repetidas** (cliente 24×40 px, manzana y moneda 20×20 px en pantalla):
  siluetas simples; el detalle fino no se ve a ese tamaño.

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

### Nivel 2 — misiones en la isla de Academia Ágora (mismo cielo diurno)

Cada misión de N2 se ambienta en el distrito de la isla cuyo concepto profundiza:

| Misión | Lugar | Acento | Landmark a evocar |
|---|---|---|---|
| m2_1 (zonas O/D) | **Mercado Plaza** | `#33b77a` verde | Plaza de intercambio, zonas del mercado |
| m2_2 (soporte/resistencia) | **Observatorio** | `#8b72ff` violeta | Torre-observatorio, niveles del precio |
| m2_3 (patrones de vela) | **Taller de Velas** | `#e8743b` naranja | Taller de velas japonesas |

(m2_4 y m2_5 no se convierten: m2_4 ya es simulador y m2_5 es la elección de mercado.)

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

### m1_2 — Taller de Velas · CandleLab

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (taller) | `m1_2-workshop.webp` | ~4:3 | 1024×768 | Cubre la escena; taller de velas japonesas, acento naranja. Puede ser opaco |

(La vela —cuerpo, mechas, color— la dibuja el componente en vivo según los cuatro precios.)

### m1_3 — Observatorio · StructureLab

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (observatorio) | `m1_3-observatory.webp` | ~5:3 | 1024×614 | Cubre la escena; observatorio/torre de tendencias, acento violeta. Puede ser opaco |

(El gráfico de estructura y la etiqueta de tendencia los dibuja el componente en vivo.)

### m2_1 — Mercado Plaza · LevelLab (zonas)

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (plaza) | `m2_1-plaza.webp` | ~5:3 | 1024×614 | Cubre la escena; plaza del mercado, acento verde. Puede ser opaco |

### m2_2 — Observatorio · LevelLab (soporte/resistencia)

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (observatorio) | `m2_2-observatory.webp` | ~5:3 | 1024×614 | Cubre la escena; observatorio de niveles, acento violeta. Puede ser opaco |

### m2_3 — Taller de Velas · CandleLab (patrones)

| Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|
| Fondo (taller) | `m2_3-patterns.webp` | ~4:3 | 1024×768 | Cubre la escena; taller de patrones de vela, acento naranja. Puede ser opaco |

(En m2_1/m2_2 el componente dibuja la banda/nivel y su fuerza; en m2_3, la vela y el nombre del patrón.)

### Nivel 3 Crypto — Ciudad Bitcoin (Conchagua · El Salvador) · acento `#F7931A`

Fondo diurno/volcánico de Ciudad Bitcoin: Plaza del Bloque, volcán al fondo, puerto Lightning. Todos los fondos pueden ser opacos. Los medidores, barras y velas los dibuja el componente.

| Misión | Lab | Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|---|---|
| m3c_1 (riesgo 24/7) | GaugeLab | Fondo (plaza del bloque) | `m3c_1-plaza-bloque.webp` | ~3:2 | 1024×683 | Cubre la escena; Plaza del Bloque con el volcán. Ambienta Ciudad Bitcoin |
| m3c_1 | GaugeLab | Moneda (posición) | `m3c_1-coin.webp` | 1:1 | 96×96 | Se repite como "tu posición"; una por unidad. Moneda ₿ dorada |
| m3c_2 (dominancia) | LevelLab · meter | Fondo (Nexus) | `m3c_2-nexus.webp` | ~5:3 | 1024×614 | Cubre la escena; pantallas de mercado de Ciudad Nexus |
| m3c_3 (sentimiento) | LevelLab · meter | Fondo (ciclo) | `m3c_3-ciclo.webp` | ~5:3 | 1024×614 | Cubre la escena; Ciudad Bitcoin de noche, ánimo del mercado |
| m3c_4 (ATR vs stop) | LevelLab · meter | Fondo (bloques) | `m3c_4-bloques.webp` | ~5:3 | 1024×614 | Cubre la escena; sala de gráficos/velas de BTC |

(m3c_0 exploración y m3c_5 boss no se convierten.)

### Nivel 3 Forex — Distrito FX (Nueva York · Wall Street) · acento `#38BDF8`

Distrito financiero diurno: Torre de Liquidez, relojes de las cuatro sesiones, torres de Londres y Nueva York. Fondos opacos permitidos. Medidores y barras los dibuja el componente.

| Misión | Lab | Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|---|---|
| m3f_1 (sesiones) | LevelLab · meter | Fondo (sesiones) | `m3f_1-sesiones.webp` | ~5:3 | 1024×614 | Cubre la escena; torres de Londres y NY con relojes de sesión |
| m3f_2 (pips/lotes) | GaugeLab | Fondo (Torre de Liquidez) | `m3f_2-lotes.webp` | ~3:2 | 1024×683 | Cubre la escena; Torre de Liquidez, tablero de lotes |
| m3f_2 | GaugeLab | Ficha (posición) | `m3f_2-coin.webp` | 1:1 | 96×96 | Se repite como "tu posición"; una por mini-lote |
| m3f_3 (correlación) | LevelLab · meter centrado | Fondo (correlación) | `m3f_3-correlacion.webp` | ~5:3 | 1024×614 | Cubre la escena; tablero de correlaciones entre divisas |
| m3f_4 (noticias) | LevelLab · meter | Fondo (calendario) | `m3f_4-calendario.webp` | ~5:3 | 1024×614 | Cubre la escena; calendario económico y relojes |

(m3f_5 boss no se convierte.)

### Nivel 3 Stocks — Capital Corporativa (Nueva York · Exchange District) · acento `#22C55E`

Distrito de rascacielos corporativos: Bolsa de Empresas, torres con tickers, pantallas de resultados. Fondos opacos permitidos. Medidores y barras los dibuja el componente.

| Misión | Lab | Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|---|---|
| m3s_1 (capitalización) | LevelLab · meter | Fondo (rascacielos) | `m3s_1-capitalizacion.webp` | ~5:3 | 1024×614 | Cubre la escena; distrito de rascacielos corporativos |
| m3s_2 (resultados) | LevelLab · meter centrado | Fondo (sala de earnings) | `m3s_2-resultados.webp` | ~5:3 | 1024×614 | Cubre la escena; sala de resultados con pantallas de EPS |
| m3s_3 (dividendos/splits) | LevelLab · meter centrado | Fondo (eventos corp.) | `m3s_3-corporativo.webp` | ~5:3 | 1024×614 | Cubre la escena; tablero de eventos corporativos |
| m3s_4 (beta/rotación) | LevelLab · meter | Fondo (rotación) | `m3s_4-beta.webp` | ~5:3 | 1024×614 | Cubre la escena; panel de rotación sectorial |

(m3s_5 boss no se convierte.)

### Nivel 3 Commodities — Puerto de Materias (Chicago · Golfo industrial) · acento `#EAB308`

Puerto industrial: muelles, grúas, barcos de carga, tanques de crudo, terminal de gas, lingotes de oro y bobinas de cobre. Fondos opacos permitidos. Medidores y barras los dibuja el componente.

| Misión | Lab | Pieza | Archivo | Relación | Tamaño rec. | Anclaje |
|---|---|---|---|---|---|---|
| m3o_1 (oferta/demanda) | LevelLab · meter centrado | Fondo (muelles) | `m3o_1-oferta.webp` | ~5:3 | 1024×614 | Cubre la escena; muelles, barcos y tanques de crudo |
| m3o_2 (refugio/cíclico) | LevelLab · meter centrado | Fondo (oro vs cobre) | `m3o_2-refugio.webp` | ~5:3 | 1024×614 | Cubre la escena; lingotes de oro frente a bobinas de cobre |
| m3o_3 (dólar) | LevelLab · meter centrado | Fondo (dólar/crudo) | `m3o_3-dolar.webp` | ~5:3 | 1024×614 | Cubre la escena; tablero del dólar frente a tanques de crudo |
| m3o_4 (estacionalidad) | LevelLab · meter | Fondo (terminal de gas) | `m3o_4-estacional.webp` | ~5:3 | 1024×614 | Cubre la escena; terminal de gas natural con nieve/invierno |

(m3o_0 no existe; m3o_5 boss no se convierte. Commodities queda cableado al registry, motor y MarketPreview, alcanzable como 4ª ruta.)

## Cómo se conecta

Cada misión declara sus piezas en `config.scene` (en `src/lib/content/levelX.ts`).
Ronaldo solo deja los `.webp` con esos nombres exactos en esta carpeta y aparecen
—sin tocar código—, ya ambientados a su ciudad/lugar.
