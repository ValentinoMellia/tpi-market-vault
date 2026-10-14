---
tipo: decision
estado: vigente
verificado_contra: ninguno
actualizado: 2026-10-14
tags: [mercado, decision, oferta, validacion, preview]
---
# DEC-026 - Nombre de oferta hasta 50 caracteres

> El nombre de una oferta admite hasta 50 caracteres al crearla y al renombrarla. Los nombres existentes más largos se conservan hasta que se renombren, y la preview muestra el nombre completo creciendo en vertical.

## Contexto

El usuario reportó que el formulario permite escribir el nombre sin límite y que la preview se rompe a partir de unos 24 caracteres. Hoy el backend acepta hasta 150 caracteres al crear y al editar (`CatalogOfferPublishDto`, `CatalogOfferUpdateDto`, `CourseCatalogOfferEntity.NAME_LENGTH`, verificado en `tpi-market@8303981c`), y el input del nombre no tiene tope de escritura, a diferencia de la descripción (`offer-form.component.ts`, verificado en `2026-PIV-TPI-FE@af7ab25d`). Modelo del fix: [[Fix - Límite del nombre de oferta y preview]].

## Decisión

Confirmada por el usuario el 2026-10-14 en la coordinación de Mercado (plan `plan-validaciones-maximos.md`, Campo 1, revisión N2):

- Máximo de negocio de 50 caracteres para el nombre, en frontend y backend, al crear y al renombrar.
- La columna de almacenamiento sigue en 150: no se achica, no se migra y no se truncan nombres.
- Las ofertas con nombres de más de 50 se conservan. Editar otros datos o cambiar el estado no obliga a renombrar ni reenvía el nombre intacto; un renombre debe cumplir el máximo y no puede quedar vacío.
- Espacios: el backend conserva su semántica actual sin recorte nuevo y cuenta el texto recibido; el frontend mantiene su recorte al enviar y valida la longitud antes.
- La preview y la card muestran el nombre completo con ajuste de línea y crecimiento vertical, también para palabras sin espacios y nombres antiguos, sin elipsis ni recorte.

## Alternativas descartadas

- 60 u 80 caracteres: el usuario eligió 50 por tratarse de un nombre.
- Achicar la columna a 50 o truncar nombres existentes: rompería ofertas ya publicadas.
- Confiar solo en la UI: la API debe rechazar el exceso aunque se evite el formulario.

## Consecuencias

Cambian la validación del nombre en backend y frontend, el payload de edición del formulario y el layout de la preview. No cambian nombres ni tipos de campos, endpoints, contratos con otros microservicios ni nombres de plantillas.

Refinamiento pedido por el usuario el 2026-10-14, después de su QA manual: al llegar a 50 caracteres, el formulario avisa «Llegaste al máximo de 50 caracteres. No podés escribir más.». El aviso no bloquea el envío y no aparece en un nombre antiguo intacto.

Estado al 2026-10-14: implementado y verificado localmente (backend `f5897791`; frontend `894e6188` y `0e445899`), publicado en PR en borrador ([backend #193](https://github.com/2026-P4-BE/tpi-market/pull/193), [frontend #568](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/568)), sin merge. La QA manual del usuario del aviso pasó y la revisión nativa del frontend está aprobada. Quedan pendientes el merge de las PR y la integración con un backend desplegado. Detalle en [[Fix - Límite del nombre de oferta y preview]]. No cambia estados de Taiga.

## Notas afectadas

[[Oferta de catálogo]], [[Fix - Límite del nombre de oferta y preview]], [[Decisiones - Índice]].
