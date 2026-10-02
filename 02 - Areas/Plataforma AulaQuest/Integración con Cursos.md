---
tipo: integracion
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, integracion, cursos]
---
# Integración con Cursos

> Mercado necesita saber si un estudiante está inscripto en un curso y si un profesor está asignado. Hoy ambas respuestas son simuladas.

## Equipo y responsabilidad
`course-service` (Tema 02) administra cursos, cohortes e inscripciones. Expone, entre otros, `GET /enrollments/me`, `GET /course-cohorts/me`, `GET /course-cohorts/{id}/membership`, `GET /course-cohorts/{id}/professors`, `GET /course-cohorts/{id}/enrollments` y `GET /course-cohorts/roster-membership` (token de servicio, ámbito `course.enrollment.read`).

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Mercado a Cursos (previsto) | REST | `GET /course-cohorts/{id}/membership` | Rol y nivel de acceso de quien llama: inscripción validada y activa da STUDENT; asignación da GESTOR, PROFESSOR o PROFESSOR_READ_ONLY; si no, 403 |
| Cursos a Mercado (previsto) | Kafka (`courses.events`) | `COURSE_ARCHIVED`, `STUDENT_UNENROLLED` | Cerrar ofertas o subastas |

## Estado actual en el código
Solo hay `MockCourseEnrollmentClient` y `MockCourseInstructorClient`, siempre `@Primary`: devuelven `true` salvo centinelas (`student-not-enrolled`, `prof-unassigned`). No se consumen eventos de Cursos. El endpoint `membership` es el mejor candidato para ambas verificaciones, pero no está validado con el equipo.

`courses.events` es uno de los cinco tópicos aprovisionados por la plataforma ([[Mapa de servicios]]).

## Recomendación del taller del equipo
D12: verificar matrícula y asignación del profesor vía Cursos (la recomendación completa no se extrajo; ver [[Taller de decisiones]]). Para subastas, S5, confirmada en [[DEC-014 - Reglas de subastas]], establece que Mercado consume eventos de Cursos y libera sus propios holds: al archivarse un curso se cancelan sus subastas abiertas y al darse de baja un estudiante se retiran sus ofertas y la subasta continúa ([[DEC-014 - Reglas de subastas]]). La historia US-1036 "verificar matrícula" se cita como implementada contra el cliente simulado ([[Q-013 - Higiene del backlog]]).

## Acuerdos pendientes
Confirmar `membership` como contrato; declarar `course.enrollment.read` en el registro de servicios; nombre real del tópico ([[DEC-008 - Nombre de productor y tópicos de Mercado]], el repositorio usa `courses.events`); comportamiento al archivar, ya decidido en [[DEC-014 - Reglas de subastas]] (se cancelan las subastas abiertas del curso).

## Relacionado
[[Gateway e identidad]], [[Estado actual del código]], [[Roadmap de trabajo]].
