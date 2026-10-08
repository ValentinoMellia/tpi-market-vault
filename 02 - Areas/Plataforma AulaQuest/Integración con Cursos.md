---
tipo: integracion
estado: vigente
verificado_contra: equipo-cursos@2026-10-08
actualizado: 2026-10-08
tags: [mercado, integracion, cursos]
---
# Integración con Cursos

> Cursos decide si el mercado de una cohorte está habilitado y quién puede entrar: Mercado lo consulta como servicio con `membership?user_id=`, que devuelve el estado de la cohorte, el rol y los permisos en una sola llamada. El contrato quedó acordado el 2026-10-08; hoy el código todavía usa un camino provisorio y simulados.

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
| Ruta nueva `GET /api/market/courses` ("Mis mercados") | [[DEC-024 - Listado Mis mercados]] |

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué | Estado |
|---|---|---|---|---|
| Mercado a Cursos | REST por el Gateway, token de servicio con `course.enrollment.read` | `GET /api/course/course-cohorts/{id}/membership?user_id={uuid}` | Estado de la cohorte (`cohort_status`), rol (`STUDENT`, `PROFESSOR`, `PROFESSOR_READ_ONLY`, `GESTOR` o `null`), `can_read`, `can_write`. 404 si la cohorte no existe o está desactivada | Acordado; en un PR de Cursos contra `develop`, se publica al mergear |
| Mercado a Cursos | REST | `GET /api/course/course-cohorts?professor_id={uuid}&status=ACTIVE` | Cohortes del docente, paginadas | Confirmado; siguiente rama del sprint de Cursos |
| Mercado a Cursos | REST | `GET /api/course/enrollments?student_id={uuid}` | Inscripciones del alumno, todos los estados (Mercado filtra `VALIDATED` y `ACTIVE`) | Confirmado; siguiente rama del sprint de Cursos |
| Cursos a Mercado | Kafka (`courses.events`) | `COURSE_COHORT_ARCHIVED` | Hoy marca el curso como cerrado en `course_closure` | Implementado en Mercado |
| Cursos a Mercado (previsto) | Kafka (`courses.events`) | Baja de un estudiante | Retirar sus ofertas de subasta ([[DEC-014 - Reglas de subastas]]) | Pendiente |

Los dos listados excluyen los registros dados de baja. No se usan `/course-cohorts/roster-membership` (valida la nómina CSV, no la inscripción), `/course-cohorts/me` ni `/enrollments/me` (responden por el usuario autenticado). `courses.events` es uno de los cinco tópicos aprovisionados por la plataforma ([[Mapa de servicios]]).

## Acuerdo con Cursos (`tpi-course#87`)
Mercado pidió el contrato en la issue `tpi-course#87` el 2026-10-08 y Cursos la cerró ese día con todo respondido:

1. `cohort_status` viene siempre en la membresía, también con `role: null`. Mercado eligió esta opción (una llamada, la regla queda en Mercado) en lugar de que Cursos responda 404 para toda cohorte no `ACTIVE`.
2. El contrato (`user_id` uuid, `cohort_status`, `role` *nullable*) está en el `swagger.yaml` del PR de Cursos y se publica al mergear. `user_id` figura como opcional; Mercado lo envía siempre.
3. Los listados por `professor_id` y `student_id` excluyen las bajas y llegan en la siguiente rama del sprint de Cursos; bloquean [[DEC-024 - Listado Mis mercados]] y la tarea US4-T5.

Seguimiento: el merge del PR de Cursos (necesario para probar contra el ambiente real) y el despliegue de los listados.

## Estado actual en el código
Verificado en `develop@fb5f82d9` de `tpi-market`:

- **Asignación de profesor:** `clients/impl/MockCourseInstructorClient.java` es `@Primary` sin condición; siempre `true` salvo el centinela `prof-unassigned`. No hay cliente real.
- **Inscripción:** el interruptor `market.course.client` (`MARKET_COURSE_CLIENT`, por defecto `mock`) elige entre `MockCourseEnrollmentClient` y `GatewayCourseEnrollmentClient`. El real usa `clients/impl/CourseMembershipResolver.java`, que llama a `/api/course/course-cohorts/roster-membership?courseCohortId=&userId=` con un contrato supuesto, y `models/enums/CourseMembership.java`, que trata a `GESTOR` como docente con escritura.
- **Curso cerrado:** `services/impl/CourseClosureServiceImpl.requireOpen` rechaza con `CourseClosedException` (403) si el curso está en la tabla `course_closure`, que llena `COURSE_COHORT_ARCHIVED` (`listeners/CourseEventHandler.java`). Deja el mercado cerrado en solo lectura y la vitrina no lo chequea.

Hoy el código hace todo eso; las decisiones del 2026-10-08 piden: cliente sobre `membership?user_id=` ([[DEC-022 - Contrato de membresía con Cursos]]), mercado deshabilitado por completo fuera de `ACTIVE` ([[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]), `GESTOR` sin acceso ([[DEC-021 - Acceso al mercado por membresía de Cursos]]) y sin simulados ([[DEC-023 - Sin mocks de Cursos en el código]]). El trabajo está en [[S2-02 - Clientes reales de Cursos]].

## Acuerdos pendientes
- Declarar `course.enrollment.read` como necesidad de Mercado en el registro de servicios ([[Mapa de servicios]]).
- Destino de `course_closure` y de `CourseEventHandler` con la nueva regla: se decide en la fase de diseño (tarea US2-T4).
- Nombre real del tópico ([[DEC-008 - Nombre de productor y tópicos de Mercado]], el repositorio usa `courses.events`) y evento de baja de estudiante para subastas.

## Recomendación del taller del equipo
D12: verificar matrícula y asignación del profesor vía Cursos ([[Taller de decisiones]]). Para subastas, S5, confirmada en [[DEC-014 - Reglas de subastas]]: al archivarse un curso se cancelan sus subastas abiertas y al darse de baja un estudiante se retiran sus ofertas.

## Relacionado
[[Gateway e identidad]], [[Estado actual del código]], [[Roadmap de trabajo]].
