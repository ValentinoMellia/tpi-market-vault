---
tipo: guia
estado: vigente
verificado_contra: DEC-025, codigo@b2c3597c
actualizado: 2026-10-12
tags: [mercado, convenciones, kafka, eventos]
---
# Eventos y Kafka

> Cómo Mercado emite y recibe mensajes: envelope común, tópicos, publicación con outbox y tratamiento de fallos. Decidido e implementado: productor `market-service`, tópicos `market.events` y `accounting.events`, eventos en inglés `SNAKE_CASE` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). La compra directa de ítems sigue la Propuesta C ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]): emisión de `ITEM_CONFIRMED` en `market.events`, consumo de `ITEM_CREDITED` en `accounting.events`, y compensación con `ITEM_REVOKE_REQUESTED` y `HOLD_RELEASE_REQUESTED`.

## Regla de plataforma

Un dominio = un tópico `<dominio>.events` (contrato de Kafka de la plataforma, v5), con su `.DLT`. Tópicos aprovisionados: `market.events`, `accounting.events`, `notifications.events`, `courses.events` y `users.events`, con 3 particiones y creación automática desactivada en el README (activada en el compose: en disputa). Ver [[Mapa de servicios]]. Los nombres `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño, nunca aprovisionadas. Los eventos deben ser hechos, no comandos (estándar de Notificaciones, [[Integración con Notificaciones]]).

## Envelope

Todos los mensajes usan `EventEnvelope<T>` (`dtos/events/EventEnvelope.java`): `eventId` (UUID), `eventType`, `eventVersion` (1), `timestamp`, `producer` y `payload`. Accounting usa el mismo envelope de 6 campos con `eventVersion` entero y `eventId` UUID canónico. Los payloads de Kafka y del outbox se serializan en `camelCase` con el `ObjectMapper` de `MappersConfig`; el `snake_case` de los cuerpos REST no los afecta ([[Errores de la API]], `application.properties:11-17`).

## Tópicos (como están en el código de Mercado)

Valores por defecto de `application.properties:46-51` (`develop` en `b2c3597c`); cada uno se cambia con su variable de entorno `MARKET_MESSAGING_TOPIC_*`, que también se pasa en `.compose/docker-compose.yml` y se documenta en `.compose/.env.example`. Se definen en `configs/MessagingProperties.java`.

| Tópico por defecto | Variable | Sentido | Mensajes | En la plataforma |
|---|---|---|---|---|
| `accounting.events` | `..._ACCOUNTING_HOLDS_COMMANDS` y `..._ACCOUNTING_HOLDS_EVENTS` | Mercado a Accounting y Accounting a Mercado | Comandos `HOLD_CREATE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`, `ITEM_REVOKE_REQUESTED`; respuestas `HOLD_CREATED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `ITEM_CREDITED` | Existe: es el tópico de Accounting |
| `market.events` | `..._MARKET_EVENTS`; `..._ORDER_EVENTS` | Mercado a otros | `PURCHASE_CONFIRMED`, `LIFE_PURCHASE_CONFIRMED`, `ITEM_CONFIRMED` | Existe |

