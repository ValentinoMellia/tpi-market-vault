---
tipo: entidad
estado: vigente
verificado_contra: DEC-028
actualizado: 2026-10-15
tags: [mercado, dominio, oferta]
---
# Oferta de catálogo

> Un item concreto, con precio y configuración, que un profesor publica para su curso a partir de una [[Plantilla base]]. Es lo que el estudiante ve en la vitrina y compra.

## Qué representa
La decisión del profesor: qué item vende, a qué precio y con qué parámetros (por ejemplo, cuántas cargas tiene un escudo o cuánto dura un boost).

## Datos principales
| Campo | Significado |
|---|---|
| `courseId` | Curso al que pertenece |
| `templateId`, `itemType` | Plantilla de origen y tipo |
| `customName`, `description` | Nombre y descripción elegidos |
| `coinPrice` | Precio entero entre 1 y 999999 al crear o cambiar el precio; los antiguos superiores se conservan hasta cambiarlos ([[DEC-028 - Precio de oferta hasta 999.999 monedas]]; en `develop` desde `tpi-market@ac05a77f`) |
| `totalStock`, `availableStock` | Stock total y disponible; `availableStock` nulo significa ilimitado ([[DEC-002 - Stock opcional por oferta]]) |
| `active`, `deleted` | Disponibilidad |
| `publicationExpiresAt` | Hasta cuándo se publica la oferta (no es el vencimiento del item). En el snapshot `7528610` solo aparece en los DTO de respuesta; se podrá fijar y extender ([[DEC-013 - Reglas de la tienda]]) |
| `itemValidityDays` | Residuo, nunca se envía a accounting; los ítems no vencen y el campo se quita ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]], [[Vencimiento de items]]) |
| Parámetros de configuración | Cargas, multiplicador, modo, duración, intentos, regla de consumo, vidas. Las cargas (`charges`) son las que recibe el estudiante: viajan a Accounting como `maxCharges` ([[DEC-027 - Las cargas del ítem las decide el profesor]]) |
| `unitsSold` | Unidades vendidas; hoy nunca se incrementa, lo que puede producir sobreventa al editar el stock; la decisión es incrementarlo al confirmar la orden ([[DEC-013 - Reglas de la tienda]]) |

## Ciclo de vida / estados
Se publica activa, puede editarse, activarse o desactivarse y vencer por `publicationExpiresAt`. La vitrina muestra solo las activas y no vencidas. Desde el PR #134 de `tpi-market` (`8b23425e`, T04 de [[S2-05 - Robustez de la compra]]), el detalle de una oferta vencida le responde 409 `catalog-offer-expired` al alumno, aunque siga con `active = true`; `ADMIN`, `GESTOR`, `MS` y el profesor asignado la siguen viendo (`services/impl/StorefrontCatalogServiceImpl.java`, `validateStudentAccess`).

## Reglas de negocio
- Precio según [[DEC-028 - Precio de oferta hasta 999.999 monedas]]: al crear o cambiar, entero entre 1 y 999999 inclusive. Un precio antiguo superior se conserva al editar otros campos o cambiar el estado; omitirlo o enviar `null` conserva el guardado, pero enviarlo por encima del máximo se rechaza incluso si coincide con el actual. Mergeado en `develop` el 2026-10-15: backend `tpi-market@ac05a77f` (`entities/CourseCatalogOfferEntity.java`, `dtos/manage/CatalogOfferPublishDto.java`, `dtos/manage/CatalogOfferUpdateDto.java`, `dtos/manage/StrictCoinPriceDeserializer.java`) y frontend `2026-PIV-TPI-FE@23c41687`. Sin despliegue registrado; detalle en [[Fix - Límite del precio de oferta y preview]]. El resto de esta nota conserva las verificaciones históricas contra `codigo@7528610` y los commits específicos indicados en cada sección.
- El precio se congela al comprar en `appliedPrice` de la [[Orden de compra]].
- Comprar descuenta stock de forma atómica si es finito y lo devuelve ante fallo.
- Rechazos de compra: no encontrada (404), inactiva, sin stock o vencida (409). Ver [[Errores de la API]].
- Quién cambia el estado: [[DEC-006 - Roles y permisos según el código y los headers del gateway]].

## Reglas decididas, pendientes de implementar
Decididas en [[DEC-013 - Reglas de la tienda]] (origen: [[Q-015 - Reglas de la tienda]]); el código aún no las cumple:

- T1: `unitsSold` se incrementa al confirmar la orden; disponible = total - vendidos - reservados.
- T3: `courseId` es la cohorte; cada cursada tiene su tienda.
- T4: las ofertas no se borran, solo se desactivan (se conserva el historial de compras).
- T5: al publicar se valida plantilla existente y activa, tipo coincidente y multiplicador en rango.
- T6 (modificada): `publicationExpiresAt` puede extenderse. En el snapshot `7528610` los DTO de entrada no lo aceptaban. El contrato propuesto de US-5207 conserva TTL o fecha explícita excluyentes; `PATCH` omitido/`null` no cambia la fecha, permite la primera futura y aplica extensión estrictamente posterior provisional (ratificación pendiente). Véase [[DEC-013 - Reglas de la tienda]].
- El stock opcional está decidido en [[DEC-002 - Stock opcional por oferta]].
- Máximo del nombre aprobado el 2026-10-14: 50 caracteres al crear y al renombrar, en frontend y backend; la columna sigue en 150 y los nombres existentes más largos se conservan hasta renombrarse. La preview muestra el nombre completo creciendo en vertical y el formulario avisa al llegar a 50. En [[DEC-026 - Nombre de oferta hasta 50 caracteres]]; detalle en [[Fix - Límite del nombre de oferta y preview]]. Implementado y verificado en la rama `fix/tema-09-offer-name-max-50` de backend y frontend, en PR listas para revisión ([backend #193](https://github.com/2026-P4-BE/tpi-market/pull/193), [frontend #568](https://github.com/2026-P4-FE/2026-PIV-TPI-FE/pull/568)), sin merge: `develop` todavía acepta hasta 150.

## Dónde vive en el código
`entities/CourseCatalogOfferEntity.java` (tabla `course_catalog_offers`), `services/impl/CourseCatalogManageServiceImpl.java`, `StorefrontCatalogServiceImpl.java`, `OfferStockServiceImpl.java`, `validation/ValidOfferConfigurationValidator.java`. Datos de demostración en `configs/CatalogDataInitializer.java` (seis ofertas en `COURSE_PROG4_2026` y una en `COURSE_OTHER_9999`, solo en dev y docker).

## Relacionado
[[Épica 090 - Catálogo por plantillas]], [[Tipos de item]], [[Estado actual del código]].

## Propuesta pendiente de integración — 2026-10-05

[PR #113 de tpi-market](https://github.com/2026-P4-BE/tpi-market/pull/113) (fuente original `669ba7d0`) propone ese contrato; no describe aún `develop`. Seguimiento de revisión en [[Estado actual del código]] y tareas en [[S2-03 - Reglas de la tienda]].
