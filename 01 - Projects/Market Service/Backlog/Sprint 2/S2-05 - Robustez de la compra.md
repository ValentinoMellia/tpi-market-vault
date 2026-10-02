---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: ""
puntos: 5
prioridad: Should
horas: 22
---
# S2-05 - Robustez de la compra

> Corregir los defectos de la compra que dejan stock retenido, vencimientos mal calculados, respuestas 500 y 200 incorrectas, y una clave de idempotencia global en lugar de por estudiante. 5 tareas, 22 h, 5 puntos, Should. Varios defectos están reportados por el equipo y sin verificar: la primera tarea de cada uno es reproducirlo.

## [G11] — Robustez de la compra

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante que compra en la tienda de mi curso
- **Quiero**: que la compra falle de forma limpia y predecible, sin perder stock ni cobrarme dos veces
- **Para**: confiar en la tienda aunque algo falle en el camino

---

## Notas / Observaciones

- [ ] Reglas de negocio: una orden cancelada por HOLD_NOT_SETTLED debe devolver el stock reservado (OrderConfirmationServiceImpl, cerca de la línea 358, order.cancel(OrderCancellationReason.HOLD_NOT_SETTLED)). La clave de idempotencia es única por estudiante, no global ([[Idempotencia]]).
- [ ] Validaciones: el detalle de una oferta vencida pero activa debe responder 409 catalog-offer-expired, no 200 ([[Q-015 - Reglas de la tienda]], reportado sin verificar). Las excepciones no previstas deben mapearse a su estado HTTP correcto en GlobalExceptionHandler; hoy algunas caen en unexpected-error (500). Se inventarían en la tarea 3.
- [ ] Datos obligatorios: idempotencyKey en el cuerpo de POST /api/market/courses/{courseId}/orders; studentId desde X-User-Id.
- [ ] Performance (tiempos, volumen, límites): el índice único pasa de uk_orders_idempotency_key (solo clave) a clave más estudiante; sin impacto de volumen esperado.
- [ ] Seguridad (roles, permisos, datos sensibles): evitar que un estudiante reutilice la clave de otro para obtener su orden: con clave por estudiante, la misma clave de dos estudiantes crea dos órdenes independientes.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: OrderHoldServiceImpl convierte granted.expiresAt() con LocalDateTime.ofInstant(..., ZoneId.systemDefault()) (línea 112); debe guardarse en UTC. Los gaps 18 y 19 de [[Estado actual del código]] están sin verificar; el 20 (órdenes trabadas en CREATED) se trata en [[S2-OPC1 - Reconciliación de compras]].

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: tras una cancelación por HOLD_NOT_SETTLED, el availableStock de la oferta vuelve al valor previo a la reserva; probado con una oferta de stock finito.
- [ ] **CA2**: holdExpiresAt se persiste y se compara en UTC: el resultado no cambia al ejecutar las pruebas con -Duser.timezone distinto de UTC.
- [ ] **CA3**: ningún flujo de error previsto de compra, vitrina o gestión responde 500; cada excepción de la lista de la tarea 3 responde su estado 4xx con problem+json.
- [ ] **CA4**: GET /api/market/courses/{courseId}/catalog/{itemId} de una oferta activa con publicationExpiresAt pasado responde 409 catalog-offer-expired.
- [ ] **CA5**: dos estudiantes distintos con la misma idempotencyKey crean dos órdenes; el mismo estudiante con la misma clave y otra oferta recibe 409 idempotency-key-conflict.
- [ ] **Extras (opcional)**: OrderIdempotencyConcurrencyTest pasa con la clave por estudiante.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra robusta ante fallos

**Escenario 1**  

- **Dado**: una orden en `ITEM_PROVISIONED` con una unidad de stock reservada y un hold que Accounting reporta como liberado
- **Cuando**: la reconciliación o `HOLD_CONFIRMED` fallido cancela la orden con `HOLD_NOT_SETTLED`
- **Entonces**: la orden queda `CANCELLED` y la unidad reservada vuelve al `availableStock`

**Escenario 2**  

- **Dado**: una oferta activa cuyo `publicationExpiresAt` ya pasó
- **Cuando**: un estudiante llama a `GET /api/market/courses/{courseId}/catalog/{itemId}`
- **Entonces**: responde 409 `application/problem+json` con `type` `.../catalog-offer-expired`

