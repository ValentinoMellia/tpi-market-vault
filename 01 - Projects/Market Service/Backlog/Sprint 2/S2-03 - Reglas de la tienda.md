---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-05
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5207"
puntos: 8
prioridad: Should
horas: 30
---
# S2-03 - Reglas de la tienda

> Implementar las reglas decididas de la tienda: `unitsSold` y disponible real, validaciones al publicar, solo desactivar ofertas y `publicationExpiresAt` al publicar y al editar. Corrige un defecto de sobreventa al editar el stock. 6 tareas, 30 h, 8 puntos, Should.

## [G11] — Reglas de la tienda

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor de un curso
- **Quiero**: publicar y editar ofertas con reglas claras de stock, validaciones y vencimiento
- **Para**: que la tienda no venda más unidades de las que hay y conserve el historial de compras

---

## Notas / Observaciones

- [ ] Reglas de negocio ([[DEC-013 - Reglas de la tienda]]): unitsSold se incrementa cuando una orden pasa a CONFIRMED; disponible = total - vendidos - reservados (T1). Las ofertas no se borran, solo se desactivan (T4). publicationExpiresAt puede fijarse y extenderse (T6 modificada). El courseId es la cohorte (T3).
- [ ] Validaciones: al publicar, la plantilla debe existir y estar activa, el itemType debe coincidir con el de la plantilla y el multiplicador debe estar en rango (T5, validation/ValidOfferConfigurationValidator.java). La tarea 6 conserva provisionalmente la extensión estrictamente posterior; ratificación del equipo pendiente ([[DEC-013 - Reglas de la tienda]]).
- [ ] Datos obligatorios: templateId, itemType, customName, coinPrice (mínimo 1); totalStock opcional ([[DEC-002 - Stock opcional por oferta]]).
- [ ] Performance (tiempos, volumen, límites): el incremento de unitsSold debe ser atómico frente a confirmaciones concurrentes (hoy OfferStockConcurrencyTest cubre el descuento de stock).
- [ ] Seguridad (roles, permisos, datos sensibles): el profesor desactiva por PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status; la ruta PATCH /api/market/offers/{id}/status es de ADMIN, GESTOR y MS ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: en el snapshot `7528610`, publish calcula publicationExpiresAt desde publicationTtlMinutes (CatalogOfferPublishDto); T05 conserva el TTL y propone exclusión mutua con la fecha explícita ([[DEC-013 - Reglas de la tienda]]). Datos con deleted=true existentes se tratan como inactivos.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: tras confirmar 3 órdenes de una oferta con totalStock 10, unitsSold vale 3 y el disponible es 7 menos las unidades reservadas.
- [ ] **CA2**: si el profesor edita totalStock a 8 con 3 unidades vendidas, el disponible resultante es 5 (menos reservadas), nunca 8.
- [ ] **CA3**: publicar con plantilla inexistente, inactiva, de otro tipo o con multiplicador fuera de rango responde 400 validation-error con el campo en errors[].
- [ ] **CA4**: no existe ninguna ruta que borre una oferta; desactivar conserva las órdenes asociadas y la oferta deja de aparecer en GET /api/market/courses/{courseId}/catalog.
- [ ] **CA5**: POST y PATCH de /api/market/courses/{courseId}/catalog/manage aceptan publicationExpiresAt y lo devuelven en la respuesta; una fecha en el pasado responde 400.
- [ ] **Extras (opcional)**: la prueba de concurrencia confirma que dos confirmaciones simultáneas incrementan unitsSold en 2.

---

## BDD (mínimo 3 escenarios)

**Característica:** Reglas de stock, validación y vencimiento de ofertas

**Escenario 1**  

- **Dado**: una oferta con `totalStock` 10 y 3 órdenes en `CONFIRMED`
- **Cuando**: el profesor llama a `PATCH /api/market/courses/{courseId}/catalog/manage/{offerId}` con `{"totalStock": 8}`
- **Entonces**: `unitsSold` sigue en 3 y `availableStock` queda en 8 - 3 - reservadas, no en 8

**Escenario 2**  

- **Dado**: una plantilla desactivada en `GET /api/market/templates`
- **Cuando**: el profesor llama a `POST /api/market/courses/{courseId}/catalog/manage` con ese `templateId`
- **Entonces**: responde 400 `application/problem+json` con `type` `.../validation-error` y no se crea la oferta

**Escenario 3**  

- **Dado**: una oferta activa con compras confirmadas
- **Cuando**: el profesor la desactiva con `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status`
- **Entonces**: la oferta queda con `active=false`, desaparece de la vitrina y las órdenes `CONFIRMED` se siguen consultando con `GET /api/market/orders/{orderId}`

**Escenario 4**  

- **Dado**: una oferta con `publicationExpiresAt` dentro de 2 días
- **Cuando**: el profesor llama a `PATCH .../manage/{offerId}` con un `publicationExpiresAt` posterior
- **Entonces**: responde 200 con la fecha nueva y la oferta sigue visible en la vitrina hasta ese instante

---

## Prototipo

