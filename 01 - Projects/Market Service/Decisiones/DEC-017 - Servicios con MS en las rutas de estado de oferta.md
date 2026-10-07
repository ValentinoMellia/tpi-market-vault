---
tipo: decision
estado: vigente
verificado_contra: codigo@76a9bbd
actualizado: 2026-10-04
tags: [mercado, decision, seguridad, roles, gateway]
---
# DEC-017 - Servicios con MS en las rutas de estado de oferta

> En las dos rutas que cambian el estado de una oferta, la regla de negocio lee la identidad del principal autenticado, no de las cabeceras: un microservicio con el ámbito `MS` cuenta como administrativo, como ya decía [[DEC-006 - Roles y permisos según el código y los headers del gateway]]. Ningún chequeo de rol se saltea por falta de roles.

## Contexto
Un microservicio llama con `X-Principal-Type: service` y `X-Service-Scopes: MS`; el filtro lo autentica con `ROLE_MS` y pasa `@PreAuthorize`, pero los services decidían con la cadena de `X-User-Roles`, que un servicio no envía. Resultado: `PATCH /offers/{id}/status` lo rechazaba (403) aunque DEC-006 lo permite, y `PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status` lo dejaba pasar **sin ningún chequeo**, porque `validateProfessorAccess` omitía el control cuando la cabecera venía vacía. Pregunta de origen: [[Q-021 - Principal de servicio MS en las reglas de negocio]] (archivada).

Cerrar ese bypass, que es la T02 #5216 de [[S2-04 - Seguridad]], dejaba al servicio con 403 también en la ruta del curso. Por eso la pregunta se resolvió en la misma tarea y no en la T04, como recomendaba la pregunta.

## Decisión
Tomada por Patricio Fernandez el 2026-10-03 al implementar la T02 (opción 1 de Q-021), y el PR #92 de `tpi-market` que la implementa fue aprobado por tommikimmel y mergeado en `develop` el 2026-10-04 (`76a9bbd`). Queda sujeta a la revisión del PR del vault que registra esta decisión.

- **Fuente de la identidad en las rutas de estado.** `CatalogOfferController.updateOfferStatus` y `CourseCatalogManageController.updateCourseOfferStatus` reciben el `Authentication` que arma `GatewayIdentityFilter`: el id es el nombre del principal y los roles salen de sus autoridades con `UserRole.fromAuthorities`, que solo acepta `ROLE_<rol>` exacto. Esas dos rutas dejan de leer `X-User-Id` y `X-User-Roles` como parámetros. Para un usuario no cambia nada: el nombre del principal es su `X-User-Id`.
- **Un servicio con `MS` es administrativo en esas dos rutas** (ADMIN, GESTOR y MS, sin cambios en los conjuntos de roles): puede cambiar el estado de cualquier oferta, y en la ruta del curso no se consulta la asignación del profesor.
- **Cabecera de roles vacía o ausente se deniega.** `validateProfessorAccess` (listar, publicar, editar y el estado por curso) y el chequeo de lector de `CourseCatalogSummaryServiceImpl` ya no omiten el control: sin roles responden 403 `professor-not-assigned`, igual que con un rol que no es docente. Tampoco se omite el chequeo de asignación cuando falta el id del usuario.
- **Un servicio solo tiene un rol a través de `MS`.** `GatewayIdentityFilter` descarta los ámbitos que empiezan con `ROLE_`, así que `X-Service-Scopes: ROLE_ADMIN` no da `ROLE_ADMIN` (pedido en la revisión del PR #92).
- El resto de las rutas (listar, publicar, editar, resumen y vitrina) sigue leyendo `X-User-Roles`; ninguna de ellas permite `MS` en `@PreAuthorize`, salvo la vitrina, que queda fuera de esta decisión.

## Alternativas descartadas
- **Cerrar el bypass y dejar el 403 para los servicios**: contradice DEC-006 en las dos rutas y deja la pregunta abierta hasta la T04.
- **Que el controlador agregue `MS` a la cadena de roles cuando el principal es un servicio** (opción 2 de Q-021): sería otra lectura de la identidad fuera del filtro.
- **Quitar `MS` de esos `@PreAuthorize`** (opción 3): contradice DEC-006.
- **Que los services consulten `SecurityContextHolder`**: no cambia firmas, pero acopla los services a un estado estático y no tiene precedente fuera del filtro.

## Consecuencias
- `PATCH /offers/{id}/status` pasa de 403 a 200 para un servicio con `MS`; la ruta del curso deja de ser un bypass y aplica una regla explícita.
- En Swagger, el `PATCH` por curso deja de listar `X-User-Id` y `X-User-Roles` como parámetros (el gateway las sigue enviando).
- `CourseCatalogManageService` queda con firmas mixtas: las dos de estado reciben `Set<UserRole>` y el resto la cabecera. Alinear el resto queda para cuando haga falta.
- Quedan para la T03 y la T04 de [[S2-04 - Seguridad]] los GET de detalle de la vitrina, que permiten `MS` pero todavía evalúan al servicio como el alumno por defecto `usr-student-001`.
- Sigue abierta [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]], que esta decisión no cubre.

## Notas afectadas
[[Q-021 - Principal de servicio MS en las reglas de negocio]], [[DEC-006 - Roles y permisos según el código y los headers del gateway]], [[Gateway e identidad]], [[S2-04 - Seguridad]], [[Estado actual del código]], [[Decisiones - Índice]].
