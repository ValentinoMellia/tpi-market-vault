---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: ""
puntos: 13
prioridad: Must
horas: 45
---
# S2-01 - Contrato con Accounting

> Alinear Mercado con el contrato real de Accounting (tópicos, `orderId` UUID, productor, `ITEM_CONFIRMED` e `ITEM_CREDITED`, motivos de rechazo y de liberación). Es la historia bloqueante del sprint: hoy Accounting rechazaría todo `HOLD_CREATE_REQUESTED` con `MALFORMED_COMMAND`. 8 tareas, 45 h, 13 puntos, Must.

## [G11] — Contrato con Accounting

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante inscripto en un curso
- **Quiero**: que mi compra se cobre y se me entregue el ítem mediante el servicio real de Accounting
- **Para**: que mis monedas se retengan y se debiten una sola vez y que el ítem aparezca en mi inventario

---

## Notas / Observaciones

- [ ] Reglas de negocio: Mercado adopta el contrato de Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]]). `orderId` es un UUID canónico generado por Mercado y persistido como `orderRef`; hay un hold por `orderId` para siempre. Tópicos `accounting.events` (holds e `ITEM_CREDITED`) y `market.events` (`ITEM_CONFIRMED`), productor `market-service` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Motivos de liberación: `AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`.
- [ ] Validaciones: `ITEM_CONFIRMED` lleva `studentId`, `courseId`, `orderId`, `catalogItemId`, `itemName`, `itemType`, `effect`. `ITEM_CREDITED` no trae `correlationId`: se asocia con la orden por `sourceReferenceId` (= `orderId`). Hoy `ItemConfirmedPayloadDto` usa `Long orderId` y debe pasar a UUID.
- [ ] Datos obligatorios: `orderRef` (UUID, único, no nulo en órdenes nuevas), `eventId` UUID, `eventVersion` 1, `producer` `market-service`.
- [ ] Performance (tiempos, volumen, límites): Accounting fija el TTL del hold en 300 s para `DIRECT_PURCHASE`; Mercado no envía `ttlSeconds`. El relay del [[Patrón Outbox]] publica en lotes de 20.
- [ ] Seguridad (roles, permisos, datos sensibles): sin cambios de roles. Los eventos no llevan datos personales más allá de `studentId`.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: el **orden de la compra** (`ITEM_CONFIRMED` antes o después de `HOLD_CONFIRM_REQUESTED`) sigue abierto en [[Q-008 - Orden de la saga de compra]]. Esta historia implementa los mensajes, pero deja `market.events.item-confirmed.enabled=false` hasta que el spike [[S2-09b - SPIKE Orden de la compra con Accounting]] cierre el orden. El manejo del tope de vidas queda fuera: está bloqueado hasta acordar la señal con Accounting ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]).

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: todo `HOLD_CREATE_REQUESTED` publicado en `accounting.events` lleva `payload.orderId` con formato UUID canónico, igual al `orderRef` persistido de la orden, y `payload.orderType = DIRECT_PURCHASE`.
- [ ] **CA2**: el 100 % de los mensajes publicados por Mercado (holds, `ITEM_CONFIRMED`, `PURCHASE_CONFIRMED`) tienen `producer = market-service`; no queda ninguna aparición de `tema-09-mercado` en el código.
- [ ] **CA3**: con `accounting.events` configurado para comandos y respuestas, el listener descarta los comandos propios (`HOLD_CREATE_REQUESTED`, `HOLD_INCREASE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`) con 0 mensajes enviados a DLT y 0 excepciones.
- [ ] **CA4**: ante `HOLD_REJECTED` con cada uno de los 10 motivos del contrato (`ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INSUFFICIENT_BALANCE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND`), solo `INSUFFICIENT_BALANCE` termina en `REJECTED_INSUFFICIENT_FUNDS`; los otros nueve quedan registrados con su motivo propio.
- [ ] **CA5**: con el flag de `ITEM_CONFIRMED` activo, una compra de punta a punta publica `ITEM_CONFIRMED` en `market.events` y procesa `ITEM_CREDITED` con `sourceReferenceId` igual al `orderRef`, con una prueba automatizada en verde.
- [ ] **Extras (opcional)**: `HOLD_RELEASE_REQUESTED` usa un enum con los tres motivos y las pruebas cubren `PURCHASE_NOT_COMPLETED` en cancelación y vencimiento.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra directa con el contrato de Accounting

**Escenario 1**  

- **Dado**: una oferta activa con stock y un estudiante inscripto, y una orden nueva con `orderRef` generado
- **Cuando**: el estudiante llama a `POST /api/market/courses/{courseId}/orders` con `{offerId, idempotencyKey}`
- **Entonces**: responde 202 con `status: "PROCESSING"` y Mercado publica en `accounting.events` un `HOLD_CREATE_REQUESTED` con `producer: "market-service"`, `payload.orderId` igual al `orderRef` (UUID), `orderType: "DIRECT_PURCHASE"` y sin `ttlSeconds`

**Escenario 2**  

- **Dado**: `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_EVENTS` apuntan ambos a `accounting.events`
- **Cuando**: el listener recibe un mensaje `HOLD_CREATE_REQUESTED` cuyo `producer` es `market-service`
- **Entonces**: lo descarta sin enviarlo a DLT, no lanza excepción y la orden no cambia de estado

