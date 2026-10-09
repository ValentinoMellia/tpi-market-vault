---
tipo: decision
estado: vigente
verificado_contra: equipo-cursos@2026-10-08
actualizado: 2026-10-08
tags: [mercado, decision, cursos, api]
---
# DEC-024 - Listado Mis mercados

> Mercado expone `GET /api/market/courses`, que lista los cursos donde el usuario tiene un mercado habilitado: `[{courseId, courseName, role, canManage}]`. Depende de los listados por servicio que Cursos entrega en su próximo sprint.

## Contexto
El frontend necesita saber a qué catálogos puede entrar un usuario sin probar curso por curso. Con [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]] y [[DEC-021 - Acceso al mercado por membresía de Cursos]], esa lista sale de la misma regla: cohortes `ACTIVE` donde el usuario es alumno validado o docente asignado. Cursos se comprometió a entregar los listados por `professor_id` y `student_id` ([[DEC-022 - Contrato de membresía con Cursos]]).

## Decisión
Confirmada por el PO el 2026-10-08.

- **Ruta:** `GET /api/market/courses`, para `STUDENT` y `PROFESSOR`. Responde `[{ courseId, courseName, role, canManage }]`.
- **Solo cohortes habilitadas:** `cohort_status = ACTIVE` y activas. `DRAFT`, `ARCHIVED`, desactivadas o inexistentes nunca aparecen.
- **Alumno:** cohortes con inscripción `VALIDATED`, con `role = STUDENT` y `canManage = false`.
- **Docente:** asignaciones `PROFESSOR` (`canManage = true`) y `PROFESSOR_READ_ONLY` (`canManage = false`). Las de `GESTOR` se descartan.
- **Ambos roles:** unión sin duplicados; en un duplicado gana el rol de docente.
- Sin cohortes: 200 con lista vacía. `X-User-Id` vacío: rechazo antes de llamar a Cursos. Cursos caído: 503, nunca una lista parcial. El listado de docente recorre todas las páginas.

## Alternativas descartadas
- **No exponer el listado**: obliga al frontend a consultar curso por curso.
- **Usar `/course-cohorts/me` y `/enrollments/me`**: solo funcionan para el usuario autenticado y Mercado llama como servicio.

## Consecuencias
- Es la US-6 de [[S2-02 - Clientes reales de Cursos]]. Queda bloqueada hasta que Cursos despliegue los listados por servicio.
- La ruta nueva entra en la matriz de roles de Mercado y en su OpenAPI.

## Notas afectadas
[[S2-02 - Clientes reales de Cursos]], [[Integración con Cursos]], [[Decisiones - Índice]].
