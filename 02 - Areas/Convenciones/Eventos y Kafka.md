---
tipo: guia
estado: vigente
verificado_contra: DEC-008
actualizado: 2026-10-01
tags: [mercado, convenciones, kafka, eventos]
---
# Eventos y Kafka

> Cómo Mercado emite y recibe mensajes: envelope común, tópicos, publicación con outbox y tratamiento de fallos. Decidido: productor `market-service`, tópicos `market.events` y `accounting.events`, eventos en inglés `SNAKE_CASE` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Los tópicos del **código actual** todavía no coinciden con esos: es trabajo pendiente ([[Roadmap de trabajo]]). Contrato con Accounting: [[DEC-009 - Contrato de holds e ítems según Accounting]].

## Regla de plataforma

Un dominio = un tópico `<dominio>.events` (contrato de Kafka de la plataforma, v5), con su `.DLT`. Tópicos aprovisionados: `market.events`, `accounting.events`, `notifications.events`, `courses.events` y `users.events`, con 3 particiones y creación automática desactivada en el README (activada en el compose: en disputa). Ver [[Mapa de servicios]]. Los nombres `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño, nunca aprovisionadas. Los eventos deben ser hechos, no comandos (estándar de Notificaciones, [[Integración con Notificaciones]]).

## Envelope

Todos los mensajes usan `EventEnvelope<T>` (`dtos/events/EventEnvelope.java`): `eventId` (UUID), `eventType`, `eventVersion` (1), `timestamp`, `producer` y `payload`. Accounting usa el mismo envelope de 6 campos con `eventVersion` entero y `eventId` UUID canónico.

## Tópicos (como están en el código de Mercado)

| Tópico | Sentido | Mensajes | En la plataforma |
|---|---|---|---|
| `accounting.holds.commands` | Mercado a Accounting | `HOLD_CREATE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED` | No existe; accounting usa `accounting.events` |
| `accounting.holds.events` | Accounting a Mercado | `HOLD_CREATED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `HOLD_CONFIRMED`, `HOLD_RELEASED` | No existe |
| `inventory.items.commands` | Mercado a inventario | `ITEM_PROVISION_REQUESTED` | No existe ni existirá ([[DEC-001 - Accounting es dueño del inventario]]) |
| `inventory.items.events` | Inventario a Mercado | `ITEM_PROVISIONED`, `ITEM_PROVISION_FAILED` | Ídem |
| `market.orders.events` | Mercado a otros | `PURCHASE_CONFIRMED`; `ITEM_CONFIRMED` apagado por `market.events.item-confirmed.enabled=false` | No existe; el de Mercado es `market.events` |

Productores: `market-service` en los comandos y `tema-09-mercado` en `PURCHASE_CONFIRMED` (inconsistente; la decisión fija `market-service` en todos, tarea de código pendiente). Definidos en `configs/MessagingProperties.java`. Accounting usa el productor `tema-08-accounting-service` y el grupo `tema-08-accounting-service-group`; Mercado usa el grupo `market-service`.

Payloads relevantes del código: `HOLD_CREATE` sin moneda; `HOLD_CONFIRM {correlationId, holdId}`; `HOLD_RELEASE {correlationId, holdId, releaseReason}`; `ItemProvisionEventDto {correlationId, inventoryItemId, provisionedAt, reasonCode, detail}`.

Sin implementar: `CATALOG_OFFER_PUBLISHED` y el consumo de `COURSE_ARCHIVED`, `STUDENT_UNENROLLED` y `PARAMETRO_ACTUALIZADO`.

## Cómo debe quedar (contrato de Accounting, decidido)

| Tópico | Mensajes de Mercado a Accounting | Respuestas |
|---|---|---|
| `accounting.events` | `HOLD_CREATE_REQUESTED`, `HOLD_INCREASE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED` | `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `ITEM_CREDITED` |
| `market.events` | `ITEM_CONFIRMED` | n/a |

Clave de partición en accounting: `studentId:courseId` (Mercado usa `studentId`). Campos y motivos en [[Integración con Accounting]].

## Publicación con outbox

Los comandos se guardan en la tabla `outbox_events` dentro de la misma transacción que cambia la orden ([[Patrón Outbox]]). `OutboxRelayJob` corre cada 2 segundos, en lotes de 20, envía con la clave `studentId`, espera confirmación 5 segundos y se detiene en el primer fallo para conservar el orden. `acks=all` e idempotencia del productor activados. El `id` de la fila es el `eventId`, y el `correlationId` de la respuesta es ese UUID. El outbox de accounting corre cada ~5 s (S8 pide bajarlo a ~1 s, [[Taller de decisiones]]).

## Consumo

`AccountingHoldKafkaListener` e `InventoryItemKafkaListener` (solo con `market.messaging.transport=kafka`) usan `SagaEventParser`. La tabla `processed_events` evita reprocesar un `eventId` en la misma transacción ([[Entrega at-least-once y deduplicación]]).

## Fallos

`KafkaConfig` de Mercado: 2 reintentos con 1 segundo de espera y luego tópico `<topic>.DLT`; `MalformedEventException` va directo a DLT. Accounting: 3 reintentos de 2 s y luego DLT. Si accounting falla al acreditar un item no publica ningún evento de falla.

## Relacionado
[[Integración con Accounting]], [[Integración con Notificaciones]], [[Saga]].
