---
tipo: historia
estado: vigente
verificado_contra: accounting@chat-2026-10-02
actualizado: 2026-10-02
tags: [mercado, backlog, sprint-2, vidas, accounting]
sprint: 2
taiga: "#5899"
puntos: 5
prioridad: Must
horas: 16
---
# S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED

> Refactorización de la compra de vidas para emitir `LIFE_PURCHASE_CONFIRMED` en `market.events` una vez confirmada la orden y debitadas las monedas en Accounting. Reemplaza para vidas el uso de `ITEM_CONFIRMED` e integra el contrato acordado con Accounting. 4 tareas, 16 h, 5 puntos, Must.

## [G11] — Compra de vidas: emisión de LIFE_PURCHASE_CONFIRMED

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante inscripto en un curso
- **Quiero**: que al comprar una oferta de vidas en el Mercado, se emita el evento `LIFE_PURCHASE_CONFIRMED` hacia Accounting tras debitarse mis monedas
- **Para**: que Accounting acredite mis vidas en el contador correspondiente según las reglas de la plataforma

---

## Notas / Observaciones

- [ ] Reglas de negocio: Al confirmar la compra de una vida (después de confirmarse el hold de monedas en Accounting), Mercado publica una única vez por orden el evento `LIFE_PURCHASE_CONFIRMED` en el tópico `market.events` ([[Eventos y Kafka]], contratos-kafka v5). Key de particionado: `studentId`. Accounting aplica su regla de tope y acredita las vidas correspondientes informando el resultado con `LIFE_CREDITED` en `accounting.events`.
- [ ] Validaciones: Los cuatro campos del payload (`studentId`, `courseId`, `orderId`, `quantity`) son obligatorios. `quantity` debe ser un entero mayor o igual a 1. Mensajes inválidos son derivados a `market.events.DLT`.
- [ ] Datos obligatorios: `eventId` (UUID nuevo, preservado en reenvíos), `eventType` (`LIFE_PURCHASE_CONFIRMED`), `eventVersion` (1), `timestamp` (ISO-8601 UTC), `producer` (`market-service`), `payload` (`{studentId, courseId, orderId, quantity}`).
- [ ] Performance (tiempos, volumen, límites): Emisión a través de la tabla transaccional `outbox_events` ([[Patrón Outbox]]), garantizando atomicidad con la transición de la orden a `CONFIRMED` y reintentos idempotentes preservando el `eventId` ([[Entrega at-least-once y deduplicación]]).
- [ ] Seguridad (roles, permisos, datos sensibles): El evento contiene identificadores públicos de negocio (`studentId`, `courseId`, `orderId`). No expone datos personales sensibles.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (evento asíncrono de backend).
- [ ] Otros: Para las compras de vidas no se emite `ITEM_CONFIRMED` (que queda reservado para ítems del catálogo). Se desvincula la compra de vidas del flujo de aprovisionamiento de ítems.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: Al confirmarse el hold y debitarse las monedas de una orden cuyo `item_type` es `LIFE`, Mercado publica el evento `LIFE_PURCHASE_CONFIRMED` en el tópico `market.events` con el sobre estándar contratos-kafka v5 (6 campos en orden: `eventId` UUID, `eventType` `LIFE_PURCHASE_CONFIRMED`, `eventVersion` 1, `timestamp` ISO-8601 UTC, `producer` `market-service`, `payload`).
- [ ] **CA2**: El payload del evento contiene obligatoriamente `studentId`, `courseId`, `orderId` y `quantity` (entero >= 1).
- [ ] **CA3**: El mensaje en Kafka se particiona utilizando `studentId` como clave (message key).
- [ ] **CA4**: Ante reenvíos del mensaje por reintentos de la outbox, se mantiene el mismo `eventId` para permitir la deduplicación en el consumidor (Accounting).
- [ ] **CA5**: En la compra de vidas no se emite el evento `ITEM_CONFIRMED`.

---

## BDD (mínimo 3 escenarios)

**Característica:** Emisión de LIFE_PURCHASE_CONFIRMED en la compra de vidas

**Escenario 1**  

- **Dado**: una orden de compra para una oferta de tipo `LIFE` en estado `ITEM_PROVISIONED` con hold creado
- **Cuando**: Accounting confirma el hold exitosamente (`HOLD_CONFIRMED`)
- **Entonces**: la orden transiciona a `CONFIRMED` y se persiste un registro en la outbox para publicar `LIFE_PURCHASE_CONFIRMED` en `market.events` con `producer: "market-service"`, key `studentId` y el payload con `studentId`, `courseId`, `orderId` y `quantity >= 1`

