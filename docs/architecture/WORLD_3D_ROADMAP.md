# TraderPath — ruta técnica hacia el mundo 3D

## Objetivo

Convertir el curso actual en una aventura educativa de mundo abierto: el jugador comienza en una ciudad académica neutral, aprende fundamentos y desbloquea portales hacia ciudades especializadas por mercado.

## Dirección visual

- Cámara: tercera persona elevada, con lectura clara de caminos e hitos.
- Mundo: low-poly estilizado, colorido y construido a mano; debe sentirse habitable, no como un dashboard.
- Interacción: caminar, observar, hablar con NPC, usar terminales y resolver una práctica contextual.
- HUD: un objetivo compacto, estado del jugador y avisos de interacción. El diario, el mapa y el material extenso permanecen cerrados durante la exploración.
- Ciudades:
  - Academia Ágora: ciudad inicial y fundamentos universales.
  - Ciudad Bitcoin: planta circular al pie de un volcán, plaza del bloque y puerto Lightning.
  - Distrito FX: Nueva York/Wall Street, torres de liquidez y relojes de sesiones.
  - Capital Corporativa: bolsa, empresas, resultados y valoración.
  - Puerto de Materias: oro, energía, agricultura y logística física.
  - Observatorio Global: índices y datos macroeconómicos.
  - Ciudad de Contratos: Chicago, margen y vencimientos.
  - Archipiélago Portafolio: ETFs y diversificación.

## Stack recomendado para este repositorio

El proyecto ya usa React 18, Next.js 14 y Zustand. La ruta compatible es:

- `three`
- `@react-three/fiber` v8
- `@react-three/drei` v9
- `@react-three/rapier` v1
- `@react-three/postprocessing`, solo cuando el rendimiento base sea estable
- GLB/glTF 2.0 para escenarios y personajes
- glTF Transform para compresión, texturas y LOD

No se debe incorporar un motor completo ni copiar repositorios de terceros. Se reutilizan patrones y librerías con licencia compatible, manteniendo el estado educativo como propiedad de TraderPath.

## Límites de arquitectura

```text
Contenido educativo y progreso
  └─ estado serializable (Zustand/Supabase)
      ├─ interfaz DOM: diálogos, quiz, mapa, accesibilidad
      └─ escena 3D: cámara, avatar, edificios, animaciones
```

- La escena 3D no decide si una respuesta es correcta.
- La simulación educativa no guarda objetos de Three.js.
- Los NPC emiten eventos (`npc:interact`, `lesson:start`, `portal:enter`).
- Las misiones responden con estados (`locked`, `available`, `active`, `passed`, `failed`).
- El control de cámara se pausa cuando hay un diálogo o menú.

## Python

Python no mejora el render del navegador. Debe entrar como servicio separado cuando exista una necesidad comprobada:

- generación y validación offline de escenarios OHLC;
- backtesting reproducible;
- normalización de datos históricos;
- comprobaciones pedagógicas sobre bancos de preguntas;
- exportación de métricas para la academia.

La opción prevista es FastAPI + tareas asíncronas, detrás de contratos JSON versionados. Las respuestas correctas, recompensas y progreso continúan validados por el backend de la aplicación, nunca por código Python ejecutado en el cliente.

## Fases

1. **Atlas 2.5D**: identidad visual y datos serializables de cada ciudad. Implementado como base.
2. **Vertical slice 3D**: Academia Ágora, un avatar, un NPC, una terminal de velas y un portal a Ciudad Bitcoin.
3. **Pipeline de activos**: convenciones de escala, pivote, colisiones, LOD, texturas y presupuesto por escena.
4. **Ciudad Bitcoin**: plaza circular, volcán, cuatro distritos y misión completa.
5. **Plantilla de ciudad**: convertir una definición de mercado en hitos, NPC, lecciones y ambientación.
6. **Servicios de datos**: escenarios reales bajo licencia y servicio Python para preparación/validación.

## Criterio para iniciar la fase 2

- M1.2, evaluación y progreso sin falsos aprobados.
- Anotaciones del gráfico ancladas a precio y tiempo.
- Atlas de ciudades aprobado visualmente.
- Presupuesto inicial: 60 FPS en escritorio integrado, carga inicial menor de 8 MB y escena GLB menor de 5 MB.
