---
tipo: guia
estado: vigente
verificado_contra: DEC-025, codigo@d3b7a4de
actualizado: 2026-10-12
tags: [mercado, convenciones, kafka, eventos]
---
# Eventos y Kafka

> Cómo Mercado emite y recibe mensajes: envelope común, tópicos, publicación con outbox y tratamiento de fallos. Decidido e implementado: productor `market-service`, tópicos `market.events` y `accounting.events`, eventos en inglés `SNAKE_CASE` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). La compra directa de ítems sigue la Propuesta C ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]): emisión de `ITEM_CONFIRMED` en `market.events`, consumo de `ITEM_CREDITED` en `accounting.events`, y compensación con `ITEM_REVOKE_REQUESTED` y `HOLD_RELEASE_REQUESTED`.

## Regla de plataforma

Un dominio = un tópico `<dominio>.events` (contrato de Kafka de la plataforma, v5), con su `.DLT`. Tópicos aprovisionados: `market.events`, `accounting.events`, `notifications.events`, `courses.events` y `users.events`, con 3 particiones y creación automática desactivada en el README (activada en el compose: en disputa). Ver [[Mapa de servicios]]. Los nombres `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño, nunca aprovisionadas. Los eventos deben ser hechos, no comandos (estándar de Notificaciones, [[Integración con Notificaciones]]).

## Envelope y formato de cable

Los mensajes de la plataforma usan el estándar `EventEnvelope` de 6 campos. Siguiendo la especificación oficial de **contratos-kafka v8**, el formato de cable para el flujo de compra directa migra a **`snake_case`**:
- Envelope: `event_id` (UUID), `event_type`, `event_version` (1), `timestamp`, `producer` y `payload`.
- Payloads de la saga de compras: todos los campos serializados en `snake_case` (`order_id`, `student_id`, `course_id`, `correlation_id`, `source_reference_id`, `revoke_reason`, etc.).

**Estado de la migración de casing:**
- **Accounting:** En su rama `develop` (`tpi-accounting@10e31d85`, 2026-10-11), ya publica y consume exclusivamente en `snake_case`.
- **Mercado:** Migración a `snake_case` según `contratos-kafka v8` mergeada en `develop@d3b7a4de` (PR #186).

## Tópicos (como están en el código de Mercado)

Valores por defecto de `application.properties:46-51` (`develop` en `d3b7a4de`); cada uno se cambia con su variable de entorno `MARKET_MESSAGING_TOPIC_*`, que también se pasa en `.compose/docker-compose.yml` y se documenta en `.compose/.env.example`. Se definen en `configs/MessagingProperties.java`.

| Tópico por defecto | Variable | Sentido | Mensajes | En la plataforma |
|---|---|---|---|---|
| `accounting.events` | `..._ACCOUNTING_HOLDS_COMMANDS` y `..._ACCOUNTING_HOLDS_EVENTS` | Mercado a Accounting y Accounting a Mercado | Comandos `HOLD_CREATE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`, `ITEM_REVOKE_REQUESTED`; respuestas `HOLD_CREATED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `ITEM_CREDITED` | Existe: es el tópico de Accounting |
| `market.events` | `..._MARKET_EVENTS`; `..._ORDER_EVENTS` | Mercado a otros | `PURCHASE_CONFIRMED`, `LIFE_PURCHASE_CONFIRMED`, `ITEM_CONFIRMED` | Existe |

