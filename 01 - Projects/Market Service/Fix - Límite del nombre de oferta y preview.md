---
tipo: estado
estado: vigente
verificado_contra: codigo@f5897791
actualizado: 2026-10-14
tags: [mercado, fix, oferta, validacion, preview]
---
# Fix - Límite del nombre de oferta y preview

> Fix implementado y verificado en la rama `fix/tema-09-offer-name-max-50` de backend y frontend, publicado en PR hacia `develop` listas para revisión ([backend #193](https://github.com/2026-P4-BE/tpi-market/pull/193), [frontend #568](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/568)), sin merge: el nombre de oferta admite hasta 50 caracteres en frontend y backend, la preview muestra el nombre completo y el formulario avisa al llegar al límite. Decisión: [[DEC-026 - Nombre de oferta hasta 50 caracteres]]. La QA manual del humano pasó y la revisión nativa del frontend está aprobada. Pendientes: merge de las PR e integración con un backend desplegado.

## Estado actual (antes del fix)

- Backend (`tpi-market@8303981c`): nombre obligatorio y hasta 150 al crear (`CatalogOfferPublishDto`); hasta 150 al editar, sin obligatoriedad (`CatalogOfferUpdateDto`); el servicio guarda el valor tal cual al editar (`CourseCatalogManageServiceImpl`), por lo que hoy acepta renombrar a vacío por HTTP directo.
- Frontend (`2026-PIV-TPI-FE@af7ab25d`): el input del nombre no tiene tope de escritura; la validación marca error recién por encima de 150. El formulario reenvía siempre el nombre al editar. La descripción sí tiene tope de 500.

## Plan

- Backend: máximo 50 al crear y renombrar, renombre no vacío, nombre omitido conserva el actual, nombres antiguos de más de 50 intactos.
- Frontend: tope de 50 al escribir y pegar con el input existente, excepción para el nombre original intacto, edición sin reenviar el nombre que no cambió y preview que ajusta líneas y crece.

Ejecución: Run de Orca `run_95fb3331d08e`, rama `fix/tema-09-offer-name-max-50` en ambos repos. Seguimiento en `mercado-coordination/nombre-50-progress.md`.

## Implementación (local, rama `fix/tema-09-offer-name-max-50`)

- **Backend (`tpi-market@f5897791`, base `8303981c`):**
  - Nueva constante `CatalogOfferLimits.MAX_NAME_LENGTH = 50`, separada de la columna, que sigue en 150.
  - `@Size(50)` al crear y al renombrar, contando el texto recibido sin recorte.
  - Al renombrar, `@Pattern` rechaza un nombre vacío o de solo espacios cuando viene en el pedido. Si se omite, se conserva el actual.
  - El error sale como 400 `validation` con `errors[].field = customName`; el contrato de errores no cambia.
  - Evidencia: `mvn -B verify` con 3411 tests y 0 fallas, Checkstyle, PMD y JavaDoc OK.
- **Frontend (`2026-PIV-TPI-FE@894e6188`, base `af7ab25d`):**
  - El input tiene `maxlength` 50, así que escribir y pegar se cortan.
  - La validación usa el texto ingresado y deja pasar el nombre antiguo intacto.
  - La edición no reenvía un nombre que no cambió.
  - Preview, cards, catálogo y detalle hacen salto de línea con `overflow-wrap: anywhere`, sin elipsis.
- **Ajuste tras la QA manual (`2026-PIV-TPI-FE@0e445899`):**
  - Con exactamente 50 caracteres se muestra «Llegaste al máximo de 50 caracteres. No podés escribir más.». Es informativo, no bloquea el envío y desaparece en 49.
  - No aparece en un nombre antiguo intacto de más de 50.
  - Usa el `hint` de `GenericInput` y una región `aria-live` polite.

## Verificación y límites

- Tests focalizados: backend 56/56, frontend 160/160 (S2) y 110/110 (aviso).
- `npm run verify` termina con exit 1 por un archivo de herramientas sin seguimiento (`.atl/skill-registry.md`); los demás pasos pasan por separado.
- La suite completa del frontend tuvo 8 timeouts en specs ajenos; el rerun aislado dio 73/73.
- El humano hizo QA manual del tope y la preview, y pidió el aviso.
- La QA manual del aviso (2026-10-14) **pasó**: «Pasó correctamente». Se hizo en el front local con el worktree que contiene `0e445899`, y cubrió que el aviso aparece en 50, que desaparece al borrar y que deja guardar.
- La plataforma compartida no tiene desplegado el backend nuevo: no hay verificación de integración real.
- Revisión nativa (RDD): frontend (S2 + S3) aprobado. Dejó dos sugerencias informativas que no se aplicaron. El backend no tuvo revisión debida porque quedó por debajo del presupuesto. PR hacia `develop` listas para revisión: [backend #193](https://github.com/2026-P4-BE/tpi-market/pull/193) y [frontend #568](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/568); sin merge. El CI de GitHub no corrió en la PR del backend por facturación de la cuenta.
- Seguimiento posible, fuera de alcance: las vistas de inventario y de compra también muestran el nombre y no se tocaron.
