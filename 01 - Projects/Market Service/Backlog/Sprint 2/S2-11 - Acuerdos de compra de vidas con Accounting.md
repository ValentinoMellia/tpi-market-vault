---
tipo: historia
estado: vigente
verificado_contra: codigo@74e671ef
actualizado: 2026-10-06
tags: [mercado, backlog, sprint-2, vidas, accounting]
sprint: 2
taiga: "#6268"
puntos: a completar
prioridad: Must
horas: 20
---
# S2-11 - Acuerdos de compra de vidas con Accounting

> Implementa los acuerdos del 2026-10-04 con Accounting para comprar vidas sin cobrar de más: Mercado valida el tope (PAR-12) antes del hold, usa el mismo `orderId` UUID en el hold y en `LIFE_PURCHASE_CONFIRMED`, y marca como cobrada sin acreditar la orden que Accounting rechaza con `LIFE_PURCHASE_REJECTED`. 5 tareas, 20 h, Must.

## [G11] — Acuerdos de compra de vidas con Accounting (#6268)

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante inscripto en un curso
- **Quiero**: que el Mercado no me deje comprar vidas que no me van a acreditar, y que si me cobran sin acreditar quede registrado
- **Para**: no perder monedas por una compra que no me sirve, y que un administrador pueda devolvérmelas

---

## Notas / Observaciones

- [ ] Reglas de negocio: el acuerdo fija el cupo en `max(0, maxLives − currentLives)`. Mercado además suma las vidas de sus propias órdenes de vidas todavía en vuelo (`CREATED`, `HOLD_REQUESTED`, `HOLD_GRANTED`, `ITEM_PROVISION_REQUESTED` e `ITEM_PROVISIONED`), que Accounting aún no acreditó: el cupo real es `max(0, maxLives − (currentLives + livesInFlight))` (`PurchaseValidationServiceImpl.validateLifeCap`, `OrderRepository.sumLivesInFlight`). Así, dos compras de vidas seguidas se frenan aunque Accounting no haya acreditado la primera. `currentLives` sale de `equip-summary` de Accounting; `reservedLives` se lee pero no entra en la cuenta. `maxLives` es PAR-12 ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], enmienda del 2026-10-04).
- [ ] Validaciones: la validación es previa al hold y preventiva; Accounting igual recorta al acreditar. `orderId`, `studentId` y `courseId` de hasta 36 caracteres (si alguno se pasa, la compra responde 400); `quantity` entero `>= 1`.
- [ ] Datos obligatorios: `LIFE_PURCHASE_CONFIRMED {studentId, courseId, orderId, quantity}` con el mismo `orderId` y `courseId` que el `HOLD_CREATE_REQUESTED` de la orden.
- [ ] Performance (tiempos, volumen, límites): una consulta REST a Accounting por compra de vidas, con timeouts acotados (conexión 2 s, lectura 3 s).
- [ ] Seguridad (roles, permisos, datos sensibles): la consulta a Accounting va por el Gateway con token de servicio (rol `MS`); el token no se registra en logs.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: la devolución de una compra cobrada sin acreditar no es automática; la pide un ADMIN desde BackOffice (`COIN_LEDGER_REVERSAL_REQUESTED`).

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: con el alumno en el tope, `POST /api/market/courses/{courseId}/orders` de una oferta `LIFE` responde 422 con `type` `.../life-cap-reached` y `error` `LIFE_CAP_REACHED`, sin crear la orden ni el hold.
- [ ] **CA2**: si Accounting no responde, la compra de vidas responde 503 `accounting-service-unavailable` y no crea la orden.
- [ ] **CA3**: `HOLD_CREATE_REQUESTED` y `LIFE_PURCHASE_CONFIRMED` de una orden llevan el mismo `orderId` UUID (≤ 36 caracteres) y el mismo `courseId`.
- [ ] **CA4**: al recibir `LIFE_PURCHASE_REJECTED` (`ACCOUNT_NOT_FOUND` o `ACCOUNT_INACTIVE`), la orden queda `SETTLED_UNCREDITED`, se registra una alerta de auditoría y un reenvío con el mismo `eventId` no se procesa otra vez.
- [ ] **CA5**: `LIFE_PURCHASE_CONFIRMED` se emite solo después de `HOLD_CONFIRMED`, nunca tras `HOLD_RELEASED` o `HOLD_REJECTED`.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra de vidas acordada con Accounting

**Escenario 1**

- **Dado**: un estudiante que ya tiene el máximo de vidas del curso
- **Cuando**: compra una oferta de vidas
- **Entonces**: Mercado responde 422 `LIFE_CAP_REACHED` con el mensaje "Ya alcanzaste el máximo de vidas permitido en este curso. No se te cobró nada." y no crea la orden ni el hold. Si todavía entran algunas vidas pero menos de las que otorga la oferta, el 422 explica cuántas: "Esta oferta otorga N vidas y solo podés sumar M más sin superar el máximo de X. No se te cobró nada."

**Escenario 2**

