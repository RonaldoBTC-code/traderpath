# Ciudad Origen: currículo editorial de Bitcoin

## Propósito

Bitcoin es la puerta de entrada obligatoria a la ruta cripto de TraderPath. Se enseña antes de exchanges, stablecoins, altcoins o trading porque permite comprender el problema original: transferir valor digital sin depender de una autoridad central que mantenga el libro contable.

La experiencia debe distinguir siempre:

- **Bitcoin**: protocolo, red y sistema monetario.
- **bitcoin**: unidad nativa que circula en la red.
- **BTC**: símbolo de mercado utilizado para cotizar el activo.
- **satoshi o sat**: unidad mínima habitual; 100.000.000 sats equivalen a 1 BTC.

Bitcoin sí pertenece técnicamente a la categoría de las criptomonedas. Su tratamiento separado en TraderPath es una decisión pedagógica: fue el primer sistema funcional de dinero electrónico peer-to-peer sin una autoridad central y constituye la referencia histórica y técnica del ecosistema.

## Conocimientos que no pueden faltar

### 1. El problema que resuelve

Antes de Bitcoin, el dinero digital normalmente necesitaba un intermediario para llevar el saldo y evitar que la misma unidad se gastara dos veces. Bitcoin reemplaza esa autoridad por reglas públicas, firmas criptográficas, una red peer-to-peer y prueba de trabajo.

### 2. Libro contable y propiedad

La cadena de bloques es un historial público ordenado de transacciones. Los bitcoins no se guardan como archivos dentro de una wallet. La red registra salidas de transacción no gastadas —UTXO— y una wallet administra las claves necesarias para autorizar su gasto.

Una dirección sirve para recibir. La clave privada autoriza el gasto. La frase de recuperación permite reconstruir las claves de muchas wallets. Nunca debe pedirse, mostrarse ni introducirse en una simulación educativa.

### 3. Nodos y mineros

- Los **nodos completos** verifican por sí mismos bloques y transacciones según las reglas de consenso.
- Los **mineros** agrupan transacciones, compiten mediante prueba de trabajo y proponen bloques.
- Un minero no puede crear reglas válidas por sí solo: los nodos rechazan los bloques que incumplen el consenso.
- La minería no “resuelve transacciones”; ofrece orden, coste de modificación y resistencia a reescribir el historial.

### 4. Emisión y escasez

La emisión está definida por el protocolo y disminuye aproximadamente cada 210.000 bloques mediante el halving. El límite es de casi 21 millones de BTC. La escasez programada no garantiza que el precio suba: el precio depende de oferta, demanda, liquidez, expectativas y riesgo.

### 5. Transacciones, mempool y comisiones

Una transacción firmada se difunde a la red. Antes de entrar en un bloque puede permanecer en la mempool. El usuario no paga por “enviar más dinero”, sino por el espacio que ocupa la transacción y la demanda existente por espacio de bloque. Una confirmación significa que la transacción fue incluida en un bloque; los bloques posteriores aumentan la dificultad de reorganizarla.

### 6. Custodia

- **Custodia propia**: el usuario controla las claves y también toda la responsabilidad.
- **Custodia de terceros**: una empresa controla las claves y el usuario asume riesgo de contraparte.
- **Wallet caliente**: conectada a internet; práctica, con mayor superficie de ataque.
- **Wallet fría o hardware wallet**: mantiene el proceso de firma aislado; reduce ciertos riesgos, pero no elimina errores humanos.

La regla educativa no es “todo exchange es malo”, sino “comprende quién controla las claves y qué riesgo estás aceptando”.

### 7. Privacidad y seguridad

Bitcoin no es anónimo por defecto. Su historial es público y el análisis puede relacionar direcciones y transacciones. Las operaciones son difíciles de revertir; verificar dirección, importe y red es obligatorio. Nadie legítimo necesita conocer la frase de recuperación o la clave privada.

### 8. Capas de pago

La capa base prioriza verificación y liquidación. Lightning utiliza canales respaldados por transacciones de Bitcoin para realizar pagos rápidos y de bajo coste fuera de la cadena principal. Lightning no sustituye a Bitcoin: depende de él para abrir, cerrar y resolver canales.

### 9. Bitcoin como mercado

Aprender el protocolo no equivale a recomendar comprar BTC. Antes de operar se estudian volatilidad, liquidez, riesgo de contraparte, regulación aplicable y tamaño de posición. BTC es el ticker; Bitcoin no es un gráfico ni una promesa de rentabilidad.

## Secuencia jugable

1. **Plaza Genesis** — problema del doble gasto y propuesta peer-to-peer.
2. **Taller de Bloques** — transacciones, UTXO, nodos, minería y confirmaciones.
3. **Casa de Custodia** — claves, direcciones, wallets y recuperación segura.
4. **Puente Lightning** — diferencias entre liquidación en la capa base y pagos cotidianos.
5. **Mercado BTC** — ticker, volatilidad y separación entre tecnología e inversión.

Cada zona presenta una analogía visual, una interacción breve, feedback inmediato y una evaluación final con respuestas aleatorias.

## Afirmaciones que TraderPath debe evitar

- “Bitcoin no es una criptomoneda.”
- “Bitcoin está respaldado por energía” como explicación única de su valor.
- “La blockchain guarda tus monedas.”
- “Los mineros controlan Bitcoin.”
- “Bitcoin es anónimo.”
- “Una transacción tarda siempre diez minutos.”
- “El halving hace que el precio suba.”
- “Autocustodia es segura automáticamente.”
- “Una estrategia tiene rentabilidad garantizada.”
- “USDT es lo mismo que dólares en una cuenta bancaria.”

## Referencia de CriptoBuzz

CriptoBuzz sirve como referencia de comunicación en español, práctica frecuente, análisis en vivo, gestión de riesgo, disciplina y comunidad. Sus estrategias propietarias, testimonios y afirmaciones de resultados son material comercial, no fuentes técnicas del protocolo ni evidencia de rentabilidad futura. TraderPath puede aprender de su claridad y ritmo, pero debe conservar:

- neutralidad educativa;
- capital exclusivamente virtual durante la formación;
- explicaciones verificables;
- advertencias de riesgo;
- ausencia de promesas de ingresos;
- separación entre educación, análisis y recomendación financiera.

## Fuentes base

- [White paper de Bitcoin en español](https://bitcoin.org/files/bitcoin-paper/bitcoin_es_latam.pdf)
- [Cómo funciona Bitcoin](https://bitcoin.org/es/como-funciona)
- [Preguntas frecuentes de Bitcoin](https://bitcoin.org/es/faq)
- [Aspectos de seguridad y riesgo](https://bitcoin.org/es/debes-saber)
- [Guía para desarrolladores](https://developer.bitcoin.org/devguide/)
- [Wallets](https://developer.bitcoin.org/devguide/wallets.html)
- [Transacciones](https://developer.bitcoin.org/devguide/transactions.html)
- [Red peer-to-peer](https://developer.bitcoin.org/devguide/p2p_network.html)
- [Minería](https://developer.bitcoin.org/devguide/mining.html)
- [Lightning Network: visión general](https://docs.lightning.engineering/the-lightning-network/overview)

