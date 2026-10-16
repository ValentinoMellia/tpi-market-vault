---
tipo: decision
estado: vigente
verificado_contra: DEC-029, codigo@ac05a77f
actualizado: 2026-10-16
tags: [mercado, decision, vencimiento, oferta, item, frontend]
---
# DEC-029 - Los ítems no tienen vigencia después de la compra

> Un ítem comprado no tiene vigencia ni vencimiento: se retira del frontend el campo «Vigencia después de la compra (días)» y todo lo que lo mostraba. Lo único que dura un tiempo es la publicación de la oferta, que no cambia.

## Contexto

La Task #9330 de la US #9323 (Tema 09) pedía limitar la «Vigencia después de la compra (días)» de una oferta por la duración restante de la cohorte. Al revisarla apareció que el backend ya había quitado ese campo y que el formulario del frontend lo seguía mostrando y enviando como `item_validity_days`, de modo que el profesor creía configurar un vencimiento que nadie aplicaba.

Origen sin pregunta `Q-NNN`: se consultó a Accounting y al equipo de Mercado, que confirmaron el 2026-10-15 que los ítems no tendrán vencimiento. Confirma y refuerza [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] (cerrada el 2026-10-01 por el líder de Mercado; pregunta de origen [[Q-014 - Vencimiento de items]], archivada). El plan de la tarea es la revisión 2, aprobada por quien coordina la ejecución el 2026-10-16.

## Decisión

- Los ítems del inventario no tienen vigencia después de la compra ni vencen. No hay un campo ni un cálculo de «días de vigencia» en la oferta, en la compra ni en el inventario.
- Se retira del frontend el campo del formulario de oferta (crear y editar), su validación y sus textos, el dato en los modelos y el servicio, y la fila «Vence a los N días» de las tarjetas, el detalle y la vista previa.
- La duración de la **publicación** de la oferta (`publicationExpiresAt`, «Publicación visible por (días)», «Disponible hasta») es otra cosa y se conserva sin cambios. Qué ocurre con la visibilidad o la comprabilidad de una oferta después del fin de la cohorte no se decide acá: corresponde a la Task #9331, «Publicación visible por (días)».
- El backend no cambia. Los cuatro tests que protegen la ausencia del campo se conservan.

## Alternativas descartadas

- **Limitar la vigencia por la duración restante de la cohorte (revisión 1 del plan):** presupone un vencimiento de ítems que el equipo decidió no tener; habría reforzado un campo que Accounting no modela.
- **Dejar el campo en el formulario «por si acaso»:** es un control engañoso, porque el backend lo descarta con 201.
- **Borrar la columna `course_catalog_offers.item_validity_days`:** es una migración de datos aparte; la columna quedó nula y sin uso, y no se toca en esta tarea.

## Consecuencias

- Verificado en el código al 2026-10-16: `tpi-market@ac05a77f` no tiene el campo en `src/main`. Lo quitó la Task 5229 de la US-5225 (`fda3fca4`, 2026-10-07); publicar enviando `item_validity_days` responde 201 y lo ignora, y lo protegen `ItemValidityIgnoredAcceptanceTest`, `ItemValidityRemovedTest`, `SnakeCaseContractTest` y `StorefrontCatalogControllerTest`.
- Accounting, dueño del inventario ([[DEC-001 - Accounting es dueño del inventario]]), no modela vigencia de ítems: el inventario guarda el catálogo, el tipo, el efecto, las cargas y el estado, y su único vencimiento es el de los holds de monedas ([[Integración con Accounting]]). Mercado no envía ningún campo de vigencia en `ITEM_CONFIRMED`.
- Frontend: el retiro se implementa en la rama `fix/tema-09-remove-item-validity` de `2026-PIV-TPI-FE` (base `develop@6809c8ac`), pendiente de PR hacia `develop` al 2026-10-16. No cambia ningún payload ni contrato de otro servicio.
- Observación fuera de alcance: `ITEM_CONFIRMED` envía `multiplier`, `duration_minutes` y `consumption_rule`, que Accounting ignora. No es vigencia del ítem y no se modifica acá.

## Notas afectadas

[[Vencimiento de items]], [[Oferta de catálogo]], [[Épica 770 - Vencimiento de items]], [[Estado actual del código]], [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]], [[Decisiones - Índice]].