**Escenario 2**  

- **Dado**: un evento `LIFE_PURCHASE_CONFIRMED` persistido en la outbox
- **Cuando**: el relay de outbox experimenta un fallo temporal de envío a Kafka y reintenta en el siguiente ciclo
- **Entonces**: se reenvía el mensaje a `market.events` conservando exactamente el mismo `eventId` original

**Escenario 3**  

- **Dado**: una orden de compra para una oferta de ítem que NO es de tipo `LIFE` (ej. `SHIELD`)
- **Cuando**: Accounting confirma el hold
- **Entonces**: no se emite `LIFE_PURCHASE_CONFIRMED`, sino que se mantiene el flujo de ítems

---

## Prototipo

- **Mock API / Swagger**: N/A (Evento asíncrono Kafka / Outbox)

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 5
- **Prioridad (MoSCoW / Numérica)**: Must

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|5|Must|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado (`market-service`) y Accounting (`accounting-service`) ([[Integración con Accounting]]).
- Módulos afectados: `OrderConfirmationServiceImpl`, `LifePurchaseConfirmedPayloadDto`, `MessagingProperties`, `application.properties`.
- Otros equipos / aprobaciones: Acordado con Accounting (Tema 08, grupo G12 en Taiga) para recepción de `LIFE_PURCHASE_CONFIRMED` en `market.events` y posterior emisión de `LIFE_CREDITED` en `accounting.events`.
- Impacto en datos / migraciones: No requiere cambios en esquema de base de datos relacional.
- Riesgos y mitigación (opcional): Garantizar que reenvíos mantengan `eventId` idéntico para evitar duplicación de acreditación en Accounting.

Relación: [[Integración con Accounting]], [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[Eventos y Kafka]], [[Entrega at-least-once y deduplicación]], [[Sprint 2 - Índice]].

---

## Tareas

### T01 - Implementar LifePurchaseConfirmedPayloadDto y contrato de evento (#5900)

**Objetivo:** Crear el DTO `LifePurchaseConfirmedPayloadDto` con validaciones de obligatoriedad en sus 4 campos (`studentId`, `courseId`, `orderId`, `quantity >= 1`) y orden canónico de campos de contratos-kafka v5.

- DTO inmutable record con validaciones fail-fast en constructor compacto
- Implementar `OrderScopedPayload` para resolución de aggregate id en outbox
- Hecho cuando: tests unitarios verifican validación de campos obligatorios y serialización JSON exacta

Estimación: 4 h · Asignado a: Tomas Kimmel Battaglia

### T02 - Configurar tópico market.events para eventos de Mercado (#5901)

**Objetivo:** Configurar el tópico `market.events` en `MessagingProperties` y `application.properties` con override por variable de entorno `MARKET_MESSAGING_TOPIC_MARKET_EVENTS`.

- Nueva propiedad `marketEvents` en `MessagingProperties.Topics` con valor por defecto `market.events`
- Configuración en `application.properties` con variable de entorno correspondiente
- Hecho cuando: el tópico es configurable y accesible vía propiedades de mensajería

Estimación: 2 h · Asignado a: Tomas Kimmel Battaglia

### T03 - Emitir LIFE_PURCHASE_CONFIRMED al confirmar compra de vidas (#5902)

**Objetivo:** Refactorizar `OrderConfirmationServiceImpl` para que al confirmar la orden de una oferta con `itemType == LIFE`, publique `LIFE_PURCHASE_CONFIRMED` en `market.events` tras confirmar el hold y debitar monedas, usando `studentId` como clave de mensaje.

- Detección de `itemType == LIFE` en `applyConfirmResult`
- Publicación atómica mediante outbox en la misma transacción de transición a `CONFIRMED`
- Supresión de `ITEM_CONFIRMED` para compras de vidas
- Hecho cuando: una compra de vida confirmada genera la fila outbox con tópico `market.events` y sobre contratos-kafka v5

Estimación: 6 h · Asignado a: Tomas Kimmel Battaglia

### T04 - Pruebas unitarias e integración de la compra de vidas (#5903)

**Objetivo:** Diseñar y ejecutar suite de tests unitarios y de integración para la emisión de `LIFE_PURCHASE_CONFIRMED`, validación de campos, deduplicación en outbox por `eventId` y no emisión de `ITEM_CONFIRMED` para vidas.

- Tests unitarios en `OrderConfirmationServiceImplTest`
- Tests de DTO y Envelope
- Pruebas de integración de outbox y relay
- Hecho cuando: `mvn clean verify` pasa en verde con 100% de tests aprobados

Estimación: 4 h · Asignado a: Tomas Kimmel Battaglia
