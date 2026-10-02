---
tipo: entidad
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
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
| `coinPrice` | Precio en monedas (mínimo 1) |
| `totalStock`, `availableStock` | Stock total y disponible; `availableStock` nulo significa ilimitado ([[DEC-002 - Stock opcional por oferta]]) |
| `active`, `deleted` | Disponibilidad |
| `publicationExpiresAt` | Hasta cuándo se publica la oferta (no es el vencimiento del item). Hoy solo aparece en los DTO de respuesta; se podrá fijar y extender ([[DEC-013 - Reglas de la tienda]]) |
| `itemValidityDays` | Residuo, nunca se envía a accounting; los ítems no vencen y el campo se quita ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]], [[Vencimiento de items]]) |
| Parámetros de configuración | Cargas, multiplicador, modo, duración, intentos, regla de consumo, vidas |
| `unitsSold` | Unidades vendidas; hoy nunca se incrementa, lo que puede producir sobreventa al editar el stock; la decisión es incrementarlo al confirmar la orden ([[DEC-013 - Reglas de la tienda]]) |

## Ciclo de vida / estados
Se publica activa, puede editarse, activarse o desactivarse y vencer por `publicationExpiresAt`. La vitrina muestra solo las activas y no vencidas.

## Reglas de negocio
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
- T6 (modificada): `publicationExpiresAt` puede extenderse. Hoy ni `CatalogOfferPublishDto` ni `CatalogOfferUpdateDto` lo aceptan, así que el profesor no puede fijarlo ni extenderlo. Pendiente: si al extender solo se aceptan fechas posteriores.
- Hoy el detalle de una oferta vencida pero activa responde 200 (según la documentación del equipo, sin verificar).
- El stock opcional está decidido en [[DEC-002 - Stock opcional por oferta]].

## Dónde vive en el código
`entities/CourseCatalogOfferEntity.java` (tabla `course_catalog_offers`), `services/impl/CourseCatalogManageServiceImpl.java`, `StorefrontCatalogServiceImpl.java`, `OfferStockServiceImpl.java`, `validation/ValidOfferConfigurationValidator.java`. Datos de demostración en `configs/CatalogDataInitializer.java` (seis ofertas en `COURSE_PROG4_2026` y una en `COURSE_OTHER_9999`, solo en dev y docker).

## Relacionado
[[Épica 090 - Catálogo por plantillas]], [[Tipos de item]], [[Estado actual del código]].
