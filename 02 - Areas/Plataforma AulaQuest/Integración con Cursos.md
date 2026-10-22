---
tipo: integracion
estado: vigente
verificado_contra: codigo@2fc155ad, codigo@6695ef1e, equipo-cursos@2026-10-08, equipo-cursos@2026-10-22, tpi-course@5e6ed772
actualizado: 2026-10-22
tags: [mercado, integracion, cursos]
---
# Integración con Cursos

> Cursos decide si el mercado de una cohorte está habilitado y quién puede entrar: Mercado lo consulta como servicio con `membership?user_id=`, y desde US-7382 implementa los listados por servicio para 'Mis mercados'. Además, Cursos avisa por `courses.events` cuando se archiva una cohorte y cuando un estudiante se da de baja o se reactiva; el contrato de la baja quedó acordado el 2026-10-22 (`tpi-course#193`).

## Equipo y responsabilidad
`course-service` (Tema 02, repositorio `tpi-course`) administra cursos, cohortes e inscripciones. Para Mercado es la fuente de verdad sobre el estado de cada cohorte y sobre quién es alumno o docente en ella. El `courseId` de la tienda es la cohorte ([[DEC-013 - Reglas de la tienda]]).

## Reglas de Mercado sobre Cursos
Confirmadas por el PO el 2026-10-08:

| Regla | Decisión |
|---|---|
| El mercado está habilitado solo con la cohorte activa y `cohort_status = ACTIVE`; `DRAFT`, `ARCHIVED`, desactivada o inexistente lo deshabilitan por completo, sin solo lectura. Solo cuenta el estado, no las fechas. Respuesta: 403 `COURSE_MARKET_DISABLED` | [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]] |
| Solo acceden `STUDENT` (inscripción `VALIDATED`) y `PROFESSOR` / `PROFESSOR_READ_ONLY`; escribir exige `can_write`. `GESTOR` no tiene acceso y no es el `ADMIN` de Mercado. La revalidación en la saga queda para el sprint 3 | [[DEC-021 - Acceso al mercado por membresía de Cursos]] |
| Contrato `membership?user_id=` con `cohort_status` y dos listados por servicio | [[DEC-022 - Contrato de membresía con Cursos]] |
| Se eliminan los simulados de Cursos del código | [[DEC-023 - Sin mocks de Cursos en el código]] |
| Ruta nueva `GET /api/market/courses` ("Mis mercados") | [[DEC-024 - Listado Mis mercados]] (implementada en `develop@2fc155ad`) |

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué | Estado |
|---|---|---|---|---|
| Mercado a Cursos | REST por el Gateway, token de servicio con `course.enrollment.read` | `GET /api/course/course-cohorts/{id}/membership?user_id={uuid}` | Estado de la cohorte (`cohort_status`), rol (`STUDENT`, `PROFESSOR`, `PROFESSOR_READ_ONLY`, `GESTOR` o `null`), `can_read`, `can_write`. 404 si la cohorte no existe o está desactivada | Acordado; en un PR de Cursos contra `develop`, se publica al mergear |
| Mercado a Cursos | REST por el Gateway, token con `course.enrollment.read` | `GET /api/course/course-cohorts?professor_id={uuid}&status=ACTIVE` | Cohortes del docente, paginadas | Implementado en Mercado (`GatewayCourseListings`, PR #159) |
| Mercado a Cursos | REST por el Gateway, token con `course.enrollment.read` | `GET /api/course/enrollments?student_id={uuid}` | Inscripciones del alumno, todos los estados (Mercado filtra `VALIDATED` y `ACTIVE`) | Implementado en Mercado (`GatewayCourseListings`, PR #159) |
| Cursos a Mercado | Kafka (`courses.events`) | `COURSE_COHORT_ARCHIVED` | Cancelar las metas colectivas y las subastas abiertas de la cohorte ([[DEC-029 - Meta colectiva]], [[DEC-014 - Reglas de subastas]]) | Implementado en Mercado (`develop@6695ef1e`) |
| Cursos a Mercado | Kafka (`courses.events`) | `STUDENT_UNENROLLED` | Retirar las ofertas del estudiante en las subastas abiertas de la cohorte ([[DEC-014 - Reglas de subastas]]) | Implementado en Cursos; pendiente en Mercado (task #8422 de la US #8398) |
| Cursos a Mercado | Kafka (`courses.events`) | `STUDENT_ENROLLED` | Reactivación de un estudiante dado de baja; ver [[Q-032 - Reinscripción de un postor dado de baja]] | Implementado en Cursos; Mercado no lo consume |

Los dos listados excluyen los registros dados de baja. No se usan `/course-cohorts/roster-membership` (valida la nómina CSV, no la inscripción), `/course-cohorts/me` ni `/enrollments/me` (responden por el usuario autenticado). `courses.events` es uno de los cinco tópicos aprovisionados por la plataforma ([[Mapa de servicios]]).

## Acuerdo con Cursos (`tpi-course#87`)
Mercado pidió el contrato en la issue `tpi-course#87` el 2026-10-08 y Cursos la cerró ese día con todo respondido:

1. `cohort_status` viene siempre en la membresía, también con `role: null`. Mercado eligió esta opción (una llamada, la regla queda en Mercado) en lugar de que Cursos responda 404 para toda cohorte no `ACTIVE`.
2. El contrato (`user_id` uuid, `cohort_status`, `role` *nullable*) está en el `swagger.yaml` del PR de Cursos y se publica al mergear. `user_id` figura como opcional; Mercado lo envía siempre.
3. Los listados por `professor_id` y `student_id` excluyen las bajas y llegan en la siguiente rama del sprint de Cursos; bloquean [[DEC-024 - Listado Mis mercados]] y la tarea US4-T5.

Seguimiento: el merge del PR de Cursos (necesario para probar contra el ambiente real) y el despliegue de los listados.

## Eventos de Cursos para Mercado (`tpi-course#193`)
Mercado pidió el contrato de la baja de un estudiante en la issue `tpi-course#193` el 2026-10-22, para las subastas (US #8398, task #8422), y Cursos respondió ese mismo día. Lo que sigue combina esa respuesta con el código de `tpi-course` (`develop@5e6ed772`: `events/CourseEventTypes.java`, `events/CourseEventPayloads.java`, `services/enrollment/EnrollmentWithdrawalService.java`, `services/enrollment/StudentUnenrolledDispatcher.java`) y su documento de contratos de Kafka. Es el contrato del equipo dueño: vale para el lado de Cursos. Lo que hace Mercado con esos eventos lo deciden las reglas de Mercado.

**Envelope.** Es el estándar de seis campos en snake_case (`event_id`, `event_type`, `event_version`, `timestamp`, `producer`, `payload`), con `producer: "tema-02-cursos-matricula"` y `event_version: 1` en los tres eventos. El nombre `COURSE_ARCHIVED` que aparece en notas anteriores nunca existió: el evento real es `COURSE_COHORT_ARCHIVED`.

| Evento | Key | Payload (snake_case) | Cuándo se emite |
|---|---|---|---|
| `STUDENT_UNENROLLED` | `enrollment_id` | `enrollment_id`, `course_cohort_id`, `student_id`, `reason`, `performed_by_user_id`, `unenrolled_at` (ISO-8601 UTC). Todos los ids son UUID | Después del commit de una baja auditada (`POST /enrollments/{id}/withdraw`) de una matrícula `VALIDATED` o `PENDING` |
| `STUDENT_ENROLLED` | `enrollment_id` | `enrollment_id`, `course_cohort_id`, `student_id`, `validation_type` (`ROSTER_MATCH` o `MANUAL_TEACHER`), `enrolled_at` | Cuando se valida una matrícula y cuando se reactiva (`POST /enrollments/{id}/reactivate`) una matrícula `VALIDATED` dada de baja |
| `COURSE_COHORT_ARCHIVED` | `course_cohort_id` | `course_cohort_id`, `course_base_id`, `actor_id`, `user_ids`, `archived_at` | Después del commit del archivado (`ACTIVE` → `ARCHIVED`) |

Detalles que importan a Mercado:
- **Identidad.** `student_id` es el `user_id` de Usuarios, el mismo UUID que el `sub` del JWT. `course_cohort_id` es siempre la cohorte, que es el `courseId` de Mercado. Ningún evento trae `course_id`.
- **Alias.** `STUDENT_UNENROLLED` también serializa `user_id` (igual a `student_id`) y `actor_id` (igual a `performed_by_user_id`), y `STUDENT_ENROLLED` serializa `user_id`. Son alias para Notificaciones: los campos canónicos son `student_id` y `performed_by_user_id`.
- **Quién lo dispara.** La baja solo existe para estudiantes: los docentes se desasignan con `PROFESSOR_UNASSIGNED`. Una entrada del padrón que todavía no se registró (`student_roster`) no tiene `student_id` y su baja no emite el evento.
- **Matrícula `PENDING`.** El código de Cursos emite `STUDENT_UNENROLLED` también al dar de baja una matrícula `PENDING`, como dice la respuesta de la issue. El documento de contratos de Cursos todavía dice que solo aplica a matrículas `VALIDATED`, pero está desactualizado. Para Mercado no cambia nada: un estudiante `PENDING` no tiene acceso al mercado ([[DEC-021 - Acceso al mercado por membresía de Cursos]]), así que no tiene ofertas que retirar.
- **Archivado.** Archivar la cohorte emite **solo** `COURSE_COHORT_ARCHIVED`, sin una baja por estudiante. Una vez archivada, Cursos rechaza nuevas bajas y reactivaciones en esa cohorte (`ArchivedCohortGuard`).
- **Reintentos.** Cursos reintenta la publicación hasta tres veces con el mismo envelope, así que el `event_id` no cambia y se puede deduplicar por él.
- **Orden.** Kafka ordena por key. Las bajas y altas de una misma matrícula llegan en orden (`STUDENT_ENROLLED` → `STUDENT_UNENROLLED` → `STUDENT_ENROLLED`), pero no hay orden garantizado respecto de `COURSE_COHORT_ARCHIVED`, que usa otra key. Una baja confirmada antes del archivado puede llegar después del archivado.
- **Reactivación.** `STUDENT_ENROLLED` lleva en `enrolled_at` la fecha de la matrícula original, no la de la reactivación. Reactivar una matrícula `PENDING` no emite evento. Cursos sugiere que el estudiante reactivado vuelva a poder pujar y que sus ofertas anteriores no se restauren. Eso choca con el hold único por subasta de Accounting: ver [[Q-032 - Reinscripción de un postor dado de baja]].

**Qué hará Mercado con `STUDENT_UNENROLLED`** (task #8422, todavía sin código):
- Busca las ofertas del estudiante en las subastas `OPEN` de esa cohorte, las retira y la subasta sigue para los demás ([[DEC-014 - Reglas de subastas]], [[Subasta]]).
- **No envía un release.** Accounting libera por su cuenta los holds `PENDING` del alumno dado de baja, con `ACCOUNT_DEACTIVATED`, y publica un `HOLD_RELEASED` por hold con `correlation_id` nulo. Si Mercado mandara su propio release, habría una doble liberación. Mercado resuelve ese `HOLD_RELEASED` por `hold_id`. Así lo acordaron Mercado y Accounting en la issue `tpi-market#200` (2026-10-17), y reemplaza el "un release por retención" que planteaba la consulta a Cursos. Ver [[Integración con Accounting]].
- Deduplica por `event_id`. Si la cohorte ya está archivada, no hace nada, porque `COURSE_COHORT_ARCHIVED` ya canceló esas subastas.

## Estado actual en el código
Verificado en `develop@2fc155ad` (PR #159) y `develop@fb5f82d9` de `tpi-market`:

- **Listados de Cursos y 'Mis mercados':** implementados en `develop@2fc155ad` (PR #159, US-7382 T01-T04). `CourseCohortClient` / `GatewayCourseCohortClient` delega en `GatewayCourseListings` las llamadas HTTP a `/enrollments?student_id=` y `/course-cohorts?professor_id=&status=ACTIVE` (paginado de a 50 elementos) con token de servicio `course.enrollment.read`. `MyMarketsServiceImpl` combina y deduplica las cohortes activas (prevaleciendo docente sobre estudiante y `canManage=true` sobre solo lectura), y `MyMarketsController` expone `GET /api/market/courses` con `@PreAuthorize("hasAnyRole('STUDENT', 'PROFESSOR')")`.
- **Asignación de profesor:** `clients/impl/MockCourseInstructorClient.java` es `@Primary` sin condición; siempre `true` salvo el centinela `prof-unassigned`. `CourseInstructorClient` todavía no tiene implementación real; el único cliente HTTP hacia Cursos es el de inscripción (abajo).
- **Inscripción:** el interruptor `market.course.client` (`MARKET_COURSE_CLIENT`, por defecto `mock`) elige entre `MockCourseEnrollmentClient` y `GatewayCourseEnrollmentClient`. El real usa `clients/impl/CourseMembershipResolver.java`, que llama a `/api/course/course-cohorts/roster-membership?courseCohortId=&userId=` con un contrato supuesto, y `models/enums/CourseMembership.java`, que trata a `GESTOR` como docente con escritura.
- **Cohorte archivada** (verificado en `develop@6695ef1e`): `listeners/CoursesEventsKafkaListener.java` consume `courses.events` con un grupo propio y deja pasar solo `COURSE_COHORT_ARCHIVED`. `listeners/CoursesEventHandler.java` manda al DLT un evento mal formado y deduplica por `event_id`. En una misma transacción cancela las metas de la cohorte (`GoalClosureService`, US-9476) y sus subastas abiertas (`AuctionArchiveService`, US-8398 T02, PR #271). La tabla `course_closure` y `CourseClosureServiceImpl` ya no existen (`db/manual/US7362__drop_course_closure.sql`). `STUDENT_UNENROLLED` y `STUDENT_ENROLLED` todavía no se consumen: el handler los ignora.

Hoy el código hace todo eso; las decisiones del 2026-10-08 piden: cliente sobre `membership?user_id=` ([[DEC-022 - Contrato de membresía con Cursos]]), mercado deshabilitado por completo fuera de `ACTIVE` ([[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]), `GESTOR` sin acceso ([[DEC-021 - Acceso al mercado por membresía de Cursos]]) y sin simulados ([[DEC-023 - Sin mocks de Cursos en el código]]). El trabajo está en [[S2-02 - Clientes reales de Cursos]].

## Acuerdos pendientes
- Declarar `course.enrollment.read` como necesidad de Mercado en el registro de servicios ([[Mapa de servicios]]).
- Reinscripción de un postor dado de baja: [[Q-032 - Reinscripción de un postor dado de baja]].
- Pedirle a Cursos que actualice su documento de contratos: `STUDENT_UNENROLLED` también se emite para matrículas `PENDING`.
- **Meta colectiva** ([[DEC-029 - Meta colectiva]]):
  - Mercado necesita la lista de alumnos del curso, para los avisos a todo el curso y para mostrarle al profesor quiénes no aportaron. Hoy solo consulta la membresía de un alumno puntual.
  - Las metas de una cohorte archivada ya se cancelan con `COURSE_COHORT_ARCHIVED` (ver "Estado actual en el código"). Accounting libera los holds por su cuenta.

Resueltos el 2026-10-22: el tópico es `courses.events` y el evento de baja es `STUDENT_UNENROLLED` (sección `tpi-course#193`). `course_closure` y `CourseEventHandler` se retiraron (US-7362).

## Recomendación del taller del equipo
D12: verificar matrícula y asignación del profesor vía Cursos ([[Taller de decisiones]]). Para subastas, S5, confirmada en [[DEC-014 - Reglas de subastas]]: al archivarse un curso se cancelan sus subastas abiertas y al darse de baja un estudiante se retiran sus ofertas.

## Relacionado
[[Gateway e identidad]], [[Estado actual del código]], [[Roadmap de trabajo]].