Los antiguos tópicos `inventory.items.*` fueron descartados: T01 (PR #179) eliminó los clientes y listeners salientes a Inventario. Todo el inventario se gestiona en Accounting ([[DEC-001 - Accounting es dueño del inventario]]).

Productores: `market-service` en **todos** los mensajes salientes (PR #102, US-5193 T04, `2485d8cf`). `MessagingProperties` fija `producer = "market-service"` por defecto, configurable mediante `market.messaging.producer` (`MARKET_MESSAGING_PRODUCER`). `OrderConfirmationServiceImpl`, `OutboxBankHoldClient` e `ItemRevokeClient` (`OutboxItemRevokeClient.java`) emiten con `market-service`. Accounting usa el productor `tema-08-accounting-service` y el grupo `tema-08-accounting-service-group`; Mercado usa el grupo `market-service` (`spring.kafka.consumer.group-id`).

### Tópico compartido y filtro de eventos

Como comandos y respuestas de holds y revocación comparten `accounting.events`, `AccountingHoldKafkaListener` recibe también los comandos de Mercado y los eventos de Accounting que no consume. Desde `a4e6ac76` (US-5193 T03, tpi-market#102, merge `2485d8cf`) `onMessage` filtra **antes** de parsear el payload:

1. Lee el `producer` del envelope con `SagaEventParser.producerOf` y descarta, con log `DEBUG`, los mensajes de `market-service` (los comandos propios).
2. Lee el `event_type` con `SagaEventParser.eventTypeOf`: enruta `ITEM_CREDITED` hacia `AccountingItemCreditedEventHandler`, `LIFE_PURCHASE_REJECTED` a `AccountingLifePurchaseEventHandler`, los eventos de hold a `AccountingHoldEventHandler`, y descarta con `DEBUG` lo no consumido.
3. Con esto ningún comando propio genera `MalformedEventException` ni llega a `accounting.events.DLT`.

Sin implementar: `CATALOG_OFFER_PUBLISHED` y el consumo de `COURSE_ARCHIVED`, `STUDENT_UNENROLLED` y `PARAMETRO_ACTUALIZADO`.

### Payloads contractuales (contratos-kafka v8, snake_case)

- `HOLD_CREATE_REQUESTED`: `{student_id, course_id, order_id, order_type, amount, ttl_seconds}`.
- `HOLD_CONFIRM_REQUESTED`: `{correlation_id, hold_id, order_id}`.
- `HOLD_RELEASE_REQUESTED`: `{correlation_id, hold_id, release_reason}` donde `release_reason` es: `AUCTION_LOST`, `AUCTION_CANCELLED` o `PURCHASE_NOT_COMPLETED` (PR #115, `5de30854`).
- `ITEM_CONFIRMED`: `{student_id, course_id, order_id, catalog_item_id, item_name, item_type, effect, max_charges, applicable_challenge_scope, ...}` con `order_id = orderRef` canónico.
- `ITEM_REVOKE_REQUESTED` (congelado en Mercado, PR #184):
  `{correlation_id, order_id, student_id, course_id, revoke_reason: "PURCHASE_NOT_COMPLETED"}` con clave de partición `student_id:course_id` y `order_id = orderRef`.
- **Esquemas de respuesta propuestos (consumidores implementados en Mercado y mergeados en `develop@d3b7a4de` vía PR #188, T05; pendientes de ratificación por Accounting):**
  - `ITEM_CREDIT_FAILED`: `{student_id, course_id, source_reference_id, reason, message}`. Cancela sin revocar ítem y libera el hold con `HOLD_RELEASE_REQUESTED(PURCHASE_NOT_COMPLETED)`.
  - `ITEM_REVOKED`: `{correlation_id, order_id, student_id, course_id, revoked_item_count}` (`revoked_item_count = 0` indica "nada que revocar").
  - `ITEM_REVOKE_FAILED`: `{correlation_id, order_id, student_id, course_id, reason, message}`. Marca revisión administrativa con causa `ITEM_REVOKE_FAILED` (`OrderReviewReason`), emite log `ERROR` e incrementa la métrica `market.purchase.revoke_failed{reason}`. Además, de forma independiente establece la bandera booleana `revoke_failed = true` en la tabla `orders` (mediante `PurchaseReviewService.markRevokeFailed`), la cual se marca siempre ante un fallo de revocación aunque la orden ya tuviera otro motivo de revisión asignado.

## Cómo debe quedar (contrato de Accounting con Propuesta C adoptada)

| Tópico | Mensajes de Mercado a Accounting | Respuestas de Accounting a Mercado |
|---|---|---|
| `accounting.events` | `HOLD_CREATE_REQUESTED`, `HOLD_INCREASE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`, `ITEM_REVOKE_REQUESTED` | `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `ITEM_CREDITED`, `ITEM_CREDIT_FAILED` (propuesto), `ITEM_REVOKED` (propuesto), `ITEM_REVOKE_FAILED` (propuesto) |
| `market.events` | `ITEM_CONFIRMED`, `PURCHASE_CONFIRMED`, `LIFE_PURCHASE_CONFIRMED` | n/a |

Clave de partición en Accounting: `student_id:course_id` (Mercado usa `student_id:course_id` para los comandos de saga).

## Publicación con outbox

Los comandos se guardan en la tabla `outbox_events` dentro de la misma transacción que cambia la orden ([[Patrón Outbox]]). `OutboxRelayJob` corre cada 2 segundos, en lotes de 20, envía con la clave de saga, espera confirmación 5 segundos y se detiene en el primer fallo para conservar el orden. `acks=all` e idempotencia del productor activados. El `id` de la fila es el `event_id`, y el `correlation_id` de la respuesta es ese UUID. El outbox de accounting corre cada ~5 s (S8 pide bajarlo a ~1 s, [[Taller de decisiones]]).

## Consumo

`AccountingHoldKafkaListener` (solo con `market.messaging.transport=kafka`) usa `SagaEventParser`. Descarta comandos propios antes de parsear. La tabla `processed_events` evita reprocesar un `event_id` en la misma transacción ([[Entrega at-least-once y deduplicación]]). Si un evento asíncrono externo llega sin `correlation_id`, se resuelve por `hold_id` en la base de datos (PR #116).

## Fallos

`KafkaConfig` de Mercado: 2 reintentos con 1 segundo de espera y luego tópico `<topic>.DLT`; `MalformedEventException` va directo a DLT. Accounting: 3 reintentos de 2 s y luego DLT. Si accounting falla al acreditar un item no publica ningún evento de falla; `ITEM_CREDIT_FAILED` es una propuesta de Mercado pendiente de ratificación.

## Relacionado
[[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Propuesta C de la saga de compra]], [[Integración con Accounting]], [[Integración con Notificaciones]], [[Saga]].