**Escenario 3**  

- **Dado**: el estudiante A compró con `idempotencyKey` "k-123"
- **Cuando**: el estudiante B llama a `POST /api/market/courses/{courseId}/orders` con `{offerId, idempotencyKey: "k-123"}`
- **Entonces**: responde 202 con una orden nueva distinta y la orden de A no cambia

**Escenario 4**  

- **Dado**: el estudiante A repite la misma solicitud (mismo `offerId` y misma clave) por un doble clic
- **Cuando**: llega la segunda petición
- **Entonces**: devuelve el `orderId` de la primera orden sin crear otra ni retener otro hold

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders`, `GET /api/market/courses/{courseId}/catalog/{itemId}`, `GET /api/market/orders/{orderId}`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 5
- **Prioridad (MoSCoW / Numérica)**: Should

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|5|Should|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado.
- Módulos afectados: `services/impl/OrderConfirmationServiceImpl.java`, `OrderHoldServiceImpl.java`, `PurchaseIdempotencyServiceImpl.java`, `StorefrontCatalogServiceImpl.java`, `repositories/OrderRepository.java`, `entities/OrderEntity.java`, `controllers/GlobalExceptionHandler.java`.
- Otros equipos / aprobaciones: ninguno.
- Impacto en datos / migraciones: cambia la restricción única de `orders` (clave de idempotencia por estudiante); no hay Flyway, así que se ajusta `OrderEntity.IDEMPOTENCY_KEY_CONSTRAINT` y se verifica `ddl-auto=update` en un entorno con datos.
- Riesgos y mitigación (opcional): interacción con [[S2-03 - Reglas de la tienda]] (stock vendido y reservado) y con [[S2-01 - Contrato con Accounting]] (`orderRef`); ordenar los merges para evitar conflictos en `OrderEntity`.

Relación: [[Orden de compra]], [[Estado actual del código]] (gaps 8, 13, 18 y 19), [[Errores de la API]], [[Bloqueo optimista]].

---

## Tareas

### T01 - Liberar el stock al cancelar por HOLD_NOT_SETTLED

**Objetivo:** Corregir la cancelación que no devuelve la reserva de stock.

- Reproducir el defecto con una prueba (`OrderConfirmationServiceImpl`, `order.cancel(OrderCancellationReason.HOLD_NOT_SETTLED)`)
- Liberar la reserva al cancelar
- Hecho cuando: una orden cancelada por `HOLD_NOT_SETTLED` devuelve el stock a la oferta

Estimación: 5 h

### T02 - Guardar el vencimiento del hold en UTC

**Objetivo:** Evitar que el vencimiento dependa de la zona horaria del servidor.

- Reemplazar `ZoneId.systemDefault()` por UTC en `OrderHoldServiceImpl`
- Ajustar `OrderEntity.holdExpiresAt` para que se guarde en UTC
- Prueba con una zona horaria distinta de la del servidor
- Hecho cuando: `holdExpiresAt` se guarda en UTC con cualquier zona horaria configurada

Estimación: 3 h

### T03 - Mapear a 4xx las excepciones que hoy responden 500

**Objetivo:** Evitar errores internos para fallos que son del cliente.

- Inventariar con pruebas las excepciones que caen en `unexpected-error`
- Mapear cada una a su estado 4xx en `GlobalExceptionHandler`
- Hecho cuando: ninguna de las excepciones inventariadas responde 500 y cada una devuelve su `problem+json`

Estimación: 5 h

### T04 - Responder 409 ante una oferta vencida

**Objetivo:** Hacer que el detalle de una oferta vencida y activa deje de responder 200.

- Responder 409 `catalog-offer-expired` en el detalle de la oferta
- Pruebas de vitrina y de detalle
- Hecho cuando: el detalle de una oferta vencida responde 409 `catalog-offer-expired` y la vitrina no la lista

Estimación: 4 h

### T05 - Hacer la clave de idempotencia única por estudiante

**Objetivo:** Evitar que la clave de un estudiante se cruce con la de otro.

- `findByIdempotencyKey(String)` pasa a buscar por clave y `studentId`
- Restricción única compuesta en lugar de `uk_orders_idempotency_key`
- Pruebas de concurrencia con la misma clave de dos estudiantes
- Hecho cuando: la misma clave usada por dos estudiantes crea dos órdenes independientes

Estimación: 5 h
