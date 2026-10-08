---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-08
tags: [mercado, decision, tienda, stock, oferta]
---
# DEC-013 - Reglas de la tienda

> Se adoptan T1, T3, T4 y T5 del taller; T6 se modifica: el vencimiento de la publicación (`publicationExpiresAt`) sí puede extenderse.

## Contexto
Cinco recomendaciones del taller (T1, T3, T4, T5 y T6) corregían defectos reales de la tienda y estaban sin decidir. Pregunta de origen: [[Q-015 - Reglas de la tienda]].

## Decisión
Confirmada por el usuario el 2026-10-01:

- **T1 aprobada.** `unitsSold` se incrementa cuando una orden pasa a `CONFIRMED`. El stock disponible es `total - vendidos - reservados`. Esto corrige la sobreventa que hoy ocurre cuando el profesor edita el stock después de haber vendido unidades.
- **T3 aprobada.** El `courseId` de la tienda es la cohorte del curso: cada cursada tiene su propia tienda.
- **T4 aprobada.** Las ofertas no se borran, solo se desactivan; así se conserva el historial de compras.
- **T5 aprobada.** Al publicar se valida que la plantilla exista y esté activa, que el tipo de ítem coincida con el de la plantilla y que el multiplicador esté dentro del rango.
- **T6 modificada** (reemplaza la recomendación del taller y lo dicho en [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). `publicationExpiresAt` **puede extenderse**. Hecho verificado: hoy ni `dtos/manage/CatalogOfferPublishDto.java` ni `dtos/manage/CatalogOfferUpdateDto.java` contienen `publicationExpiresAt`; solo aparece en los DTO de respuesta (`CourseCatalogManageDto` y `StorefrontOfferDto`). Por eso hoy el profesor no puede fijarlo ni extenderlo por la API.

Detalle pendiente, no decidido: si al extender solo se aceptan fechas posteriores a la vigente.

## Alternativas descartadas
- **T6 original (no extender; publicar una oferta nueva)**: el usuario prefirió poder extender la publicación de la misma oferta.
- **T4 con borrado lógico (`deleted`)**: pierde el historial de compras que la desactivación conserva.

## Consecuencias
- **Tareas de código** ([[Roadmap de trabajo]]):
  - Incrementar `unitsSold` al confirmar la orden y calcular el disponible con vendidos y reservados (`services/impl/CourseCatalogManageServiceImpl.java`, `entities/CourseCatalogOfferEntity.java`).
  - Aceptar `publicationExpiresAt` al publicar y al actualizar (`CatalogOfferPublishDto`, `CatalogOfferUpdateDto`): **pendiente de implementar**. Pendiente decidir si al extender solo se aceptan fechas posteriores.
  - Completar las validaciones de plantilla activa, tipo y rango del multiplicador al publicar (`validation/ValidOfferConfigurationValidator.java`).
  - Quitar o dejar de usar el borrado lógico (`deleted`) de la oferta; solo se usa `active`.
- **Frontend**: confirmar que `courseId` es el identificador de cohorte ([[Q-009 - Endpoints y prefijos]]).
- Los defectos relacionados sin verificar (no liberar stock en `HOLD_NOT_SETTLED`, órdenes en `CREATED` sin reconciliar) siguen en [[Estado actual del código]] (gaps 19 y 20). Seguimiento del 2026-10-08 (no modifica la decisión): el gap 19 resultó no ser un defecto. La unidad de una compra `HOLD_NOT_SETTLED` queda retenida a propósito y, con la regla T1, tampoco cuenta como vendida ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]).

## Notas afectadas
[[Oferta de catálogo]], [[Vencimiento de items]], [[Estado actual del código]], [[Roadmap de trabajo]], [[Taller de decisiones]], [[Épica 090 - Catálogo por plantillas]], [[Decisiones - Índice]], [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]].
