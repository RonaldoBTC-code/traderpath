# Referencias visuales y técnicas

Fecha de revisión: 27 de junio de 2026.

## Producto y dirección artística

- [Alba: A Wildlife Adventure](https://www.albawildlife.com/): exploración relajada, mundo estilizado construido a mano, objetivos simples y acciones contextualizadas en lugares reconocibles.
- [Codédex](https://www.codedex.io/about): aprendizaje dividido en regiones, XP, desbloqueos y progreso visible sin perder el tono de aventura.
- [Bitcoin City — Presidencia de El Salvador](https://www.presidencia.gob.sv/presidente-nayib-bukele-presenta-avances-de-bitcoin-city-el-futuro-de-el-salvador/): ciudad circular, símbolo central, relación con Conchagua y energía geotérmica.

Decisión para TraderPath: tomar la estructura —explorar, encontrar un hito, aprender, practicar y desbloquear— sin copiar personajes, textos, logos ni activos visuales.

## Gráficos

- [Lightweight Charts: Time Scale API](https://tradingview.github.io/lightweight-charts/docs/4.1/api/interfaces/ITimeScaleApi)
- [Lightweight Charts: Series API](https://tradingview.github.io/lightweight-charts/docs/4.0/api/interfaces/ISeriesApi)

Decisión: guardar dibujos en coordenadas de mercado (`logical`, `price`) y convertirlos a píxeles en cada cambio de escala. Las anotaciones educativas usan la misma conversión.

## Ecosistema 3D evaluado

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber): renderer compatible con la arquitectura React existente.
- [Drei](https://github.com/pmndrs/drei): cámara, carga de GLB, controles y utilidades.
- [React Three Rapier](https://pmndrs.github.io/react-three-rapier/): física; para React 18 deben usarse R3F v8 y Rapier v1.
- [Triplex](https://github.com/pmndrs/triplex): editor visual opcional para escenas R3F.
- [Ecctrl](https://github.com/pmndrs/ecctrl): referencia para control de personaje y cámara en tercera persona.
- [Webaverse](https://github.com/webaverse/app): referencia de separación entre mundo, avatares, interacción y contenido; no se integrará como motor.

Decisión: no importar un repositorio completo ni añadir “agentes” desconocidos al runtime. El vertical slice se construirá sobre R3F con estado educativo independiente, activos GLB optimizados y dependencias incorporadas solo cuando exista una escena que las use.
