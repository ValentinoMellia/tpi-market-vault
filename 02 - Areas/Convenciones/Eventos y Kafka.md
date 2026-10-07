---
tipo: guia
estado: vigente
verificado_contra: codigo@349c8e2
actualizado: 2026-10-04
tags: [mercado, convenciones, kafka, eventos]
---
# Eventos y Kafka

> Cómo Mercado emite y recibe mensajes: envelope común, tópicos, publicación con outbox y tratamiento de fallos. Decidido: productor `market-service`, tópicos `market.events` y `accounting.events`, eventos en inglés `SNAKE_CASE` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Desde el PR #88 (US-5193) los tópicos por defecto del **código** ya son esos; falta el resto de la alineación ([[Roadmap de trabajo]]). Contrato con Accounting: [[DEC-009 - Contrato de holds e ítems según Accounting]].

## Regla de plataforma

Un dominio = un tópico `<dominio>.events` (contrato de Kafka de la plataforma, v5), con su `.DLT`. Tópicos aprovisionados: `market.events`, `accounting.events`, `notifications.events`, `courses.events` y `users.events`, con 3 particiones y creación automática desactivada en el README (activada en el compose: en disputa). Ver [[Mapa de servicios]]. Los nombres `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño, nunca aprovisionadas. Los eventos deben ser hechos, no comandos (estándar de Notificaciones, [[Integración con Notificaciones]]).

## Envelope

Todos los mensajes usan `EventEnvelope<T>` (`dtos/events/EventEnvelope.java`): `eventId` (UUID), `eventType`, `eventVersion` (1), `timestamp`, `producer` y `payload`. Accounting usa el mismo envelope de 6 campos con `eventVersion` entero y `eventId` UUID canónico. Los payloads de Kafka y del outbox se serializan en `camelCase` con el `ObjectMapper` de `MappersConfig`; el `snake_case` de los cuerpos REST no los afecta ([[Errores de la API]], `application.properties:11-17`).

## Tópicos (como están en el código de Mercado)

Valores por defecto de `application.properties:46-51` (`develop` en `349c8e2`); cada uno se cambia con su variable de entorno `MARKET_MESSAGING_TOPIC_*`, que también se pasa en `.compose/docker-compose.yml` y se documenta en `.compose/.env.example`. Se definen en `configs/MessagingProperties.java`.

| Tópico por defecto | Variable | Sentido | Mensajes | En la plataforma |
|---|---|---|---|---|
| `accounting.events` | `..._ACCOUNTING_HOLDS_COMMANDS` y `..._ACCOUNTING_HOLDS_EVENTS` | Mercado a Accounting y Accounting a Mercado | Comandos `HOLD_CREATE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`; respuestas `HOLD_CREATED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `HOLD_CONFIRMED`, `HOLD_RELEASED` | Existe: es el tópico de Accounting |
| `market.events` | `..._MARKET_EVENTS`; `..._ORDER_EVENTS` (si falta, usa el anterior) | Mercado a otros | `PURCHASE_CONFIRMED`, `LIFE_PURCHASE_CONFIRMED`; `ITEM_CONFIRMED` apagado por `market.events.item-confirmed.enabled=false` | Existe |
| `inventory.items.commands` | `..._INVENTORY_ITEMS_COMMANDS` | Mercado a inventario | `ITEM_PROVISION_REQUESTED` | No existe ni existirá ([[DEC-001 - Accounting es dueño del inventario]]) |
| `inventory.items.events` | `..._INVENTORY_ITEMS_EVENTS` | Inventario a Mercado | `ITEM_PROVISIONED`, `ITEM_PROVISION_FAILED` | Ídem |

Antes del PR #88 los defectos eran `accounting.holds.commands`, `accounting.holds.events` y `market.orders.events`, que la plataforma nunca aprovisionó. Los tópicos de inventario siguen sin existir en la plataforma, y Accounting no implementa `ITEM_PROVISION_*`: con transporte `kafka` esa parte de la saga no tiene contraparte ([[Integración con Accounting]]).

Productores: `market-service` en los comandos de hold y en `LIFE_PURCHASE_CONFIRMED`; `tema-09-mercado` en `PURCHASE_CONFIRMED` e `ITEM_CONFIRMED` (inconsistente; la decisión fija `market-service` en todos, tarea de código pendiente, `services/impl/OrderConfirmationServiceImpl.java:67`). Accounting usa el productor `tema-08-accounting-service` y el grupo `tema-08-accounting-service-group`; Mercado usa el grupo `market-service` (`spring.kafka.consumer.group-id`).

### Tópico compartido y filtro de eventos

