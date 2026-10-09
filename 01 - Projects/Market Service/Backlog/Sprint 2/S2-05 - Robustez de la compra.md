---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-09
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5219"
puntos: 8
prioridad: Should
horas: 26
---
# S2-05 - Robustez de la compra

> Corregir los defectos de la compra: vencimientos mal calculados, respuestas 500 y 200 incorrectas, y una clave de idempotencia global en lugar de por estudiante. Absorbe además lo que faltaba de la historia #1012 de Taiga: el [[Patrón Outbox]] sin reintentos acotados y sin forma de ver los avisos pendientes. 7 tareas, 26 h, 8 puntos, Should. Varios defectos están reportados por el equipo y sin verificar: la primera tarea de cada uno es reproducirlo. El de la T01 (stock en `HOLD_NOT_SETTLED`) resultó no ser un defecto: [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]].

## [G11] — Robustez de la compra

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante que compra en la tienda de mi curso
- **Quiero**: que la compra falle de forma limpia y predecible, sin perder stock ni cobrarme dos veces
- **Para**: confiar en la tienda aunque algo falle en el camino

---

## Notas / Observaciones

- [ ] Reglas de negocio: una orden cancelada por HOLD_NOT_SETTLED **retiene** su unidad: el ítem ya se entregó, así que no vuelve al stock ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]; `cancelUnsettled` en OrderConfirmationServiceImpl). La clave de idempotencia es única por estudiante, no global ([[Idempotencia]]).
- [ ] Validaciones: el detalle de una oferta vencida pero activa debe responder 409 catalog-offer-expired, no 200 ([[Q-015 - Reglas de la tienda]]; verificado y resuelto por la T04, PR #134 de `tpi-market`). Las excepciones no previstas deben mapearse a su estado HTTP correcto en GlobalExceptionHandler; hoy algunas caen en unexpected-error (500). Se inventarían en la tarea 3.
- [ ] Datos obligatorios: idempotencyKey en el cuerpo de POST /api/market/courses/{courseId}/orders; studentId desde X-User-Id.
- [ ] Performance (tiempos, volumen, límites): el índice único pasa de uk_orders_idempotency_key (solo clave) a clave más estudiante; sin impacto de volumen esperado.
- [ ] Seguridad (roles, permisos, datos sensibles): evitar que un estudiante reutilice la clave de otro para obtener su orden: con clave por estudiante, la misma clave de dos estudiantes crea dos órdenes independientes.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Outbox (absorbe #1012): hoy OutboxEventEntity solo tiene el booleano processed: no hay contador de intentos, espera creciente entre reintentos, máximo de intentos ni estado de fallo. OutboxRelayServiceImpl corta el ciclo en el primer fallo, de modo que un mensaje que nunca se puede enviar bloquea todos los que vienen detrás. Tampoco hay forma de consultar cuántos avisos esperan salir (OutboxEventRepository solo tiene findByProcessedFalseOrderByCreatedAtAscIdAsc). El resto de #1012 ya está en el código: guardado antes de enviar, deduplicación por eventId en los dos listeners y studentId como clave de Kafka para conservar el orden.
- [ ] Otros: OrderHoldServiceImpl convertía granted.expiresAt() con LocalDateTime.ofInstant(..., ZoneId.systemDefault()) (línea 129 en `develop@e50f3b5c`); lo resolvió la T02, mergeada en `develop@cb12210a` (ver «Estado en Taiga»). El gap 18 de [[Estado actual del código]] está sin verificar; el 19 resultó no ser un defecto ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]); el 20 (órdenes trabadas en CREATED) se trata en [[S2-OPC1 - Reconciliación de compras]].

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: tras una cancelación por HOLD_NOT_SETTLED, el availableStock de la oferta **no** vuelve al valor previo a la reserva (la unidad queda retenida, [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]); probado con una oferta de stock finito.
- [ ] **CA2**: holdExpiresAt se persiste y se compara en UTC: el resultado no depende de la zona horaria del servidor. Se prueba con un `Clock` fijo en una zona distinta de UTC (`America/Argentina/Cordoba`) y valores UTC escritos a mano, sin cambiar la zona de la JVM. (Antes decía "al ejecutar las pruebas con -Duser.timezone distinto de UTC"; se reformuló tras la revisión del PR #118.)
- [ ] **CA3**: ningún flujo de error previsto de compra, vitrina o gestión responde 500; cada excepción de la lista de la tarea 3 responde su estado 4xx con problem+json.
- [ ] **CA4**: GET /api/market/courses/{courseId}/catalog/{itemId} de una oferta activa con publicationExpiresAt pasado responde 409 catalog-offer-expired.
- [ ] **CA5**: dos estudiantes distintos con la misma idempotencyKey crean dos órdenes; el mismo estudiante con la misma clave y otra oferta recibe 409 idempotency-key-conflict.
- [ ] **CA6**: un aviso del outbox que falla se reintenta con espera creciente y, al llegar al máximo de intentos, queda en estado de fallo; los avisos que vienen después se siguen enviando. Probado con un envío que siempre falla.
- [ ] **CA7**: la cantidad de avisos pendientes de enviar se puede consultar (métrica en /actuator/prometheus).
- [ ] **Extras (opcional)**: OrderIdempotencyConcurrencyTest pasa con la clave por estudiante.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra robusta ante fallos

**Escenario 1**  

- **Dado**: una orden en `ITEM_PROVISIONED` con una unidad de stock reservada y un hold que Accounting reporta como liberado
- **Cuando**: la reconciliación o `HOLD_CONFIRMED` fallido cancela la orden con `HOLD_NOT_SETTLED`
- **Entonces**: la orden queda `CANCELLED` y la unidad reservada **no** vuelve al `availableStock`, porque el estudiante ya tiene el ítem

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

**Escenario 5**  

- **Dado**: tres avisos pendientes en el outbox y un primero que Kafka rechaza siempre
- **Cuando**: el relay corre más veces que el máximo de intentos configurado
- **Entonces**: el primero queda en estado de fallo, los otros dos se envían y el contador de pendientes refleja solo los que siguen esperando

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders`, `GET /api/market/courses/{courseId}/catalog/{itemId}`, `GET /api/market/orders/{orderId}`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 8
- **Prioridad (MoSCoW / Numérica)**: Should

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|8|Should|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado.
- Módulos afectados: `entities/OutboxEventEntity.java`, `repositories/OutboxEventRepository.java`, `services/impl/OutboxRelayServiceImpl.java`, `services/impl/OrderConfirmationServiceImpl.java`, `OrderHoldServiceImpl.java`, `PurchaseIdempotencyServiceImpl.java`, `StorefrontCatalogServiceImpl.java`, `repositories/OrderRepository.java`, `entities/OrderEntity.java`, `controllers/GlobalExceptionHandler.java`.
- Otros equipos / aprobaciones: ninguno.
- Impacto en datos / migraciones: cambia la restricción única de `orders` (clave de idempotencia por estudiante); no hay Flyway, así que se ajusta `OrderEntity.IDEMPOTENCY_KEY_CONSTRAINT` y se verifica `ddl-auto=update` en un entorno con datos.
- Riesgos y mitigación (opcional): interacción con [[S2-03 - Reglas de la tienda]] (stock vendido y reservado) y con [[S2-01 - Contrato con Accounting]] (`orderRef`); ordenar los merges para evitar conflictos en `OrderEntity`.

Relación: [[Revisión del Sprint 2 en Taiga]] (origen de las tareas T06 y T07), [[Entrega at-least-once y deduplicación]], [[Eventos y Kafka]], [[Orden de compra]], [[Estado actual del código]] (gaps 8, 13, 18 y 19), [[Errores de la API]], [[Bloqueo optimista]].

---

## Estado en Taiga

Al 2026-10-09:

| Tarea | Estado | Dónde |
|---|---|---|
| #5220 T01 - Fijar que la unidad queda retenida al cancelar por HOLD_NOT_SETTLED | Closed | PR #123 de `tpi-market`, mergeado en `develop` el 2026-10-07 (`c9f47f99`, mergeado por tommikimmel). Redefinida el 2026-10-06 por [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]] (antes: "Liberar el stock al cancelar por HOLD_NOT_SETTLED") |
| #5221 T02 - Guardar el vencimiento del hold en UTC | Closed | PR #118 de `tpi-market`, mergeado en `develop` el 2026-10-06 (`cb12210a`, aprobado y mergeado por tommikimmel), con las correcciones de la revisión de Valentino Mellia |
| #5222 T03 - Mapear a 4xx las excepciones que hoy responden 500 | New | — |
| #5223 T04 - Responder 409 ante una oferta vencida | Ready for test | PR #134 de `tpi-market`, mergeado en `develop` el 2026-10-08 (`8b23425e`, aprobado por 412102-PRESSET y tommikimmel, mergeado por tommikimmel), con las correcciones de la revisión de 412102-PRESSET |
| #5224 T05 - Hacer la clave de idempotencia única por estudiante | New | — |
| #5344 T06 - Outbox con reintentos acotados y estado de fallo | New | Asignada a Valentino Mellia |
| #5345 T07 - Contador de avisos pendientes del outbox | New | Asignada a Valentino Mellia |

La historia sigue con 5 puntos en Taiga; este plan ya la cuenta con 8.

Lo que dejó la T02 (PR #118 de `tpi-market`, mergeado en `develop` el 2026-10-06 (`cb12210a`, aprobado y mergeado por tommikimmel)). Lo de esta sección se verificó contra `develop@cb12210a`; el resto de la nota sigue verificado contra `7528610`, como dice el frontmatter:

- **Guardado y comparación, no solo guardado.** La tarea pedía cambiar la conversión de `OrderHoldServiceImpl`, pero el CA2 dice "se persiste y se compara en UTC". La reconciliación (`services/impl/BankHoldReconciliationServiceImpl.java`) comparaba `holdExpiresAt` contra `LocalDateTime.now()`, en la zona del servidor: si solo se cambiaba el guardado, con el servidor en hora argentina los holds vencidos se reconciliaban 3 h tarde. El PR cambia las dos cosas.
- **Cómo queda.** `holdExpiresAt` sigue siendo `LocalDateTime` (sin cambio de schema) y guarda la hora UTC del `Instant` de Accounting. La reconciliación toma el `Clock` de la aplicación y compara `holdExpiresAt` contra ese instante en UTC. El corte de las filas viejas sin vencimiento sigue comparando `updatedAt` en la zona de la aplicación, porque `updatedAt` se escribe en esa zona.
- **Prueba del CA2.** Con un `Clock` fijo en `America/Argentina/Cordoba` y valores UTC escritos a mano, sin cambiar la zona de la JVM ni el `-Duser.timezone` de la suite.
- **Revisión del PR #118 (Valentino Mellia, 2026-10-06).** Aprobado sin bloqueantes; tras las correcciones lo aprobó y mergeó tommikimmel. Se sumó un Javadoc en `configs/ClockConfig.java`: el `Clock` tiene que quedar en la zona del sistema, porque `updatedAt` se escribe en esa zona y el corte de las filas viejas se compara contra él. Se dejó escrito que, con la JVM en ART, las filas previas al deploy se reconcilian 3 h antes de vencer (impacto bajo: se consulta a Accounting antes de vencer y un hold dura 5 min). El CA2 se reformuló para decir cómo se prueba de verdad.
- **Fuera de alcance.** `createdAt`, `updatedAt` y el resto de los timestamps siguen en la zona del servidor; pasarlos a UTC sería otra tarea. No hay backfill: las filas guardadas antes del deploy quedan con su valor; en Docker (UTC) es el mismo.
- **Para la T01.** El PR #113 de `tpi-market` (US-5207, [[S2-03 - Reglas de la tienda]], en revisión) trata las órdenes `CANCELLED` con `HOLD_NOT_SETTLED` como entregas en cuarentena que retienen el stock; la T01 pedía devolverlo. Resuelto el 2026-10-06 por [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]: la unidad queda retenida y la T01 pasa a fijarlo con una prueba. La prueba entró con el PR #123 de `tpi-market` (mergeado en `develop` el 2026-10-07 (`c9f47f99`, mergeado por tommikimmel)); ver el avance de la T01 en *Tareas*.

Lo que dejó la T04 (PR #134 de `tpi-market`, mergeado en `develop` el 2026-10-08 (`8b23425e`)). Verificado contra `develop@8b23425e`:

- **El defecto existía.** [[Q-015 - Reglas de la tienda]] lo daba por "reportado, sin verificar". Las dos rutas de detalle (`GET /api/market/courses/{courseId}/catalog/{itemId}` y `GET /api/market/offers/{id}`) pasan por `validateStudentAccess` en `services/impl/StorefrontCatalogServiceImpl.java`, que miraba `active` pero no `publicationExpiresAt`: como el vencimiento nunca cambia `active`, un alumno recibía 200 por una oferta vencida. La vitrina ya la ocultaba (la consulta filtra `publicationExpiresAt > now`) y la compra ya respondía 409.
- **Cómo queda.** Después de los chequeos de matrícula y de `active`, `validateStudentAccess` lanza `CatalogOfferExpiredException` si `isExpiredAt(LocalDateTime.now(clock))`: 409 `catalog-offer-expired`, el mismo error y el mismo mensaje que la compra. La oferta está vencida en el instante exacto de `publicationExpiresAt`, igual que en la vitrina. Si además está inactiva, responde primero el 404 `offer-not-available`, en el mismo orden que la compra. Los dos endpoints de detalle documentan el 409 en el OpenAPI y `docs/api_doc/swagger.json` se regeneró con `mvn verify`.
- **Solo para el alumno.** `ADMIN`, `GESTOR`, `MS` y el profesor asignado al curso siguen recibiendo 200: ya veían las ofertas inactivas, y la vista de gestión lista las vencidas a propósito. Decisión de Patricio Fernandez en la exploración, escrita en el requisito "Student offer detail" de la spec `catalog-offer-publication-expiry`.
- **Pruebas.** `StorefrontCatalogServiceTest` (vencida en las dos rutas, instante exacto, 1 ns antes, inactiva y vencida, `ADMIN`/`GESTOR`/`MS`, profesor asignado, `STUDENT` + `PROFESSOR`) y el caso g) de `acceptance/CatalogOfferPublicationExpiryAcceptanceTest`: la misma oferta, al vencer, deja de aparecer en la vitrina y su detalle responde 409 `problem+json` en las dos rutas, mientras el administrador y el profesor asignado reciben 200.
- **Revisión del PR #134 (412102-PRESSET, 2026-10-08).** Sin bloqueantes. Se sumaron casos de prueba (`never().save`, los roles que ven la oferta, el profesor por HTTP). Lo demás se contestó: `active` es `nullable = false`; la compra también valida la matrícula primero (`PurchaseValidationService.validateStudentCanPurchase`); el mensaje repetido con la compra queda así para no tocar `PurchaseOrderServiceImpl`, que modifica el PR #113.
- **Para el frontend.** La página de detalle del front (`OfferDetailService`, `GET /market/offers/{id}`) distingue 404 y 403; ante el 409 muestra el error genérico con "Reintentar". No se rompe, pero no dice que la oferta venció: lo cubre el CA5 de [[S2-08 - Frontend de Mercado]].
- **Fuera de alcance.** `StorefrontOfferDto.status` sigue diciendo `ACTIVE` para una oferta vencida que lee un rol administrativo; sin tarea.
- **Para el PR #113.** Ese PR (US-5207, [[S2-03 - Reglas de la tienda]], en revisión) cambia la línea de `active` que queda justo arriba del chequeo nuevo: al traer `develop`, se conserva su `isEffectivelyActive()` con el chequeo de vencimiento debajo, y `swagger.json` se regenera con `mvn verify` en vez de resolverlo a mano.

---

## Tareas

### T01 - Fijar que la unidad queda retenida al cancelar por HOLD_NOT_SETTLED

**Objetivo:** Dejar probado y documentado que la cancelación por `HOLD_NOT_SETTLED` no devuelve la unidad, según [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]. (Antes: "Liberar el stock al cancelar por HOLD_NOT_SETTLED".)

- Prueba con una oferta de stock finito: tras `order.cancel(OrderCancellationReason.HOLD_NOT_SETTLED)` en `OrderConfirmationServiceImpl`, `availableStock` no vuelve al valor previo
- Si el PR #113 ya está mergeado, la prueba verifica también que `unitsSold` no sube
- Hecho cuando: la prueba fija el comportamiento y el gap 19 queda cerrado

Estimación: 2 h (antes 5 h; bajó al pasar de corregir un defecto a fijar el comportamiento con una prueba, [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]])

**Avance (2026-10-08):** PR #123 de `tpi-market`, mergeado en `develop` el 2026-10-07 (`c9f47f99`, mergeado por tommikimmel); #5220 en *Closed*. Agrega `OrderConfirmationHoldNotSettledStockIntegrationTest`: una oferta con 10 unidades reserva una de verdad (queda en 9), Accounting responde `RELEASED` y, tras cancelar por `HOLD_NOT_SETTLED`, `availableStock` sigue en 9 y `unitsSold` en 0, releídos de la base. Corre con `releaseReason` `ITEM_PROVISION_FAILED` y `TTL_EXPIRED`. Como el PR #113 seguía abierto al 2026-10-08 y en `develop` nada incrementa `unitsSold`, esa aserción hoy pasa sola; cuando entre el #113 pasa a ser un control real. Sin cambios en el código de producción; la spec `order-confirmation` suma el escenario con los valores.

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

**Avance (2026-10-09):** PR #134 de `tpi-market`, mergeado en `develop` el 2026-10-08 (`8b23425e`); #5223 en *Ready for test*. El detalle de una oferta vencida y activa responde 409 `catalog-offer-expired` al alumno y la vitrina no la lista (ver «Estado en Taiga»).

### T05 - Hacer la clave de idempotencia única por estudiante

**Objetivo:** Evitar que la clave de un estudiante se cruce con la de otro.

- `findByIdempotencyKey(String)` pasa a buscar por clave y `studentId`
- Restricción única compuesta en lugar de `uk_orders_idempotency_key`
- Pruebas de concurrencia con la misma clave de dos estudiantes
- Hecho cuando: la misma clave usada por dos estudiantes crea dos órdenes independientes

Estimación: 5 h

### T06 - Reintentar con espera creciente los avisos del outbox que fallan (de #1012)

**Objetivo:** Evitar que un aviso imposible de enviar bloquee a los que vienen detrás.

- Contador de intentos, espera creciente y máximo configurable en `OutboxEventEntity`
- Estado de fallo para el mensaje que no se puede enviar
- `OutboxRelayServiceImpl` deja de cortar el ciclo por un mensaje con fallo
- Pruebas con un envío que siempre falla y con Kafka caído
- Hecho cuando: un aviso que falla llega al máximo de intentos y queda en estado de fallo, y los avisos siguientes se envían

Estimación: 5 h

### T07 - Consultar la cantidad de avisos pendientes del outbox (de #1012)

**Objetivo:** Poder ver cuántos avisos esperan salir.

- Consulta de cantidad en `OutboxEventRepository`
- Métrica en `/actuator/prometheus`
- Prueba de que el contador baja al enviar
- Hecho cuando: la métrica refleja los avisos pendientes y baja cuando se envían

Estimación: 2 h