- **Dado**: un estudiante con cupo para la cantidad de vidas de la oferta
- **Cuando**: compra la oferta y Accounting confirma el hold
- **Entonces**: la orden pasa a `CONFIRMED` y se publica `LIFE_PURCHASE_CONFIRMED` con el mismo `orderId` y `courseId` que el hold

**Escenario 3**

- **Dado**: una compra de vidas confirmada y cobrada
- **Cuando**: Accounting publica `LIFE_PURCHASE_REJECTED` con `ACCOUNT_INACTIVE` (incluso dos veces con el mismo `eventId`)
- **Entonces**: la orden queda `SETTLED_UNCREDITED` una sola vez, con alerta de auditoría para que un ADMIN pida la reversión del débito

---

## Prototipo

- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders` documenta las respuestas 422 y 503 nuevas.

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: a completar
- **Prioridad (MoSCoW / Numérica)**: Must

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y Accounting ([[Integración con Accounting]]); PAR-12 es de Backoffice ([[Integración con Backoffice]]).
- Componentes afectados: `AccountingEquipSummaryClient` (y su mock), `LifeCapProperties`, `PurchaseValidationService`, `PurchaseOrderServiceImpl`, `GlobalExceptionHandler`, `ExternalId`, `OrderRepository.sumLivesInFlight`, `LifePurchaseConfirmedPayloadDto`, `AccountingHoldKafkaListener`, `AccountingLifePurchaseEventHandler`, `LifePurchaseRejectionService`, `OrderEntity`.
- Impacto en datos / migraciones: columnas nuevas y anulables `settlement_mark` y `uncredited_reason` en `orders` (las crea `ddl-auto=update`). El `status` de la orden no cambia: sigue `CONFIRMED`.
- Riesgos y mitigación: el token de servicio todavía se configura a mano (`ACCOUNTING_SERVICE_TOKEN`) porque no está documentado cómo se emite; por eso el cliente real queda detrás de `MARKET_ACCOUNTING_CLIENT=gateway` y el valor por defecto es el mock.

Relación: [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]], [[Orden de compra]], [[Tipos de item]], [[Sprint 2 - Índice]].

---

## Tareas

### T01 - Implementar cliente REST para equip-summary de Accounting y lectura de PAR-12 (#6269)

**Objetivo:** `AccountingEquipSummaryClient` vía Gateway con token de servicio para `GET /api/accounting/courses/{courseId}/accounts/{studentId}/equip-summary`, `AccountingEquipSummaryDto` (`currentLives`, `reservedLives`), configuración de PAR-12 (`market.lives.max-lives`, por defecto 3) y un mock para pruebas locales.

PR: `tpi-market` #94 · Estimación: 4 h · Asignado a: Tomas Kimmel Battaglia

### T02 - Incorporar validación preventiva de tope de vidas previa a la creación del hold (#6270)

**Objetivo:** extender `PurchaseValidationService` para que, en compras `LIFE`, rechace con 422 `LIFE_CAP_REACHED` cuando la oferta otorga más vidas que `max(0, maxLives − (currentLives + livesInFlight))`, sin tocar el saldo ni persistir el hold. `livesInFlight` (las vidas de las órdenes propias en vuelo) se agregó en la review de #97 (`56275a9a`).

PR: `tpi-market` #97 (depende de #94) · Estimación: 4 h · Asignado a: Tomas Kimmel Battaglia

### T03 - Estandarizar identificador unificado orderId (UUID máx 36 chars) y consistencia de courseId (#6271)

**Objetivo:** que `orderId` sea el mismo `orderRef` UUID en la orden, en `HOLD_CREATE_REQUESTED` y en `LIFE_PURCHASE_CONFIRMED`, con como máximo 36 caracteres; mismo `courseId` y `quantity >= 1`. En la review de #95 (`2ce87f0f`) la validación pasó a `dtos/events/ExternalId.java` y cubre también `studentId` y `courseId`.

PR: `tpi-market` #95 · Estimación: 3 h · Asignado a: Tomas Kimmel Battaglia

### T04 - Consumir LIFE_PURCHASE_REJECTED de accounting.events y transicionar a cobrada sin acreditar (#6272)

**Objetivo:** listener de `accounting.events` para `LIFE_PURCHASE_REJECTED` (`ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`) que marca la orden `SETTLED_UNCREDITED` y registra una alerta de auditoría para la reversión manual del débito desde BackOffice.

PR: `tpi-market` #96 · Estimación: 5 h · Asignado a: Tomas Kimmel Battaglia

### T05 - Pruebas unitarias, mocks y tests de integración de la saga de compras de vidas (#6273)

**Objetivo:** escenarios BDD de punta a punta: tope alcanzado sin cobro, compra exitosa dentro del cupo y rechazo contable con orden cobrada sin acreditar.

PR: `tpi-market` #98 (se mergea al final) · Estimación: 4 h · Asignado a: Tomas Kimmel Battaglia

---

## Definition of Done (DoD)

- [ ] Código revisado y mergeado a `develop` (una PR por tarea).
- [ ] `mvn verify` en verde (tests, Checkstyle y PMD).
- [ ] OpenAPI actualizado con las respuestas 422 y 503.
- [ ] [[Integración con Accounting]] y [[Orden de compra]] actualizadas.
