---
tipo: decision
estado: vigente
verificado_contra: codigo@25917cf5b
actualizado: 2026-10-21
tags: [mercado, decision, subastas, saga, outbox, kafka]
---
# DEC-038 - La puja es el agregado de la saga de subastas

> En la saga de holds, cada puja es su propio agregado (`AUCTION_BID`) con id `Long`; sus filas del outbox salen con la key `student_id:course_id`, la US #11436 crea el modelo mínimo de la puja que después completa la oferta (#8412), y la acreditación del premio (#11472) pasa a la liquidación (US #8397). Los eventos que pertenecen a la subasta entera quedan abiertos en [[Q-030 - Agregado de los eventos de la subasta entera en el outbox]].

## Contexto
La US #11436 (task #11421) tiene que llevar la saga de holds y el outbox a las subastas, pero el código de `develop` (`25917cf5b`) no lo permitía tal como estaba:

- La subasta usa UUID (`AuctionEntity.id` y `winner_bid_id`), mientras que la saga usa `Long` en `OutboxEventEntity.aggregateId` (columna `aggregate_id BIGINT`), `SagaRouting`, `OutboxRouting` y `SagaCorrelationService.Correlation`.
- No había contrato para el `message_key` de las filas de subasta. La task pide no copiar la key de la meta colectiva.
- No existe la entidad de puja ni el `hold_id` por postor que necesita `HoldOwnerResolver`, y la oferta (#8412, US #8395) se planificó como posterior a esta US.
- La task #11472 (acreditación del premio) colgaba de esta US, pero se declaraba previa a #8418 y a la vez dependía de la secuencia de liquidación que define #8418.

No partió de una `Q`. La decidió el responsable de la US #11436 el 2026-10-21, a partir del análisis de la US. Los puntos 3 y 4 cambian tareas de otras historias (#8412 de la US #8395 y la US #8397): se avisa a su responsable.

## Decisión
1. **Agregado de la saga: la puja, con id `Long`.** La tabla de pujas usa una PK `BIGSERIAL`, y los comandos y respuestas de cada postor (`HOLD_CREATE`, `HOLD_INCREASE`, `HOLD_CONFIRM`, `HOLD_RELEASE`, `HOLD_EXPIRED` y rechazos) se registran como filas `AUCTION_BID` con ese id. El UUID de la subasta solo viaja hacia Accounting como `order_id`. `winner_bid_id` pasa de UUID a `BIGINT` con una migración Flyway nueva (no se edita `V12__auctions_schema.sql`, que ya pudo aplicarse).
2. **`message_key` de las filas de puja: `student_id:course_id`.** Asegura el orden de los comandos de un mismo postor y coincide con la `AccountingKey` de las respuestas de Accounting y con la key por postor que Mercado ya le propuso a Accounting ([comentario en el issue 200 de tpi-market](https://github.com/2026-P4-BE/tpi-market/issues/200#issuecomment-6244678432)). Accounting no usa la key de lo que recibe, así que no cambia su contrato; queda por avisarle para que lo documente.
3. **La US #11436 crea el modelo mínimo de la puja.** Incluye la entidad y su migración (`auction_id`, `student_id` con clave única conjunta, `amount`, `hold_id`, `hold_expires_at` y estado, según el diseño de [[Subasta]]), el `HoldOwner` de la puja en `HoldOwnerResolver` y un puerto para las respuestas de hold de una puja con una implementación que solo deja registro. La task #8412 implementa el comportamiento real sobre ese puerto.
4. **La acreditación del premio (task #11472) pasa a la US #8397** (Cerrar y liquidar subastas), después de #8418. Antes de empezarla, #8418 tiene que definir si las subastas siguen la [[Propuesta C de la saga de compra]] (acreditar y después confirmar el débito; [[DEC-025 - Saga de compra de ítems según la Propuesta C]] la adopta solo para la compra directa) y cómo se detecta una acreditación fallida mientras Accounting no ratifique `ITEM_CREDIT_FAILED`. La US #11436 queda en la saga de holds y el outbox.

## Alternativas descartadas
- **Columna `aggregate_ref` UUID en el outbox**: obliga a cambiar records, repositorios y relay que hoy usan compras y metas, con más riesgo de regresión y más trabajo en la US.
- **Pasar `aggregate_id` a texto**: rompe todas las consultas tipadas del outbox.
- **Key `student_id` sola**: también ordena por postor, pero se aparta de la key por postor ya propuesta a Accounting.
- **Key `course_id:order_id`** (la de la meta): pone toda la subasta en una partición sin necesidad y depende del visto bueno de Tema 11 que sigue pendiente para la meta.
- **Dejar #11472 en la US #11436 con un criterio nuevo**: obliga a re-estimar la US y la deja bloqueada hasta que se decida la secuencia de liquidación.
- **Que #11436 deje solo el puerto** (probado con un dueño falso) **o mover #11421 a la US #8395**: dejan el criterio de aceptación de `HoldOwnerResolver` sin verificar con datos reales, o mezclan la infraestructura con la oferta.

## Consecuencias
- Código (`tpi-market`): nuevo tipo `AUCTION_BID` en `entities/OutboxEventEntity.java` y factory en `dtos/events/SagaRouting.java`; rama nueva en `listeners/AccountingHoldEventHandler.java` (`isDispatchable` y despacho por tipo); `HoldOwner` de puja en `services/HoldOwnerResolver.java`; entidad y migración de la puja; migración de `winner_bid_id` y ajuste de `AuctionRepositoryTest`. `SagaCorrelationService`, el relay y la tabla del outbox no cambian (`aggregate_type` es `VARCHAR(30)` sin `CHECK`).
- Las sagas de compra directa y de meta colectiva no cambian de código; se cubren con pruebas de regresión.
- Backlog: el BDD 1 de la US #11436 pasa a verificar que la respuesta llega al puerto de la puja con la correlación del postor correcto (registrar la oferta es de #8412). La task #8412 parte de la entidad de #11421. La task #11472 se movió a la US #8397. El trabajo de la US #11436 se dividió en las tareas #11961 (T01, modelo de la puja), #11962 (T02, agregado del outbox), #11421 (T03, despacho al puerto) y #11963 (T04, `hold_id`), siguiendo el corte de la US #9472.
- Accounting: avisar la key por postor. Su aceptación sigue pendiente, como ya estaba.
- Abierto: los eventos cuyo agregado es la subasta entera, como los avisos de #11471 ([[Q-030 - Agregado de los eventos de la subasta entera en el outbox]]). La secuencia de liquidación del ganador sigue en #8418.

## Notas afectadas
[[Subasta]], [[Integración con Accounting]], [[Carga en Taiga - Sprints 2 y 3]], [[Decisiones - Índice]].
