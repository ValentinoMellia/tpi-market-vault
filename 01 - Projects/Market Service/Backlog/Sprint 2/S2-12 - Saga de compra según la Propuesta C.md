---
tipo: historia
estado: borrador
verificado_contra: codigo@6926af1d
actualizado: 2026-10-09
tags: [mercado, backlog, sprint-2, saga, accounting]
sprint: 2
taiga: "#7697"
puntos: 13
prioridad: Must
horas: 36
---
# S2-12 - Saga de compra según la Propuesta C

> Implementar en Mercado la [[Propuesta C de la saga de compra]], el resultado de [[S2-09b - SPIKE Orden de la compra con Accounting]]: retener las monedas, acreditar el ítem y recién después confirmar el débito, con un rollback completo (ítem, monedas y stock) si la orden no se confirma antes de un plazo atado al vencimiento del hold. Reemplaza el orden A (`ITEM_PROVISION_*`) por los mensajes reales de Accounting. 7 tareas, 36 h, 13 puntos, Must. Las tareas 4 y 5 dependen de que Accounting publique `ITEM_CREDIT_FAILED` e `ITEM_REVOKE_REQUESTED`; hasta entonces se prueban con el transporte `mock`.

## [G11] — Saga de compra según la Propuesta C

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante que compra un ítem en la tienda de mi curso
- **Quiero**: que nunca se me cobre un ítem que no recibí y que, si la compra falla a mitad de camino, se deshaga entera
- **Para**: confiar en que mis monedas y mi inventario quedan siempre consistentes con el resultado de la compra

---

## Notas / Observaciones

- [ ] Reglas de negocio: el orden de la compra directa pasa a ser C ([[Propuesta C de la saga de compra]], [[Q-008 - Orden de la saga de compra]]): `HOLD_CREATE_REQUESTED` → `HOLD_CREATED` → `ITEM_CONFIRMED` (en `market.events`) → `ITEM_CREDITED` → `HOLD_CONFIRM_REQUESTED` → `HOLD_CONFIRMED` → orden `CONFIRMED`. Desaparecen `ITEM_PROVISION_*`. La compra de vidas no cambia (`HOLD_CONFIRMED` y luego `LIFE_PURCHASE_CONFIRMED`, [[S2-11 - Acuerdos de compra de vidas con Accounting]]).
- [ ] Reglas de negocio (plazo): plazo de confirmación = `holdExpiresAt` − margen (propiedad configurable, por defecto 60 s). Si `ITEM_CREDITED` llega antes del plazo se envía `HOLD_CONFIRM_REQUESTED`; si llega después, o no llega, o `HOLD_CONFIRM_REQUESTED` es rechazado, se hace el rollback completo: `ITEM_REVOKE_REQUESTED` (por `orderId`), `HOLD_RELEASE_REQUESTED` (motivo `PURCHASE_NOT_COMPLETED`), liberar la reserva de stock y orden `CANCELLED`.
- [ ] Reglas de negocio (fallos): `ITEM_CREDIT_FAILED` cancela la orden, libera el hold y el stock (caso 3). `ITEM_CREDITED` y `HOLD_CONFIRMED` que llegan a una orden terminal se ignoran y se registran en el log.
- [ ] Validaciones: `ITEM_CREDITED` se correlaciona por `sourceReferenceId` = `orderRef` (UUID) y se deduplica por ese valor, porque no trae `correlationId` ([[Idempotencia]]). Las transiciones nuevas respetan la tabla de `OrderStatus`.
- [ ] Datos obligatorios: `orderRef` UUID, `holdId`, `holdExpiresAt` en UTC, `stockReservationId`; motivo de cancelación del rollback (`cancellationReason`).
- [ ] Performance (tiempos, volumen, límites): acreditar y confirmar deben terminar dentro de los 300 s del TTL de `DIRECT_PURCHASE`. El job del plazo procesa lotes acotados y corre con una periodicidad menor que el margen.
- [ ] Seguridad (roles, permisos, datos sensibles): sin cambios de roles; los eventos no llevan datos personales más allá de `studentId`.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: se mantienen los nombres de estados para no migrar el `CHECK` del enum en PostgreSQL (`ddl-auto=update` no lo amplía): `ITEM_PROVISION_REQUESTED` pasa a significar "esperando `ITEM_CREDITED`" e `ITEM_PROVISIONED`, "acreditado, esperando `HOLD_CONFIRMED`". Si el rollback necesita un `cancellationReason` nuevo, verificar si la columna tiene `CHECK` y migrarla. Pendiente de confirmar con Accounting: el margen, el bloqueo de acreditaciones tardías y qué hacer con un ítem ya usado al revocar.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: en una compra directa exitosa, Mercado publica `ITEM_CONFIRMED` solo después de recibir `HOLD_CREATED`, y `HOLD_CONFIRM_REQUESTED` solo después de recibir `ITEM_CREDITED` de esa orden; ningún mensaje `ITEM_PROVISION_*` se publica.
- [ ] **CA2**: `market.events.item-confirmed.enabled` queda en `true` en todos los perfiles y `ITEM_CONFIRMED` lleva `orderId` = `orderRef` UUID.
- [ ] **CA3**: si `ITEM_CREDITED` no llega antes de `holdExpiresAt` − margen, la orden queda `CANCELLED`, se publican `ITEM_REVOKE_REQUESTED` y `HOLD_RELEASE_REQUESTED` y la reserva de stock se libera.
- [ ] **CA4**: si `HOLD_CONFIRM_REQUESTED` es rechazado (hold vencido o liberado), se aplica el mismo rollback completo de CA3.
- [ ] **CA5**: `ITEM_CREDIT_FAILED` cancela la orden con `HOLD_RELEASE_REQUESTED` y libera el stock, sin publicar `ITEM_REVOKE_REQUESTED`.
- [ ] **CA6**: un `ITEM_CREDITED` duplicado o tardío (orden terminal) no cambia el estado de la orden ni publica mensajes.
- [ ] **Extras (opcional)**: la cantidad de rollbacks por plazo se puede consultar como métrica en `/actuator/prometheus`.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra directa con el orden acreditar y luego confirmar