Como comandos y respuestas de holds comparten `accounting.events`, `AccountingHoldKafkaListener` recibe también los comandos de Mercado y los eventos de Accounting que no consume. Desde `a4e6ac76` (US-5193 T03, tpi-market#102) `onMessage` filtra **antes** de parsear el payload:

1. Lee el `producer` del envelope con `SagaEventParser.producerOf` y descarta, con log `DEBUG`, los mensajes de `market-service` (los comandos propios).
2. Lee el `eventType` con `SagaEventParser.eventTypeOf` y, si `AccountingHoldEventHandler.consumes(eventType)` es falso, descarta con log `DEBUG` el evento que Mercado no consume.
3. Solo entonces parsea como `HoldEventDto` y llama al handler, que repite la lista blanca (`CONSUMED_EVENT_TYPES`: `HOLD_CREATED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`) sin correlación ni deduplicación.

Con esto los comandos propios `HOLD_CREATE_REQUESTED`, `HOLD_RELEASE_REQUESTED` y `HOLD_CONFIRM_REQUESTED` ya no lanzan `MalformedEventException` ni llegan a `accounting.events.DLT`. Verificado en `origin/develop` (`74e671ef`) y cubierto por `AccountingHoldKafkaListenerTest` y por `KafkaSagaIntegrationTest` (broker real con Testcontainers: ningún comando propio en el DLT). Antes de `a4e6ac76` el filtro corría después del parseo y esos comandos sí iban al DLT; ese era el gap 23 de [[Estado actual del código]], hoy cerrado.

Payloads relevantes del código: `HOLD_CREATE` sin moneda; `HOLD_CONFIRM {correlationId, holdId}`; `HOLD_RELEASE {correlationId, holdId, releaseReason}`; `ItemProvisionEventDto {correlationId, inventoryItemId, provisionedAt, reasonCode, detail}`.

Sin implementar: `CATALOG_OFFER_PUBLISHED` y el consumo de `COURSE_ARCHIVED`, `STUDENT_UNENROLLED` y `PARAMETRO_ACTUALIZADO`.

## Cómo debe quedar (contrato de Accounting, decidido)

| Tópico | Mensajes de Mercado a Accounting | Respuestas |
|---|---|---|
| `accounting.events` | `HOLD_CREATE_REQUESTED`, `HOLD_INCREASE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED` | `HOLD_CREATED`, `HOLD_INCREASED`, `HOLD_CONFIRMED`, `HOLD_RELEASED`, `HOLD_REJECTED`, `HOLD_EXPIRED`, `ITEM_CREDITED` |
| `market.events` | `ITEM_CONFIRMED` | n/a |

Los tópicos de esta tabla ya son los de Mercado por defecto; lo que falta es el flujo de ítems (`ITEM_CREDITED`, y `ITEM_CONFIRMED` con el `orderId` UUID, hoy numérico y apagado) y las subastas (`HOLD_INCREASE_REQUESTED`). Clave de partición en accounting: `studentId:courseId` (Mercado usa `studentId`). Campos y motivos en [[Integración con Accounting]].

## Publicación con outbox

Los comandos se guardan en la tabla `outbox_events` dentro de la misma transacción que cambia la orden ([[Patrón Outbox]]). `OutboxRelayJob` corre cada 2 segundos, en lotes de 20, envía con la clave `studentId`, espera confirmación 5 segundos y se detiene en el primer fallo para conservar el orden. `acks=all` e idempotencia del productor activados. El `id` de la fila es el `eventId`, y el `correlationId` de la respuesta es ese UUID. El outbox de accounting corre cada ~5 s (S8 pide bajarlo a ~1 s, [[Taller de decisiones]]).

## Consumo

`AccountingHoldKafkaListener` e `InventoryItemKafkaListener` (solo con `market.messaging.transport=kafka`) usan `SagaEventParser`. El primero descarta los comandos propios y los eventos no consumidos antes de parsear (ver "Tópico compartido y filtro de eventos"). La tabla `processed_events` evita reprocesar un `eventId` en la misma transacción ([[Entrega at-least-once y deduplicación]]).

## Fallos

`KafkaConfig` de Mercado: 2 reintentos con 1 segundo de espera y luego tópico `<topic>.DLT`; `MalformedEventException` va directo a DLT. El nombre `<topic>.DLT` lo fija el PR #89 con un resolvedor explícito (`configs/KafkaConfig.java`); antes regía el sufijo `-dlt` de spring-kafka. Accounting: 3 reintentos de 2 s y luego DLT. Si accounting falla al acreditar un item no publica ningún evento de falla.

## Relacionado
[[Integración con Accounting]], [[Integración con Notificaciones]], [[Saga]].
