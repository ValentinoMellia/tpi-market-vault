---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: ""
puntos: 5
prioridad: Must
horas: 22
---
# S2-02 - Clientes reales de Cursos

> Reemplazar los clientes simulados de matrícula y de asignación de profesor por clientes reales de Cursos, usando `GET /course-cohorts/{id}/membership` y un token de servicio. Hoy toda inscripción es simulada, incluso en producción. 4 tareas, 22 h, 5 puntos, Must.

## [G11] — Clientes reales de Cursos

---

## Descripción (Como / Quiero / Para)

- **Como**: profesor o estudiante de un curso
- **Quiero**: que Mercado verifique con el servicio de Cursos si estoy inscripto o asignado al curso
- **Para**: que solo los estudiantes inscriptos compren y solo los profesores asignados gestionen la tienda

---

## Notas / Observaciones

- [ ] Reglas de negocio: el `courseId` de la tienda es la cohorte del curso ([[DEC-013 - Reglas de la tienda]], T3). `GET /course-cohorts/{id}/membership` devuelve el rol y el nivel de acceso de quien llama: inscripción validada y activa da `STUDENT`; asignación da `GESTOR`, `PROFESSOR` o `PROFESSOR_READ_ONLY`; si no, 403 ([[Integración con Cursos]]).
- [ ] Validaciones: un `PROFESSOR_READ_ONLY` no puede publicar ni editar ofertas. 404 o 403 de Cursos significa "no inscripto" o "no asignado".
- [ ] Datos obligatorios: `courseId` (cohorte), `studentId` o `professorId` tomados de `X-User-Id`, token de servicio con ámbito `course.enrollment.read`.
- [ ] Performance (tiempos, volumen, límites): timeout de conexión y de lectura acotados (a definir en la tarea 3); cada llamada a la vitrina o a una compra agrega una consulta a Cursos, por lo que se evalúa una caché corta como mejora posterior.
- [ ] Seguridad (roles, permisos, datos sensibles): el token de servicio no se registra en logs ni se expone. El cliente simulado hoy es `@Primary` sin `@Profile`: debe quedar solo en dev y pruebas.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica (historia de backend).
- [ ] Otros: falta confirmar con Cursos qué endpoint corresponde a una consulta servicio a servicio sobre un usuario ajeno (`membership` responde por quien llama; existe también `GET /course-cohorts/roster-membership` con token de servicio). Se resuelve en la tarea 1 y se registra en [[Integración con Cursos]].

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: con los perfiles `docker` y `prod` no existe ningún bean `MockCourseEnrollmentClient` ni `MockCourseInstructorClient`; el contexto arranca con los clientes reales.
- [ ] **CA2**: un estudiante que Cursos reporta como no inscripto recibe 403 con `type` terminado en `student-not-enrolled` en `GET /api/market/courses/{courseId}/catalog` y en `POST /api/market/courses/{courseId}/orders`.
- [ ] **CA3**: si Cursos no responde dentro del timeout o devuelve 5xx, Mercado responde 503 con `course-service-unavailable` y no crea ninguna orden.
- [ ] **CA4**: un profesor no asignado recibe 403 `professor-not-assigned` en `POST /api/market/courses/{courseId}/catalog/manage`.
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

| # | Tarea | Horas | Descripción breve |
|---|---|---|---|
| 1 | Cliente de membership | 8 | Implementar `CourseEnrollmentClient` y `CourseInstructorClient` contra `GET /course-cohorts/{id}/membership`; confirmar con Cursos el endpoint servicio a servicio |
| 2 | Token de servicio | 4 | Obtener y renovar el token con ámbito `course.enrollment.read` y enviarlo en cada llamada; credenciales por variable de entorno |
| 3 | Manejo de errores | 4 | Mapear 403 y 404 a "no inscripto" o "no asignado", y timeout o 5xx a `course-service-unavailable` (503); timeouts configurables |
| 4 | Tests | 6 | Pruebas del cliente con servidor simulado; los clientes simulados pasan a `@Profile` dev/test y se verifica que no existen en `docker` y `prod` |