**Escenario 1**  

- **Dado**: una orden en `HOLD_GRANTED` con `holdExpiresAt` dentro de 300 s
- **Cuando**: Mercado publica `ITEM_CONFIRMED` y Accounting responde `ITEM_CREDITED` antes del plazo
- **Entonces**: Mercado publica `HOLD_CONFIRM_REQUESTED`, y al recibir `HOLD_CONFIRMED` la orden queda `CONFIRMED`

**Escenario 2**  

- **Dado**: una orden que publicó `ITEM_CONFIRMED` y no recibió `ITEM_CREDITED`
- **Cuando**: se alcanza `holdExpiresAt` − margen
- **Entonces**: Mercado publica `ITEM_REVOKE_REQUESTED` y `HOLD_RELEASE_REQUESTED`, libera el stock y la orden queda `CANCELLED`

**Escenario 3**  

- **Dado**: una orden acreditada que envió `HOLD_CONFIRM_REQUESTED`
- **Cuando**: Accounting rechaza la confirmación porque el hold venció
- **Entonces**: Mercado aplica el rollback completo y la orden queda `CANCELLED`

**Escenario 4**  

- **Dado**: una orden ya `CANCELLED` por plazo
- **Cuando**: llega un `ITEM_CREDITED` tardío con su `sourceReferenceId`
- **Entonces**: la orden no cambia y no se publica ningún mensaje nuevo

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders`, `GET /api/market/orders/{orderId}`; eventos en `accounting.events` y `market.events`

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

- Servicios involucrados: Mercado y Accounting.
- Módulos afectados: `services/impl/OrderConfirmationServiceImpl.java`, `OrderHoldServiceImpl.java`, `OrderItemProvisionServiceImpl.java`, `listeners/AccountingHoldEventHandler.java`, `listeners/InventoryItemEventHandler.java`, `clients/impl/OutboxInventoryItemProvisionClient.java`, `clients/impl/OutboxBankHoldClient.java`, `configs/OrderConfirmationPublishSettings.java`, `models/enums/OrderStatus.java`, `models/enums/OrderCancellationReason.java`, `entities/OrderEntity.java`.
- Otros equipos / aprobaciones: Accounting debe publicar `ITEM_CREDIT_FAILED` e `ITEM_REVOKE_REQUESTED` (con `ITEM_REVOKED` / `ITEM_REVOKE_FAILED`, idempotente y bloqueando acreditaciones tardías), y acordar el margen ([[Integración con Accounting]]).
- Impacto en datos / migraciones: sin estados nuevos de orden; posible valor nuevo de `cancellationReason` (verificar `CHECK`).
- Riesgos y mitigación (opcional): si Accounting no implementa la revocación, el rollback por plazo no puede quitar el ítem; mitigación: dejar las tareas 4 y 5 detrás de un flag y reabrir `PURCHASE_SETTLEMENT_REQUESTED` ([[Ideas descartadas]]). Se solapa con [[S2-01 - Contrato con Accounting]] (tareas 5 y 6: publicar `ITEM_CONFIRMED` y consumir `ITEM_CREDITED`) y con [[S2-07 - Pruebas integradas con Accounting]]; ordenar los merges.

Relación: [[Propuesta C de la saga de compra]], [[Q-008 - Orden de la saga de compra]], [[Orden de compra]], [[Saga]], [[DEC-004 - Máquina de estados de la orden según el código]], [[Épica 137 - Compra directa]].

---

## Tareas

### T01 - Reordenar la saga: ITEM_CONFIRMED después de HOLD_CREATED

**Objetivo:** Reemplazar el orden A por el C en el paso de entrega.

- Al recibir `HOLD_CREATED`, publicar `ITEM_CONFIRMED` en `market.events` en lugar de `ITEM_PROVISION_REQUESTED`
- Retirar `OutboxInventoryItemProvisionClient` y los mensajes `ITEM_PROVISION_*` del flujo de compra directa
- Encender `market.events.item-confirmed.enabled` y quitar el flag de `OrderConfirmationPublishSettings` si queda sin uso
- Hecho cuando: una compra con transporte `mock` publica `ITEM_CONFIRMED` tras `HOLD_CREATED` y ningún `ITEM_PROVISION_*`

Estimación: 6 h

### T02 - Confirmar el débito al recibir ITEM_CREDITED

**Objetivo:** Enviar `HOLD_CONFIRM_REQUESTED` solo con el ítem acreditado.

- Consumir `ITEM_CREDITED` y correlacionar por `sourceReferenceId` = `orderRef`
- Deduplicar por `sourceReferenceId`; ignorar si la orden está en un estado terminal
- Pasar la orden a `ITEM_PROVISIONED` y publicar `HOLD_CONFIRM_REQUESTED`
- Hecho cuando: `ITEM_CREDITED` dispara una única confirmación y un duplicado no publica nada

Estimación: 5 h

### T03 - Plazo de confirmación atado al vencimiento del hold

**Objetivo:** Detectar órdenes que no se confirmaron a tiempo.

- Propiedad del margen (por defecto 60 s) y cálculo `holdExpiresAt` − margen en UTC
- Job periódico que busca órdenes en `ITEM_PROVISION_REQUESTED` o `ITEM_PROVISIONED` con el plazo vencido, en lotes acotados
- No enviar `HOLD_CONFIRM_REQUESTED` si `ITEM_CREDITED` llega después del plazo
- Hecho cuando: una orden con el plazo vencido es detectada y entregada al rollback

Estimación: 5 h

### T04 - Rollback completo de la compra

**Objetivo:** Deshacer ítem, monedas y stock cuando la orden no se confirma.

- Publicar `ITEM_REVOKE_REQUESTED` por `orderId` y `HOLD_RELEASE_REQUESTED` con `PURCHASE_NOT_COMPLETED`
- Liberar la reserva de stock y pasar la orden a `CANCELLED` con su motivo
- Aplicar el mismo rollback cuando `HOLD_CONFIRM_REQUESTED` es rechazado
- Hecho cuando: los casos 4 y 5 de la propuesta terminan con orden `CANCELLED`, revocación, liberación del hold y stock liberado

Estimación: 6 h

### T05 - Consumir ITEM_CREDIT_FAILED y las respuestas de revocación

**Objetivo:** Cerrar los fallos que hoy son silenciosos.

- `ITEM_CREDIT_FAILED`: orden `CANCELLED`, `HOLD_RELEASE_REQUESTED` y stock liberado, sin revocación
- `ITEM_REVOKED`, "nada que revocar" e `ITEM_REVOKE_FAILED`: registrar el resultado; el fallo queda marcado para revisión de un ADMIN
- Simular los mensajes nuevos en el transporte `mock` hasta que Accounting los publique
- Hecho cuando: el caso 3 cancela la orden y las respuestas de revocación quedan registradas

Estimación: 5 h

### T06 - Probar la saga C de punta a punta

**Objetivo:** Cubrir el flujo feliz y los cinco casos de fallo.

- Pruebas de servicio para el flujo feliz y los casos 1 a 5 de la propuesta
- Mensajes tardíos y duplicados sobre órdenes terminales
- Ajustar `KafkaSagaIntegrationTest` al orden nuevo
- Hecho cuando: todas las pruebas pasan en verde con el transporte `mock` y con Kafka

Estimación: 6 h

### T07 - Registrar la decisión y actualizar la documentación

**Objetivo:** Dejar el orden C como decisión vigente.

- `DEC-NNN` que cierre [[Q-008 - Orden de la saga de compra]] con lo acordado con Accounting
- Actualizar [[Orden de compra]], [[Saga]] e [[Integración con Accounting]] con el diagrama nuevo
- Actualizar el contrato asíncrono publicado de Mercado con `ITEM_CONFIRMED` y los mensajes nuevos
- Hecho cuando: la DEC está en el índice de decisiones y las notas reflejan el orden C

Estimación: 3 h