- **Capturas**: No aplica (historia de backend; la pantalla del profesor está en [[S2-OPC2 - Frontend de gestión del profesor]])
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/catalog/manage`, `PATCH /api/market/courses/{courseId}/catalog/manage/{offerId}`, `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status`, `GET /api/market/courses/{courseId}/catalog/manage`

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
- Módulos afectados: `entities/CourseCatalogOfferEntity.java`, `services/impl/CourseCatalogManageServiceImpl.java`, `OrderConfirmationServiceImpl.java`, `OfferStockServiceImpl.java`, `dtos/manage/CatalogOfferPublishDto.java`, `CatalogOfferUpdateDto.java`, `validation/ValidOfferConfigurationValidator.java`.
- Otros equipos / aprobaciones: Frontend debe confirmar que `courseId` es la cohorte ([[Q-009 - Endpoints y prefijos]]).
- Impacto en datos / migraciones: sin columnas nuevas (`unitsSold` ya existe). Las ofertas existentes con `unitsSold` en 0 y órdenes confirmadas necesitan recalcularse (script o tarea 1).
- Riesgos y mitigación (opcional): conviene incrementar `unitsSold` junto con el cambio de estado de la orden, dentro de la misma transacción, para no desincronizarlos. La historia [[S2-05 - Robustez de la compra]] también toca el stock (liberación en `HOLD_NOT_SETTLED`): coordinar el orden de los cambios.

Relación: [[Oferta de catálogo]], [[Estado actual del código]] (gaps 4 y 24), [[Roadmap de trabajo]] (P1), [[Épica 090 - Catálogo por plantillas]].

---

## Tareas

### T01 - Incrementar unitsSold al confirmar la orden

**Objetivo:** Registrar las unidades vendidas de cada oferta de forma consistente.

- Incrementar `unitsSold` al pasar la orden a `CONFIRMED`, en la misma transacción (`OrderConfirmationServiceImpl`)
- El incremento debe ser atómico ante confirmaciones concurrentes
- Recalcular `unitsSold` de las ofertas existentes con órdenes confirmadas
- Hecho cuando: tras confirmar 3 órdenes de una oferta, `unitsSold` vale 3

Estimación: 6 h

### T02 - Calcular el stock disponible al editar la oferta

**Objetivo:** Corregir la sobreventa que ocurre al editar `totalStock`.

- Disponible = total - vendidos - reservados en `CourseCatalogManageServiceImpl`
- Aplicarlo en `PATCH /api/market/courses/{courseId}/catalog/manage/{offerId}`
- Prueba: editar `totalStock` a 8 con 3 vendidas
- Hecho cuando: con `totalStock` 8 y 3 vendidas, el disponible es 5 menos las reservadas, nunca 8

Estimación: 5 h

### T03 - Validar la configuración de la oferta al publicar

**Objetivo:** Rechazar ofertas con una plantilla o una configuración inválida.

- En `ValidOfferConfigurationValidator`: plantilla existente y activa, `itemType` igual al de la plantilla y multiplicador en rango
- Respuesta 400 `validation-error` con el campo en `errors[]`
- Una prueba por cada causa de rechazo
- Hecho cuando: publicar con plantilla inexistente, inactiva, de otro tipo o con multiplicador fuera de rango responde 400 con el campo en `errors[]`

Estimación: 6 h

### T04 - Permitir solo desactivar ofertas

**Objetivo:** Conservar el historial de compras evitando el borrado de ofertas.

- Dejar de usar `deleted` en las ofertas y usar solo `active`
- Tratar como inactivas las ofertas existentes con `deleted=true`
- Verificar que no existe ninguna ruta de borrado y que las órdenes asociadas se conservan
- Hecho cuando: una oferta desactivada sale de `GET /api/market/courses/{courseId}/catalog` y sus órdenes se siguen consultando

Estimación: 4 h

### T05 - Aceptar publicationExpiresAt al publicar

**Objetivo:** Permitir fijar el vencimiento de la oferta al publicarla.

- Agregar el campo a `CatalogOfferPublishDto` y devolverlo en la respuesta
- Conservar `publicationTtlMinutes`; rechazar con 400 su combinación con fecha explícita. Sin ambos, no hay vencimiento automático ([[DEC-013 - Reglas de la tienda]])
- Validar que la fecha sea futura
- Hecho cuando: `POST /api/market/courses/{courseId}/catalog/manage` acepta y devuelve `publicationExpiresAt` y responde 400 con una fecha pasada

Estimación: 4 h

### T06 - Aceptar publicationExpiresAt al editar

**Objetivo:** Permitir extender el vencimiento de una oferta ya publicada.

- Agregar el campo a `CatalogOfferUpdateDto`
- Campo omitido o `null`: no cambia la fecha. Si no existía vencimiento, admitir una primera fecha futura
- Regla provisional de T06: si ya existe vencimiento, exigir una fecha futura y estrictamente posterior; igual o anterior responde 400. Ratificación pendiente ([[DEC-013 - Reglas de la tienda]])
- Pruebas de extensión válida, fecha igual/anterior/no futura, primera fecha futura y omisión/`null` sin cambios
- Hecho cuando: `PATCH .../manage/{offerId}` con una fecha posterior responde 200 con la fecha nueva y la oferta sigue visible hasta ese instante

Estimación: 5 h

## Seguimiento de implementación — 2026-10-05

T05 (#5212) y T06 (#5213) están propuestas en [PR #113 de tpi-market](https://github.com/2026-P4-BE/tpi-market/pull/113) (fuente original `669ba7d0`); no se marcan completadas ni integradas en `develop`. El contrato y su carácter provisional se detallan en [[DEC-013 - Reglas de la tienda]]; revisión local y estado de integración en [[Estado actual del código]].
