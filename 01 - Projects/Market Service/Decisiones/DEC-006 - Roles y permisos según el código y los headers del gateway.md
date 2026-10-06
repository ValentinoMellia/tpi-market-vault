---
tipo: decision
estado: vigente
verificado_contra: codigo@3e2b88b
actualizado: 2026-10-04
tags: [mercado, decision, seguridad, roles]
---
# DEC-006 - Roles y permisos según el código y los headers del gateway

> Los roles y permisos de Mercado son los del código, y la identidad llega por las cabeceras que inyecta el gateway (`X-User-Id`, `X-User-Roles`). **Enmienda 2026-10-04**: la cabecera se lee de forma exacta y solo los cinco roles cuentan, con o sin un `ROLE_` inicial ([[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]]). El parseo laxo ya está corregido en `develop`; el bypass por cabecera vacía y el usuario por defecto siguen pendientes.

## Contexto
Había dudas sobre quién activa o desactiva una oferta (admin o profesor), sobre la cabecera oficial de roles (`X-Roles` o `X-User-Roles`) y sobre los roles `GESTOR` y `MS`, ausentes de los documentos anteriores. Pregunta de origen: [[Q-010 - Roles y permisos]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01:

- **Cabecera oficial de roles: `X-User-Roles`**, reinyectada por el gateway desde el JWT, que además elimina las cabeceras `X-*` reservadas ([[Gateway e identidad]]).
- **Roles**: STUDENT, PROFESSOR, ADMIN, GESTOR, MS.
- **Cambio de estado de una oferta**: el profesor lo hace solo por la ruta del curso (`PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status`); `PATCH /offers/{id}/status` es para ADMIN, GESTOR y MS.
- **SSE de órdenes**: el dueño de la orden y los roles ADMIN, GESTOR y MS.
- Los permisos por endpoint son los de la tabla de [[Estado actual del código]].

**Enmienda del 2026-10-04** (pregunta de origen: [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]], archivada). Confirmada por Patricio Fernandez el 2026-10-04; el PR #86 de `tpi-market` que la implementa fue aprobado y mergeado por Patinio el 2026-10-03 (`develop@3e2b88b`). Cómo se lee `X-User-Roles`:

- Se separa por comas, se recorta cada parte y se le quita **un solo** `ROLE_` inicial; el resto se compara **exacto y con mayúsculas** contra los cinco roles. `ROLE_PROFESSOR` y `PROFESSOR` son el mismo rol; `ROLE_ROLE_ADMIN`, `admin` o `NOT_ADMIN` no son ninguno.
- **Solo los cinco roles llegan a ser autoridades** (`ROLE_<rol>`); cualquier otro valor se ignora sin error.
- El filtro y las reglas de negocio usan el mismo parser (`UserRole.fromHeader`, `src/main/java/ar/edu/utn/frc/tup/p4/models/enums/UserRole.java`), así que las dos capas de [[Gateway e identidad]] leen igual la cabecera.

## Alternativas descartadas
- **Permitir al profesor también por `/offers/{id}/status`**: amplía la superficie sin necesidad; el profesor ya tiene su ruta.
- **Mantener `X-Roles` como cabecera válida**: el gateway no la emite.
- **Convertir en autoridad cualquier texto y solo normalizar el prefijo** (opción 2 de Q-020): una autoridad como `ROLE_NOT_ADMIN` existiría aunque nadie la use, y el filtro y los services volverían a leer distinto.
- **Mantener el prefijo `ROLE_` incondicional** (opción 3 de Q-020, lo que pedía el change `gateway-mesh-integration`): `ROLE_PROFESSOR` quedaba como `ROLE_ROLE_PROFESSOR` y respondía 403.

## Consecuencias
- **Sigue siendo una brecha** (no la cierra esta decisión): el respaldo `X-Roles` en `configs/filters/GatewayIdentityFilter.java` debe quitarse, el parseo de roles con `contains()` (subcadena) debe endurecerse y `CourseCatalogManageServiceImpl.validateProfessorAccess` omite el chequeo cuando la cabecera está vacía. Es el gap 12 de [[Estado actual del código]] y una tarea de [[Roadmap de trabajo]].
- También persiste el usuario por defecto `usr-student-001` (gap 9).
- Por la enmienda del 2026-10-04: `/whoami` deja de listar roles desconocidos (sirve menos para diagnosticar qué mandó el gateway) y un rol nuevo de la plataforma exige agregarlo al enum `UserRole`.
- **Seguimiento del 2026-10-03** (no modifica la decisión): el respaldo `X-Roles` ya no estaba en el filtro sino en cuatro controladores (verificado contra `codigo@276af52`). El PR #86 de `tpi-market` (T01 de [[S2-04 - Seguridad]], mergeado en `develop` el 2026-10-03 (`3e2b88b`, aprobado por Patinio)) lo quita y reemplaza `contains()` por una comparación exacta. Ese PR propuso además dos cambios de conducta, que se confirmaron y forman la enmienda del 2026-10-04 ([[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]]). El caso de un servicio con `MS` en las reglas de negocio está en [[Q-021 - Principal de servicio MS en las reglas de negocio]].
- **Seguimiento del 2026-10-03, T02** (no modifica la decisión): el PR #92 de `tpi-market` (mergeado en `develop` el 2026-10-04 (`76a9bbd`, aprobado por tommikimmel)) cierra el bypass por cabecera vacía y hace que las rutas de estado lean el principal autenticado, de modo que `MS` puede cambiar el estado de una oferta como dice esta decisión. Registrado en [[DEC-017 - Servicios con MS en las rutas de estado de oferta]].
- **Seguimiento del 2026-10-04, T03** (no modifica la decisión): el PR #93 de `tpi-market` (mergeado en `develop` el 2026-10-06 (`011fe7d6`, aprobado y mergeado por Lucio Wiesek)) quita el usuario por defecto `usr-student-001` (gap 9); sin `X-User-Id`, las lecturas responden 400 `missing-header`. Ver [[S2-04 - Seguridad]].

## Notas afectadas
[[Gateway e identidad]], [[Estado actual del código]], [[Oferta de catálogo]], [[Épica 090 - Catálogo por plantillas]], [[Integración con Users]], [[Roadmap de trabajo]], [[Decisiones - Índice]].
