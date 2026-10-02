---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
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

- [ ] Reglas de negocio ([[DEC-013 - Reglas de la tienda]]): `unitsSold` se incrementa cuando una orden pasa a `CONFIRMED`; disponible = total - vendidos - reservados (T1). Las ofertas no se borran, solo se desactivan (T4). `publicationExpiresAt` puede fijarse y extenderse (T6 modificada). El `courseId` es la cohorte (T3).
- [ ] Validaciones: al publicar, la plantilla debe existir y estar activa, el `itemType` debe coincidir con el de la plantilla y el multiplicador debe estar en rango (T5, `validation/ValidOfferConfigurationValidator.java`). Pendiente de decidir: si al extender solo se aceptan fechas posteriores a la vigente; hasta decidirlo, la tarea 6 acepta solo fechas posteriores y se registra la decisión.
- [ ] Datos obligatorios: `templateId`, `itemType`, `customName`, `coinPrice` (mínimo 1); `totalStock` opcional ([[DEC-002 - Stock opcional por oferta]]).
- [ ] Performance (tiempos, volumen, límites): el incremento de `unitsSold` debe ser atómico frente a confirmaciones concurrentes (hoy `OfferStockConcurrencyTest` cubre el descuento de stock).
- [ ] Seguridad (roles, permisos, datos sensibles): el profesor desactiva por `PATCH /api/market/courses/{courseId}/catalog/manage/offers/{itemId}/status`; la ruta `PATCH /api/market/offers/{id}/status` es de ADMIN, GESTOR y MS ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]).
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: hoy `publish` calcula `publicationExpiresAt` desde `publicationTtlMinutes` (`CatalogOfferPublishDto`); la tarea 5 define si el campo nuevo convive con el TTL o lo reemplaza. Datos con `deleted=true` existentes se tratan como inactivos.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: tras confirmar 3 órdenes de una oferta con `totalStock` 10, `unitsSold` vale 3 y el disponible es 7 menos las unidades reservadas.
- [ ] **CA2**: si el profesor edita `totalStock` a 8 con 3 unidades vendidas, el disponible resultante es 5 (menos reservadas), nunca 8.
- [ ] **CA3**: publicar con plantilla inexistente, inactiva, de otro tipo o con multiplicador fuera de rango responde 400 `validation-error` con el campo en `errors[]`.
- [ ] **CA4**: no existe ninguna ruta que borre una oferta; desactivar conserva las órdenes asociadas y la oferta deja de aparecer en `GET /api/market/courses/{courseId}/catalog`.
- [ ] **CA5**: `POST` y `PATCH` de `/api/market/courses/{courseId}/catalog/manage` aceptan `publicationExpiresAt` y lo devuelven en la respuesta; una fecha en el pasado responde 400.
- [ ] **Extras (opcional)**: la prueba de concurrencia confirma que dos confirmaciones simultáneas incrementan `unitsSold` en 2.

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

| # | Tarea | Horas | Descripción breve |
|---|---|---|---|
| 1 | `unitsSold` al confirmar | 6 | Incrementar `unitsSold` al pasar la orden a `CONFIRMED` en la misma transacción; recalcular las ofertas existentes |
| 2 | Cálculo de disponible | 5 | Disponible = total - vendidos - reservados al editar el stock (`CourseCatalogManageServiceImpl`); corrige la sobreventa |
| 3 | Validaciones al publicar | 6 | Plantilla existente y activa, tipo coincidente y multiplicador en rango en `ValidOfferConfigurationValidator` |
| 4 | Solo desactivar | 4 | Dejar de usar `deleted` en ofertas; solo `active`; verificar que no hay borrado y que el historial se conserva |
| 5 | `publicationExpiresAt` al publicar | 4 | Aceptar el campo en `CatalogOfferPublishDto`, definir la convivencia con `publicationTtlMinutes` y validar fecha futura |
| 6 | `publicationExpiresAt` al editar | 5 | Aceptar el campo en `CatalogOfferUpdateDto`, regla de extensión (solo fechas posteriores hasta decidir) y pruebas |
