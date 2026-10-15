---
tipo: decision
estado: vigente
verificado_contra: codigo@2fc155ad, equipo-cursos@2026-10-08
actualizado: 2026-10-15
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

## Estado de implementación (2026-10-10)

Implementado en `develop@2fc155ad` (PR #159 de `tpi-market`, historia Taiga US #7382, tareas T01 a T04):
- **Controlador:** `MyMarketsController` (`src/main/java/ar/edu/utn/frc/tup/p4/controllers/MyMarketsController.java`), expone `GET /api/market/courses` (vía `@RequestMapping("${app.api.private-path:/api/market}/courses")`) con autorización `@PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")` y documentación completa en OpenAPI (T03). Se incorporó a la matriz de seguridad (`RoleEndpointMatrixAcceptanceTest`, endpoint 17).
- **Servicio y deduplicación:** `MyMarketsServiceImpl` (`src/main/java/ar/edu/utn/frc/tup/p4/services/impl/MyMarketsServiceImpl.java`) valida que `X-User-Id` no esté en blanco (lanza `IllegalArgumentException` mapeada a 400). Obtiene las asignaciones y matrículas desde `CourseCohortClient`, filtra `cohort_status = ACTIVE` y `enrollment_status = VALIDATED`, descarta `GESTOR` y combina por curso: la entrada de docente prevalece sobre la de alumno, y entre docentes prevalece `canManage = true` (T02).
- **Listados de Cursos:** `GatewayCourseListings` (`src/main/java/ar/edu/utn/frc/tup/p4/clients/impl/GatewayCourseListings.java`) consulta `GET /api/course/enrollments?student_id={id}` y `GET /api/course/course-cohorts?professor_id={id}&status=ACTIVE` con token de servicio M2M y paginación exhaustiva (páginas de 50 elementos hasta `totalPages`) (T01). Ante errores de red o HTTP 5xx propaga `CourseServiceUnavailableException` (503).
- **DTOs y wire format:** `MyMarketDto` (`course_id`, `course_name`, `role`, `can_manage`), `CourseCohortItemResponseDto`, `CourseCohortPageResponseDto` y `StudentCohortEnrollmentResponseDto` con nombres estrictos `snake_case` y alias tolerantes (T01 y T02).
- **Pruebas:** `MyMarketsEndpointIntegrationTest` (T04), `MyMarketsControllerTest`, `MyMarketsServiceTest`, `GatewayCourseCohortClientTest` y pruebas unitarias de wire.

## Notas afectadas
[[S2-02 - Clientes reales de Cursos]], [[Integración con Cursos]], [[Decisiones - Índice]].
