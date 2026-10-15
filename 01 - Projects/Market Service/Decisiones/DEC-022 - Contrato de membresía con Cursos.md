---
tipo: decision
estado: vigente
verificado_contra: codigo@2fc155ad, equipo-cursos@2026-10-08
actualizado: 2026-10-15
tags: [mercado, decision, cursos, integracion]
---
# DEC-022 - Contrato de membresía con Cursos

> Mercado consulta a Cursos como servicio con `GET /api/course/course-cohorts/{id}/membership?user_id={uuid}`, que devuelve siempre `cohort_status` además del rol y los flags. Una sola llamada resuelve disponibilidad y permisos, y la regla queda en Mercado. Dos listados por servicio llegan en el próximo sprint de Cursos.

## Contexto
Los endpoints de Cursos que conocía Mercado (`/course-cohorts/me`, `/enrollments/me`, `GET /course-cohorts/{id}/membership`) responden por el usuario autenticado, pero Mercado llama como servicio. `GET /course-cohorts/roster-membership` recibe `invitationCode` y `email`, valida el CSV de la nómina en lugar de la inscripción `VALIDATED` y responde 404 sin distinguir casos. Hoy el código de `develop@fb5f82d9` usa ese camino de forma provisoria: `clients/impl/CourseMembershipResolver.java` llama a `/api/course/course-cohorts/roster-membership?courseCohortId=&userId=` (contrato supuesto), solo con `market.course.client=gateway`.

Mercado le pidió a Cursos el contrato en la issue `tpi-course#87` (2026-10-08). Cursos respondió todos los puntos y cerró la issue ese mismo día.

## Decisión
Acordada con Cursos en `tpi-course#87` (cerrada el 2026-10-08).

- **Membresía:** `GET /api/course/course-cohorts/{courseCohortId}/membership?user_id={uuid}`.
  - Principal de servicio, ámbito `course.enrollment.read` (rol `MS` vía `X-Service-Scopes`), con el token de servicio ya implementado (T02 de US-5202).
  - Miembro: 200 con `course_cohort_id`, `cohort_status` (`DRAFT`, `ACTIVE`, `ARCHIVED`), `role` (`STUDENT`, `PROFESSOR`, `PROFESSOR_READ_ONLY` o `GESTOR`), `can_read` y `can_write`.
  - No miembro: 200 con `cohort_status`, `role: null` y los dos flags en `false`. Cursos confirmó que `cohort_status` viene siempre.
  - Cohorte inexistente o desactivada: 404.
  - Está en un PR de Cursos contra `develop` y se publica en su swagger al mergear. `user_id` figura como opcional (el camino de usuario no lo usa); Mercado lo envía siempre.
- **Listados por servicio** (Cursos los entrega en la siguiente rama de su sprint; bloquean [[DEC-024 - Listado Mis mercados]] y la tarea US4-T5):
  - `GET /api/course/course-cohorts?professor_id={uuid}&status=ACTIVE`: cohortes del docente, paginadas, con `professor_role`.
  - `GET /api/course/enrollments?student_id={uuid}`: todas las inscripciones del alumno, con cualquier estado (`VALIDATED`, `PENDING`, `REJECTED`); Mercado filtra `enrollment_status = VALIDATED` y `cohort_status = ACTIVE`.
  - Los dos excluyen los registros dados de baja (`is_active = false`).
- **No se usan:** `/course-cohorts/roster-membership`, `/course-cohorts/me`, `/enrollments/me` ni `GET /course-cohorts/{id}` (redundante con `cohort_status`).
- Parámetros en `snake_case` (`user_id`, `professor_id`, `student_id`), como los define Cursos.

## Alternativas descartadas
- **Cursos responde 404 para toda cohorte que no esté `ACTIVE`**: también resolvía todo en una llamada, pero dejaba la regla de habilitación de Mercado dentro de Cursos. Mercado prefirió recibir `cohort_status` y decidir él ([[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]).
- **Dos llamadas (membresía más `GET /course-cohorts/{id}`)**: duplica la latencia en cada petición.
- **`roster-membership`**: valida otra cosa (la nómina CSV) y no distingue los casos.

## Consecuencias
- Hoy el código llama a `roster-membership` con parámetros supuestos; DEC-022 pide cambiar el cliente a `membership?user_id=` y leer `cohort_status` (US-1 de [[S2-02 - Clientes reales de Cursos]]).
- Hasta que Cursos mergee su PR, las pruebas del cliente fijan el contrato con un servidor HTTP simulado; la prueba contra el ambiente real espera ese merge.
- El registro de servicios de la plataforma debería declarar que Mercado necesita `course.enrollment.read` ([[Mapa de servicios]]).

## Estado de implementación de listados (2026-10-10)

Los dos listados por servicio quedaron implementados en `develop@2fc155ad` (PR #159 de `tpi-market`, US-7382 T01):
- `GatewayCourseListings.studentEnrollments`: invoca `GET /api/course/enrollments?student_id={id}` y filtra `enrollment_status = VALIDATED` y `cohort_status = ACTIVE`.
- `GatewayCourseListings.professorCohorts`: invoca `GET /api/course/course-cohorts?professor_id={id}&status=ACTIVE` con páginas de 50 elementos (`PROFESSOR_COHORTS_PAGE_SIZE = 50`) recorriendo todas las páginas hasta `totalPages`.
- Ambos endpoints utilizan el cliente HTTP del Gateway con interceptor de token de servicio para `course.enrollment.read` y propagan `CourseServiceUnavailableException` (503) ante timeout o códigos 5xx.

## Notas afectadas
[[Integración con Cursos]], [[Mapa de servicios]], [[S2-02 - Clientes reales de Cursos]], [[Decisiones - Índice]].
