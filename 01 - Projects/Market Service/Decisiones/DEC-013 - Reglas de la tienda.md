---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-05
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
- **T6 modificada** (reemplaza la recomendación del taller y lo dicho en [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). `publicationExpiresAt` **puede extenderse**. Hecho verificado en `7528610`: ni `dtos/manage/CatalogOfferPublishDto.java` ni `dtos/manage/CatalogOfferUpdateDto.java` contienen `publicationExpiresAt`; solo aparece en los DTO de respuesta (`CourseCatalogManageDto` y `StorefrontOfferDto`). En ese snapshot el profesor no puede fijarlo ni extenderlo por la API.

## Aclaración de implementación — 2026-10-05

La posibilidad de extender sigue siendo la decisión confirmada del 2026-10-01. El siguiente contrato propuesto de US-5207 se registra en esta misma decisión, sin crear otra DEC ni reabrir [[Q-015 - Reglas de la tienda]]:

| Operación | Contrato propuesto |
|---|---|
| Publicar (`POST`) | `publicationExpiresAt`, cuando se informa, debe ser estrictamente futura. No puede enviarse junto con `publicationTtlMinutes`: la combinación responde 400. |
| Compatibilidad de publicación | Se conserva el TTL positivo existente. Si no se informa fecha ni TTL, la publicación no tiene vencimiento automático. |
| Editar (`PATCH`) sin fecha | Campo omitido o `null`: conserva el vencimiento actual; no lo borra. |
| Editar con fecha | Debe ser futura. Si la oferta no tenía vencimiento, admite la primera fecha futura; si ya tenía uno, solo admite una fecha estrictamente posterior (igual o anterior responde 400). |

**Ratificación pendiente:** la restricción de extensión estrictamente posterior es el criterio **provisional de T06** de [[S2-03 - Reglas de la tienda]], no una nueva decisión ratificada por el equipo. Se conserva ese alcance hasta confirmación explícita.

**Estado:** implementación propuesta en [PR #113 de tpi-market](https://github.com/2026-P4-BE/tpi-market/pull/113) (rama `feature/us-5207-store-rules`, fuente original `669ba7d0`), pendiente de aprobación e integración en `develop`. La rama del PR incorpora `origin/develop@e50f3b5c` y ajustes de revisión en `e86290d7`, enviado al remoto; sigue pendiente de aprobación e integración en `develop`. Rutas de contraste en `tpi-market`: `src/main/java/ar/edu/utn/frc/tup/p4/dtos/manage/CatalogOfferPublishDto.java`, `dtos/manage/CatalogOfferUpdateDto.java` y `services/impl/CourseCatalogManageServiceImpl.java` bajo el mismo paquete. [[Estado actual del código]] registra el seguimiento separado del snapshot base.

## Alternativas descartadas
- **T6 original (no extender; publicar una oferta nueva)**: el usuario prefirió poder extender la publicación de la misma oferta.
- **T4 con borrado lógico (`deleted`)**: pierde el historial de compras que la desactivación conserva.

## Consecuencias
- **Tareas de código** ([[Roadmap de trabajo]]):
  - Incrementar `unitsSold` al confirmar la orden y calcular el disponible con vendidos y reservados (`services/impl/CourseCatalogManageServiceImpl.java`, `entities/CourseCatalogOfferEntity.java`).
  - Aceptar `publicationExpiresAt` al publicar y al actualizar (`CatalogOfferPublishDto`, `CatalogOfferUpdateDto`): **propuesto en PR #113, pendiente de integración**; contrato y ratificación pendientes según la aclaración anterior.
  - Completar las validaciones de plantilla activa, tipo y rango del multiplicador al publicar (`validation/ValidOfferConfigurationValidator.java`).
  - Quitar o dejar de usar el borrado lógico (`deleted`) de la oferta; solo se usa `active`.
- **Frontend**: confirmar que `courseId` es el identificador de cohorte ([[Q-009 - Endpoints y prefijos]]).
- Los defectos relacionados sin verificar (no liberar stock en `HOLD_NOT_SETTLED`, órdenes en `CREATED` sin reconciliar) siguen en [[Estado actual del código]] (gaps 19 y 20).

## Notas afectadas
[[Oferta de catálogo]], [[Vencimiento de items]], [[Estado actual del código]], [[Roadmap de trabajo]], [[Taller de decisiones]], [[Épica 090 - Catálogo por plantillas]], [[Decisiones - Índice]], [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]].
