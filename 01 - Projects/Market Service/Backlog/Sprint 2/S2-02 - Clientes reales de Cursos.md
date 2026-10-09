---
tipo: historia
estado: borrador
verificado_contra: codigo@fb5f82d9
actualizado: 2026-10-08
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5202"
puntos: 5
prioridad: Must
horas: 22
---
# S2-02 - Clientes reales de Cursos

> Reemplazar los clientes simulados de Cursos por un cliente real sobre `GET /api/course/course-cohorts/{id}/membership?user_id=` con token de servicio, habilitar el mercado solo para cohortes `ACTIVE` y dar acceso solo a alumnos validados y docentes asignados. El 2026-10-08 se replanificó en seis historias técnicas (US-1 a US-6) que reemplazan las tareas T01, T03 y T04; la T02 ya está mergeada.

## Replanificación del 2026-10-08

El PO confirmó las reglas y Cursos cerró el contrato en `tpi-course#87` el 2026-10-08. El plan nuevo vive en el change SDD `courses-real-integration` de `tpi-market` (fase de propuesta completa, especificaciones en curso) y **reemplaza las tareas T01, T03 y T04** de esta historia; la **T02** (token de servicio) ya está mergeada y se reutiliza ([[DEC-023 - Sin mocks de Cursos en el código]]). Las tareas originales se conservan abajo como registro; hay que cerrarlas o reasignarlas en Taiga ([[DEC-015 - Política del backlog de Taiga]]).

Decisiones que lo rigen: [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]], [[DEC-021 - Acceso al mercado por membresía de Cursos]], [[DEC-022 - Contrato de membresía con Cursos]], [[DEC-023 - Sin mocks de Cursos en el código]] y [[DEC-024 - Listado Mis mercados]].

Qué cambia respecto del texto original:

- El endpoint es `membership?user_id=` (servicio a servicio), no `membership` por quien llama ni `roster-membership`.
- `GESTOR` ya no cuenta como docente: no tiene acceso al mercado.
- Una cohorte que no está `ACTIVE` (o no existe) responde 403 `COURSE_MARKET_DISABLED` en todas las rutas del curso, sin solo lectura.
- Los simulados se **eliminan**, no se mueven a `@Profile` dev y test (cambia el CA1 y la T04).
- Se agrega la ruta `GET /api/market/courses` ("Mis mercados").

| Historia | Qué entrega | Tareas | Depende de |
|---|---|---|---|
| US-1 - Cliente real de Cursos | `CourseCohortClient` sobre el Gateway con el token de servicio; `membership?user_id=` con `cohort_status`; timeouts configurables; timeout, 5xx o falla del token dan 503; un 401 invalida el token y reintenta una vez; sin secretos ni `X-User-Id` en logs | US1-T1 a US1-T6 | Contrato acordado |
| US-2 - Mercado habilitado según la cohorte | `requireEnabled(courseId)` en todas las rutas del curso, incluida la vitrina; 403 `COURSE_MARKET_DISABLED`; decidir el destino de `course_closure` (US2-T4) | US2-T1 a US2-T6 | US-1 |
| US-3 - Acceso del alumno | Solo `STUDENT` con `can_read`; vitrina, detalle y creación de la orden | US3-T1 a US3-T3 | US-2 |
| US-4 - Acceso del docente | Lectura con `PROFESSOR` o `PROFESSOR_READ_ONLY`; escritura con `PROFESSOR` y `can_write`; `GESTOR` rechazado; resúmenes por curso | US4-T1 a US4-T5 | US-2; US4-T5 espera el listado por `professor_id` |
| US-5 - Quitar los simulados | Borrar simulados, interfaces y su prueba; migrar unas 20 clases de pruebas; documentar la ejecución local | US5-T1 a US5-T3 | US-3 y US-4 |
| US-6 - Mis mercados | `GET /api/market/courses` → `[{courseId, courseName, role, canManage}]` | US6-T1 a US6-T4 | US-1 y los listados de Cursos (próximo sprint de Cursos) |

Fuera de alcance: revalidar inscripción y estado dentro de la saga de compra (sprint 3) y cualquier cambio de `GESTOR` o `ADMIN` en rutas sin curso. Tamaño estimado de 1.500 a 2.000 líneas: se entrega en PR encadenados por historia.