**Escenario 3**  

- **Dado**: una orden en `HOLD_REQUESTED` y Accounting responde `HOLD_REJECTED` con `reason: "ACCOUNT_INACTIVE"`
- **Cuando**: Mercado procesa la respuesta (`correlationId` igual al `eventId` del comando)
- **Entonces**: la orden queda rechazada con el motivo `ACCOUNT_INACTIVE` (no como `REJECTED_INSUFFICIENT_FUNDS`), se libera el stock reservado y el estado se informa por `GET /api/market/orders/{orderId}`

**Escenario 4**  

- **Dado**: el flag `market.events.item-confirmed.enabled=true` y una orden con hold concedido
- **Cuando**: Mercado publica `ITEM_CONFIRMED` en `market.events` y Accounting responde `ITEM_CREDITED` en `accounting.events` con `sourceReferenceId` igual al `orderRef`
- **Entonces**: Mercado asocia el mensaje con la orden por `sourceReferenceId`, ignora un reenvío con el mismo `eventId` (tabla `processed_events`) y la orden llega a `CONFIRMED`

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders`, `GET /api/market/orders/{orderId}`, `GET /api/market/orders/stream/{orderId}`; eventos `HOLD_CREATE_REQUESTED`, `HOLD_CREATED`, `HOLD_REJECTED`, `ITEM_CONFIRMED`, `ITEM_CREDITED` (detalle de campos en [[Integración con Accounting]])

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 13
- **Prioridad (MoSCoW / Numérica)**: Must

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|13|Must|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y Accounting (Tema 08, grupo G12 en Taiga); Kafka de la plataforma.
- Módulos afectados: `clients/impl/OutboxBankHoldClient.java`, `OutboxInventoryItemProvisionClient.java`, `listeners/AccountingHoldKafkaListener.java`, `configs/MessagingProperties.java`, `entities/OrderEntity.java`, `dtos/events/ItemConfirmedPayloadDto.java`, `models/enums/OrderRejectionReason.java`, `application.properties`.
- Otros equipos / aprobaciones: Accounting debe encender su listener de comandos (apagado por defecto en su configuración) y confirmar el orden de la compra ([[Q-008 - Orden de la saga de compra]]). Qué ve el estudiante ante cada motivo de rechazo lo define producto ([[DEC-009 - Contrato de holds e ítems según Accounting]]).
- Impacto en datos / migraciones: columna nueva `orderRef` en la tabla de órdenes. No hay Flyway: el esquema lo actualiza Hibernate (`ddl-auto=update` en docker y prod), por lo que la columna debe admitir nulos en las filas existentes.
- Riesgos y mitigación (opcional): si Accounting no acepta el orden de compra, cambia la activación de `ITEM_CONFIRMED`; mitigación: flag apagado y spike previo. Los mensajes `ITEM_PROVISION_*` desaparecen: hay que actualizar el transporte `mock` (`LoopbackDispatcher`) y sus pruebas.

Relación: [[Integración con Accounting]], [[Estado actual del código]] (gaps 6, 22 y 23), [[Roadmap de trabajo]] (P0 1, 1b y 1c), [[Eventos y Kafka]], [[Entrega at-least-once y deduplicación]].

---

## Tareas

| # | Tarea | Horas | Descripción breve |
|---|---|---|---|
| 1 | `orderRef` UUID persistido | 6 | Columna `orderRef` en `OrderEntity` generada al crear la orden y usada como `orderId` en `HOLD_CREATE_REQUESTED`; el `orderId` público de la API no cambia |
| 2 | Tópicos por variable de entorno | 3 | Valores por defecto `accounting.events` y `market.events` en `market.messaging.topics.*` (`application.properties:38-42`) y actualización de `.compose/.env.example` |
| 3 | Ignorar comandos propios en `accounting.events` | 6 | Descartar en el listener los comandos con `producer` `market-service` sin DLT y enrutar por `eventType` en el tópico compartido; prueba con un único tópico |
| 4 | Productor `market-service` | 3 | Reemplazar `tema-09-mercado` en `MessagingProperties` y verificar el `producer` de todos los mensajes salientes |
| 5 | Publicar `ITEM_CONFIRMED` | 8 | Payload con `orderId` UUID y los siete campos del contrato en `market.events`; reemplaza a `ITEM_PROVISION_*` y respeta el flag `market.events.item-confirmed.enabled` |
| 6 | Consumir `ITEM_CREDITED` | 8 | Handler que asocia por `sourceReferenceId`, deduplica por `eventId` y hace avanzar la orden; ajusta el transporte `mock` |
| 7 | Mapear motivos de rechazo | 6 | Ampliar `OrderRejectionReason` con los 9 motivos faltantes y corregir `applyRejection` (`OrderHoldServiceImpl`); texto al estudiante provisional hasta definir con producto |
| 8 | Motivos de liberación | 5 | Enum `releaseReason` con `AUCTION_LOST`, `AUCTION_CANCELLED` y `PURCHASE_NOT_COMPLETED`; la compra usa el último en cancelación y vencimiento |
