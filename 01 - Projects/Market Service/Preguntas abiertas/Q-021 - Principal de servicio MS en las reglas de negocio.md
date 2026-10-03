---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@276af52
actualizado: 2026-10-03
tags: [mercado, pregunta-abierta, seguridad, roles, gateway]
---
# Q-021 - Principal de servicio MS en las reglas de negocio

> Un microservicio que llama con `X-Principal-Type: service` y el ámbito `MS` pasa `@PreAuthorize` en las rutas que permiten `MS`, pero las reglas de negocio de los services solo leen `X-User-Roles`, que un servicio no envía. ¿Qué debe poder hacer un servicio en las rutas de gestión del catálogo?

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[DEC-006 - Roles y permisos según el código y los headers del gateway]] | `PATCH /offers/{id}/status` es para ADMIN, GESTOR y MS | Decisión |
| Capa 1, `@PreAuthorize` | `CatalogOfferController.updateOfferStatus` y `CourseCatalogManageController.updateCourseOfferStatus` incluyen `MS`; el filtro convierte el ámbito `MS` en `ROLE_MS` | `controllers/CatalogOfferController.java`, `controllers/CourseCatalogManageController.java`, `configs/filters/GatewayIdentityFilter.java` |
| Capa 2, services | Deciden con la cadena de `X-User-Roles`, que para un servicio llega nula | `services/impl/CourseCatalogManageServiceImpl.java` |

## Qué hace hoy el código
Verificado leyendo `develop@276af52`; el PR #86 no cambia esta conducta:

- **`PATCH /offers/{id}/status`**: `validateAdminRole(null)` no encuentra ADMIN, GESTOR ni MS y lanza `AccessDeniedException`. Un servicio recibe **403**, aunque DEC-006 dice que MS puede.
- **`PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status`**: `validateAdminOrInstructorAccess` no lo ve como administrativo y llama a `validateProfessorAccess`, que **omite** el chequeo de rol porque la cabecera está vacía y **omite** el de asignación porque falta `X-User-Id`. Un servicio **pasa** sin ningún chequeo de negocio. Cuando la T02 de [[S2-04 - Seguridad]] cierre el bypass por cabecera vacía, esta ruta también responderá 403.

Las dos rutas tratan al mismo llamador de forma opuesta, y ninguna de las dos por una regla explícita.

## Opciones
1. **Los services también consultan las autoridades del `SecurityContext`** (como ya hace `PurchaseOrderController` con `ROLE_ADMIN`, `ROLE_GESTOR` y `ROLE_MS`): un servicio con `ROLE_MS` cuenta como administrativo. Ventajas: cumple DEC-006 en las dos rutas. Desventajas: cambia las firmas de los services y sus pruebas.
2. **Los controladores combinan `X-User-Roles` con `MS` cuando el principal es un servicio**, antes de llamar al service. Ventajas: cambio chico. Desventajas: otra lectura de la identidad fuera del filtro.
3. **Ningún servicio cambia estados de ofertas**: se quita `MS` de esos `@PreAuthorize`. Ventajas: simple. Desventajas: contradice DEC-006.

## Recomendación
Opción 1, después de la T02, y cubierta por la matriz de la T04 de [[S2-04 - Seguridad]]. Antes conviene confirmar si algún servicio de la plataforma necesita de verdad cambiar ofertas.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado. Si algún servicio necesita estas rutas, el equipo dueño de ese servicio. Contexto en [[Gateway e identidad]].

## Resolución
Pendiente. Surgió en la revisión del PR #86 de `tpi-market` (2026-10-03).