Estado en el código (`develop@fb5f82d9`): la T01 se mergeó en cuatro partes (PR #128 a #131) con un `GatewayCourseEnrollmentClient` detrás de `market.course.client=gateway` que llama a `roster-membership`; `MockCourseInstructorClient` sigue `@Primary`. Ver [[Integración con Cursos]].

---

## Texto original de Taiga (antes de la replanificación)

### [G11] — Clientes reales de Cursos

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor o estudiante de un curso
- **Quiero**: que Mercado verifique con el servicio de Cursos si estoy inscripto o asignado al curso
- **Para**: que solo los estudiantes inscriptos compren y solo los profesores asignados gestionen la tienda

---

## Notas / Observaciones

- [ ] Reglas de negocio: el courseId de la tienda es la cohorte del curso ([[DEC-013 - Reglas de la tienda]], T3). GET /course-cohorts/{id}/membership devuelve el rol y el nivel de acceso de quien llama: inscripción validada y activa da STUDENT; asignación da GESTOR, PROFESSOR o PROFESSOR_READ_ONLY; si no, 403 ([[Integración con Cursos]]).
- [ ] Validaciones: un PROFESSOR_READ_ONLY no puede publicar ni editar ofertas. 404 o 403 de Cursos significa "no inscripto" o "no asignado".
- [ ] Datos obligatorios: courseId (cohorte), studentId o professorId tomados de X-User-Id, token de servicio con ámbito course.enrollment.read.
- [ ] Performance (tiempos, volumen, límites): timeout de conexión y de lectura acotados (a definir en la tarea 3); cada llamada a la vitrina o a una compra agrega una consulta a Cursos, por lo que se evalúa una caché corta como mejora posterior.
- [ ] Seguridad (roles, permisos, datos sensibles): el token de servicio no se registra en logs ni se expone. El cliente simulado hoy es @Primary sin @Profile: debe quedar solo en dev y pruebas.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: falta confirmar con Cursos qué endpoint corresponde a una consulta servicio a servicio sobre un usuario ajeno (membership responde por quien llama; existe también GET /course-cohorts/roster-membership con token de servicio). Se resuelve en la tarea 1 y se registra en [[Integración con Cursos]].

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: con los perfiles docker y prod no existe ningún bean MockCourseEnrollmentClient ni MockCourseInstructorClient; el contexto arranca con los clientes reales.
- [ ] **CA2**: un estudiante que Cursos reporta como no inscripto recibe 403 con type terminado en student-not-enrolled en GET /api/market/courses/{courseId}/catalog y en POST /api/market/courses/{courseId}/orders.
- [ ] **CA3**: si Cursos no responde dentro del timeout o devuelve 5xx, Mercado responde 503 con course-service-unavailable y no crea ninguna orden.
- [ ] **CA4**: un profesor no asignado recibe 403 professor-not-assigned en POST /api/market/courses/{courseId}/catalog/manage.
- [ ] **Extras (opcional)**: las pruebas del cliente cubren 200, 403, 404, timeout y 500 con un servidor simulado, sin depender del servicio real.

---

## BDD (mínimo 3 escenarios)

**Característica:** Verificación de matrícula y de profesor contra Cursos

**Escenario 1**  

- **Dado**: un estudiante con `X-User-Id` inscripto de forma activa en la cohorte `COURSE_PROG4_2026`
- **Cuando**: llama a `GET /api/market/courses/COURSE_PROG4_2026/catalog`
- **Entonces**: Mercado consulta `GET /course-cohorts/COURSE_PROG4_2026/membership` con el token de servicio, recibe el rol `STUDENT` y responde 200 con las ofertas publicadas

**Escenario 2**  

- **Dado**: un estudiante que Cursos reporta sin inscripción (403)
- **Cuando**: llama a `POST /api/market/courses/{courseId}/orders` con `{offerId, idempotencyKey}`
- **Entonces**: responde 403 `application/problem+json` con `type` `https://tpi.utn.frc/errors/student-not-enrolled` y no se crea ninguna orden

**Escenario 3**  

- **Dado**: el servicio de Cursos no responde dentro del timeout
- **Cuando**: un estudiante abre `GET /api/market/courses/{courseId}/catalog`
- **Entonces**: responde 503 con `type` `.../course-service-unavailable` y `requestId` presente en el cuerpo

**Escenario 4**  

- **Dado**: un profesor sin asignación en la cohorte
- **Cuando**: llama a `POST /api/market/courses/{courseId}/catalog/manage`
- **Entonces**: responde 403 con `type` `.../professor-not-assigned` y la oferta no se crea

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `GET /api/market/courses/{courseId}/catalog`, `POST /api/market/courses/{courseId}/orders`, `GET /api/market/courses/{courseId}/catalog/manage`, `POST /api/market/courses/{courseId}/catalog/manage`; llamada saliente `GET /course-cohorts/{id}/membership`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 5
- **Prioridad (MoSCoW / Numérica)**: Must

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|5|Must|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y `course-service` (Tema 02); registro Eureka.
- Módulos afectados: `clients/CourseEnrollmentClient.java`, `CourseInstructorClient.java`, `clients/impl/MockCourseEnrollmentClient.java`, `MockCourseInstructorClient.java`, `controllers/GlobalExceptionHandler.java`, configuración de seguridad saliente.
- Otros equipos / aprobaciones: Cursos debe confirmar el contrato de `membership`, el uso de `course.enrollment.read` y las credenciales del token de servicio ([[Integración con Cursos]]).
- Impacto en datos / migraciones: ninguno.
- Riesgos y mitigación (opcional): si Cursos no está disponible en el entorno de pruebas, las pruebas de integración usan un servidor simulado y la prueba real queda para [[S2-07 - Pruebas integradas con Accounting]] o la planning. Los centinelas (`student-not-enrolled`, `prof-unassigned`) se conservan solo para dev.

Relación: [[Estado actual del código]] (gaps 2 y 14), [[Roadmap de trabajo]] (P0 4), [[Errores de la API]], [[Gateway e identidad]].

---

## Tareas

### T01 - Implementar los clientes de membership contra Cursos (reemplazada el 2026-10-08)

**Objetivo:** Reemplazar los clientes simulados de matrícula y de profesor por llamadas reales a Cursos.

- Implementar `CourseEnrollmentClient` y `CourseInstructorClient` sobre `GET /course-cohorts/{id}/membership`
- Interpretar el rol devuelto: `STUDENT`, `GESTOR`, `PROFESSOR` o `PROFESSOR_READ_ONLY`
- Confirmar con Cursos el endpoint servicio a servicio (`membership` responde por quien llama) y registrarlo en el vault
- Hecho cuando: un estudiante inscripto y un profesor asignado se validan contra Cursos y el endpoint queda documentado

Estimación: 8 h

### T02 - Obtener y enviar el token de servicio (mergeada, se reutiliza)

**Objetivo:** Autenticar cada llamada a Cursos con un token de servicio.

- Obtener y renovar el token con ámbito `course.enrollment.read`
- Enviarlo en cada llamada; credenciales por variable de entorno
- El token no se registra en logs
- Hecho cuando: cada llamada a Cursos lleva el token vigente y no aparece en los logs

Estimación: 4 h

### T03 - Manejar los errores de Cursos (reemplazada el 2026-10-08)

**Objetivo:** Traducir las respuestas de Cursos a los errores de Mercado.

- Mapear 403 y 404 a `student-not-enrolled` o `professor-not-assigned`
- Mapear timeout y 5xx a 503 `course-service-unavailable` en `GlobalExceptionHandler`
- Timeouts de conexión y de lectura configurables
- Hecho cuando: ante timeout o 5xx Mercado responde 503 y no crea ninguna orden

Estimación: 4 h

### T04 - Probar los clientes y retirar los simulados de docker y prod (reemplazada el 2026-10-08)

**Objetivo:** Verificar los clientes sin depender del servicio real y dejar los simulados solo en dev y pruebas.

- Pruebas con servidor simulado para 200, 403, 404, timeout y 500
- Mover `MockCourseEnrollmentClient` y `MockCourseInstructorClient` a `@Profile` dev y test
- Verificar que no existen como bean en los perfiles `docker` y `prod`
- Hecho cuando: las pruebas pasan en verde y el contexto con perfil `prod` arranca con los clientes reales

Estimación: 6 h
