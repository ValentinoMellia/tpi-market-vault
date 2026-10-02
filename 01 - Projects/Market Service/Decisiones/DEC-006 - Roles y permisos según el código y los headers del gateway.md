---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, decision, seguridad, roles]
---
# DEC-006 - Roles y permisos según el código y los headers del gateway

> Los roles y permisos de Mercado son los del código, y la identidad llega por las cabeceras que inyecta el gateway (`X-User-Id`, `X-User-Roles`). El parseo laxo de roles y el bypass por cabecera vacía siguen siendo defectos a corregir.

## Contexto
Había dudas sobre quién activa o desactiva una oferta (admin o profesor), sobre la cabecera oficial de roles (`X-Roles` o `X-User-Roles`) y sobre los roles `GESTOR` y `MS`, ausentes de los documentos anteriores. Pregunta de origen: [[Q-010 - Roles y permisos]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01:

- **Cabecera oficial de roles: `X-User-Roles`**, reinyectada por el gateway desde el JWT, que además elimina las cabeceras `X-*` reservadas ([[Gateway e identidad]]).
- **Roles**: STUDENT, PROFESSOR, ADMIN, GESTOR, MS.
- **Cambio de estado de una oferta**: el profesor lo hace solo por la ruta del curso (`PATCH /courses/{courseId}/catalog/manage/offers/{itemId}/status`); `PATCH /offers/{id}/status` es para ADMIN, GESTOR y MS.
- **SSE de órdenes**: el dueño de la orden y los roles ADMIN, GESTOR y MS.
- Los permisos por endpoint son los de la tabla de [[Estado actual del código]].

## Alternativas descartadas
- **Permitir al profesor también por `/offers/{id}/status`**: amplía la superficie sin necesidad; el profesor ya tiene su ruta.
- **Mantener `X-Roles` como cabecera válida**: el gateway no la emite.

## Consecuencias
- **Sigue siendo una brecha** (no la cierra esta decisión): el respaldo `X-Roles` en `configs/filters/GatewayIdentityFilter.java` debe quitarse, el parseo de roles con `contains()` (subcadena) debe endurecerse y `CourseCatalogManageServiceImpl.validateProfessorAccess` omite el chequeo cuando la cabecera está vacía. Es el gap 12 de [[Estado actual del código]] y una tarea de [[Roadmap de trabajo]].
- También persiste el usuario por defecto `usr-student-001` (gap 9).

## Notas afectadas
[[Gateway e identidad]], [[Estado actual del código]], [[Oferta de catálogo]], [[Épica 090 - Catálogo por plantillas]], [[Integración con Users]], [[Roadmap de trabajo]], [[Decisiones - Índice]].
