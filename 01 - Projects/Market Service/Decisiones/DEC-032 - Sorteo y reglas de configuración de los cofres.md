---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-16
actualizado: 2026-10-17
tags: [mercado, decision, cofres, sorteo]
---
# DEC-032 - Sorteo y reglas de configuración de los cofres

> Mercado sortea el premio del cofre al crear la orden y guarda el resultado, así un reintento nunca vuelve a sortear. El profesor puede cambiar los pesos de rareza, cargar tantos premios como quiera, elegir si el alumno ve las probabilidades y poner un límite opcional de cofres por alumno. RF-INT-02 tampoco se aplica al XP de los cofres. Cierra la revisión de D-1 a D-11.

## Contexto
[[DEC-031 - Cofres configurables con ítems, monedas y XP]] definió qué es un cofre y dejó abiertos el sorteo, la acreditación y algunas reglas de configuración. Esos puntos son de la task T02 #8427 de la US-8400. Esta decisión registra lo que depende solo de Mercado. Lo que depende de otros equipos está en [[Q-028 - Acreditación de premios de cofre en Accounting]] y [[Q-029 - Acreditación de XP de cofre en Roadmap]].

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-16, a partir del análisis del change `us-8400-t02-chest-reward-agreements` de `tpi-market`.

## Decisión
- **Mercado sortea, al crear la orden.** La orden guarda el resultado: clase de premio, referencia (el premio de oferta, o la cantidad de monedas o de XP) y rareza. Un reintento o una conciliación leen ese resultado y no vuelven a sortear. Si la orden se cancela o se rechaza antes del débito, no se acredita nada y el sorteo se descarta. Accounting y Roadmap reciben una acreditación común y no necesitan lógica de azar.
- **El profesor puede cambiar los pesos de rareza.** 60 / 25 / 12 / 3 queda como valor por defecto. Sigue la regla de DEC-031: el sistema avisa, no bloquea.
- **No hay máximo de premios por cofre.** El mockup proponía 8 para que la pantalla entrara sin scroll en 1280×720. Con premios ilimitados, la pantalla del profesor hay que replantearla. Eso es del frontend: [[DEC-035 - Cofres en dos fases]] lo deja para la historia H4.
- **El profesor elige si el alumno ve las probabilidades** antes de comprar, con un interruptor en la configuración del cofre. El interruptor viene encendido por defecto ([[DEC-035 - Cofres en dos fases]]).
- **Los premios de oferta guardan una copia de la configuración.** Al agregar una oferta como premio, el cofre copia su configuración (tipo de ítem, cargas, alcance, nombre). Si después el profesor edita o desactiva la oferta, el cofre publicado no cambia. La copia es solo de la configuración, no de unidades: sortear el premio no consume el stock de la oferta original, y la entrega a Accounting es una por orden e idempotente por `orderId`, así que un reintento no duplica el ítem y una oferta desactivada no hace perder el premio.
- **Las vidas pueden ser premio, con aviso.** Una vida viaja como en la compra de vidas (`LIFE_PURCHASE_CONFIRMED`) y Accounting la recorta si el alumno está en el tope (PAR-12, [[DEC-007 - Tope de vidas, Accounting decide y reporta]]). El asistente avisa al profesor que un alumno en el tope pierde ese premio. No se bloquea.
- **Límite opcional de cofres por alumno.** El profesor puede fijar una cantidad máxima por alumno y elegir el período (por día, por semana o por cursada). Vacío significa sin límite.
- **No hay tope de XP por cofre definido por ADMIN.** El profesor decide la cantidad y el sistema avisa, como dice DEC-031.
- **RF-INT-02 no se aplica al XP de los cofres.** El PRD dice que el XP no se intercambia. La aprobación del PO del 2026-10-12, que habilitó XP en los cofres, lo cubre, igual que con RF-INT-01 en DEC-031. Fuera de los cofres, RF-INT-02 sigue vigente.

## Alternativas descartadas
- **Referencia viva a la oferta en lugar de copia:** si el profesor desactiva la oferta, el cofre perdería el premio o quedaría inválido.
- **Sin vidas en el pool hasta que exista el rechazo por tope** (lo recomendaba la propuesta original, D-3): contradice DEC-031, que admite vidas. Se prefirió avisar.
- **Tope global de XP por cofre definido por ADMIN** (`PAR-XP-CHEST-MAX` en la propuesta original): agrega una dependencia con Backoffice y contradice la libertad del profesor de DEC-031.
- **Que sortee Accounting** (el cofre entra al inventario como `LOOT_CHEST` y se abre después): lleva la lógica de azar a un equipo que no es dueño de la configuración del cofre. Además, abrir el cofre sería una segunda saga, y las monedas y el XP igual necesitarían acreditaciones nuevas.
- **Sortear al confirmar la orden en lugar de al crearla:** el alumno pagaría sin un resultado fijo, y un reintento entre el hold y la confirmación podría sortear dos veces.
- **Pesos fijos de la plataforma:** contradice el cofre totalmente configurable de DEC-031.
- **Máximo de 8 premios:** se descartó para no limitar al profesor. El costo pasa a la pantalla.
- **Mostrar siempre las probabilidades:** se prefirió dejarlo a criterio del profesor.

## Consecuencias
- **Orden de compra.** Hoy `OrderEntity` tiene una sola oferta, un solo `itemType` y una sola cantidad (`src/main/java/ar/edu/utn/frc/tup/p4/entities/OrderEntity.java`). Guardar el sorteo exige campos nuevos. Nada cambia hasta que se cargue la historia H3 de [[DEC-035 - Cofres en dos fases]].
- **Saga.** El cobro no cambia: un hold por el precio del cofre. Después del débito, la entrega depende de la clase de premio: `ITEM_CONFIRMED` a Accounting, una acreditación de monedas a Accounting o una de XP a Roadmap.
- **Frontend.** La pantalla del profesor tiene que admitir cualquier cantidad de premios, pesos editables y el interruptor de probabilidades.
- **D-1 a D-11.** La tabla estaba en la propuesta original del equipo (30/09) y no se había migrado al vault. Revisión:

| D | Tema | Estado |
|---|---|---|
| D-1 | ¿El cofre da monedas y XP? | Resuelta por [[DEC-031 - Cofres configurables con ítems, monedas y XP]]: sí |
| D-2 | ¿Cómo se acreditan N ítems de una orden? | No aplica: DEC-031 fija un solo premio por cofre |
| D-3 | ¿Vidas en el pool? | Resuelta acá: sí, con aviso al profesor |
| D-4 | Período de `maxPerStudent` | Resuelta acá: límite opcional, el profesor elige el período |
| D-5, D-6, D-7, D-9, D-10 | Meta colectiva | No son de cofres: [[DEC-029 - Meta colectiva]] y [[Q-026 - Detalles del contrato de la meta colectiva con Accounting]] |
| D-8 | ¿Se acumulan los boosts del mismo tipo? | No es de cofres: los efectos son de Accounting ([[DEC-010 - Los efectos de los ítems no son de Mercado]]) |
| D-11 | ¿Los cosméticos cuentan como canje válido? | No es de cofres: US-8401 |

## Notas afectadas
[[DEC-031 - Cofres configurables con ítems, monedas y XP]], [[Q-028 - Acreditación de premios de cofre en Accounting]], [[Q-029 - Acreditación de XP de cofre en Roadmap]], [[Cofres y nuevos ítems]], [[Decisiones - Índice]], [[DEC-035 - Cofres en dos fases]].