Los antiguos tópicos `inventory.items.*` fueron descartados: T01 (PR #179) eliminó los clientes y listeners salientes a Inventario. Todo el inventario se gestiona en Accounting ([[DEC-001 - Accounting es dueño del inventario]]).

Productores: `market-service` en **todos** los mensajes salientes (PR #102, US-5193 T04, `2485d8cf`). `MessagingProperties` fija `producer = "market-service"` por defecto, configurable mediante `market.messaging.producer` (`MARKET_MESSAGING_PRODUCER`). `OrderConfirmationServiceImpl`, `OutboxBankHoldClient` e `ItemRevokeClient` (`OutboxItemRevokeClient.java`) emiten con `market-service`. Accounting usa el productor `tema-08-accounting-service` y el grupo `tema-08-accounting-service-group`; Mercado usa el grupo `market-service` (`spring.kafka.consumer.group-id`).

### Tópico compartido y filtro de eventos

Como comandos y respuestas de holds y revocación comparten `accounting.events`, `AccountingHoldKafkaListener` recibe también los comandos de Mercado y los eventos de Accounting que no consume. Desde `a4e6ac76` (US-5193 T03, tpi-market#102, merge `2485d8cf`) `onMessage` filtra **antes** de parsear el payload:

1. Lee el `producer` del envelope con `SagaEventParser.producerOf` y descarta, con log `DEBUG`, los mensajes de `market-service` (los comandos propios).
2. Lee el `eventType` con `SagaEventParser.eventTypeOf`: enruta `ITEM_CREDITED` hacia `AccountingItemCreditedEventHandler`, `LIFE_PURCHASE_REJECTED` a `AccountingLifePurchaseEventHandler`, los eventos de hold a `AccountingHoldEventHandler`, y descarta con `DEBUG` lo no consumido.
3. Con esto ningún comando propio genera `MalformedEventException` ni llega a `accounting.events.DLT`.

### Payloads relevantes del código

- `HOLD_CREATE`: `{studentId, courseId, orderId, orderType, amount, ttlSeconds}`.
- `HOLD_CONFIRM`: `{correlationId, holdId}`.
- `HOLD_RELEASE`: `{correlationId, holdId, releaseReason}` donde `releaseReason` es el enum tipado `BankHoldReleaseReason`: `AUCTION_LOST`, `AUCTION_CANCELLED` o `PURCHASE_NOT_COMPLETED` (PR #115, `5de30854`).
- `ITEM_CONFIRMED`: `{studentId, courseId, orderId, catalogItemId, itemName, itemType, effect, maxCharges, applicableChallengeScope, ...}` con `orderId = orderRef` canónico.
- `ITEM_REVOKE_REQUESTED` (congelado en Mercado, PR #184):
  `{correlationId, orderId, studentId, courseId, revokeReason: "PURCHASE_NOT_COMPLETED"}` con clave de partición `studentId:courseId` y `orderId = orderRef`.
- **Esquemas de respuesta propuestos (en desarrollo en T05, NO implementados en producción, pendientes de ratificación de Accounting):**
  - `ITEM_CREDIT_FAILED`: `{studentId, courseId, sourceReferenceId, reason, message}`. Cancela sin revocar ítem y libera el hold con `HOLD_RELEASE_REQUESTED(PURCHASE_NOT_COMPLETED)`.
  - `ITEM_REVOKED`: `{correlationId, orderId, studentId, courseId, revokedItemCount}` (`revokedItemCount = 0` indica "nada que revocar").
  - `ITEM_REVOKE_FAILED`: `{correlationId, orderId, studentId, courseId, reason, message}`. Marca revisión administrativa con causa `ITEM_REVOKE_FAILED` (`OrderReviewReason`), emite log `ERROR` e incrementa la métrica `market.purchase.revoke_failed{reason}`.

## Cómo debe quedar (contrato de Accounting con Propuesta C adoptada)

| Tópico | Mensajes de Mercado a Accounting | Respuestas de Accounting a Mercado |
|---|---|---|
| `accounting.events` | `HOLD_CREATE_REQUESTED`, `HOLD_INCREASE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`, `ITEM_REVOKE_REQUESTED` | `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `ITEM_CREDITED`, `ITEM_CREDIT_FAILED` (propuesto), `ITEM_REVOKED` (propuesto), `ITEM_REVOKE_FAILED` (propuesto) |
| `market.events` | `ITEM_CONFIRMED`, `PURCHASE_CONFIRMED`, `LIFE_PURCHASE_CONFIRMED` | n/a |

Clave de partición en Accounting: `studentId:courseId` (Mercado usa `studentId:courseId` para los comandos de saga).

## Publicación con outbox

Los comandos se guardan en la tabla `outbox_events` dentro de la misma transacción que cambia la orden ([[Patrón Outbox]]). `OutboxRelayJob` corre cada 2 segundos, en lotes de 20, envía con la clave de saga, espera confirmación 5 segundos y se detiene en el primer fallo para conservar el orden. `acks=all` e idempotencia del productor activados. El `id` de la fila es el `eventId`, y el `correlationId` de la respuesta es ese UUID.

## Consumo

`AccountingHoldKafkaListener` (solo con `market.messaging.transport=kafka`) usa `SagaEventParser`. Descarta comandos propios antes de parsear. La tabla `processed_events` evita reprocesar un `eventId` en la misma transacción ([[Entrega at-least-once y deduplicación]]). Si un evento asíncrono externo llega sin `correlationId`, se resuelve por `holdId` en la base de datos (PR #116).

## Fallos

`KafkaConfig` de Mercado: 2 reintentos con 1 segundo de espera y luego tópico `<topic>.DLT`; `MalformedEventException` va directo a DLT. Accounting: 3 reintentos de 2 s y luego DLT.

## Relacionado
[[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Propuesta C de la saga de compra]], [[Integración con Accounting]], [[Integración con Notificaciones]], [[Saga]].
