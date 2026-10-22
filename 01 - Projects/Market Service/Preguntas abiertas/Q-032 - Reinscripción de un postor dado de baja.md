---
tipo: pregunta
estado: en-disputa
verificado_contra: equipo-cursos@2026-10-22, tpi-course@5e6ed772, codigo@6695ef1e
actualizado: 2026-10-22
tags: [mercado, pregunta-abierta, subastas, cursos, accounting]
---
# Q-032 - Reinscripción de un postor dado de baja

> Si un estudiante con oferta en una subasta abierta se da de baja y después Cursos lo reactiva en la misma cohorte, ¿puede volver a pujar en esa subasta? Cursos sugiere que sí, pero Accounting admite un solo hold por estudiante y subasta, y ese hold ya quedó liberado por la baja.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Cursos (`tpi-course#193`, 2026-10-22) | La reactivación (`POST /enrollments/{id}/reactivate`) emite `STUDENT_ENROLLED`. "El estudiante queda nuevamente habilitado para pujar en las subastas de esa cohorte", y las ofertas canceladas durante la baja no se restauran solas | [[Integración con Cursos]] |
| Accounting | Un hold por cuenta y `order_id` para siempre: no se puede crear otro ni reactivar uno liberado. En las subastas, `order_id` es el id de la subasta | [[Subasta]] ("Contrato con Accounting" y "Abierto"), [[DEC-014 - Reglas de subastas]] (alternativas descartadas) |
| [[DEC-014 - Reglas de subastas]] | La baja retira las ofertas del estudiante y la subasta sigue. No dice nada de una reinscripción | Decisión del 2026-10-01 |
| [[DEC-021 - Acceso al mercado por membresía de Cursos]] | Accede al mercado el `STUDENT` con matrícula `VALIDATED`. Después de la reactivación, la membresía vuelve a habilitarlo | Decisión del 2026-10-08 |

Lo que dice Cursos vale para su lado (cuándo emite `STUDENT_ENROLLED`). Si el estudiante reactivado puede volver a pujar lo deciden las reglas de Mercado. Con el contrato de Accounting tal como está, en una subasta donde ya tenía hold el nuevo `HOLD_CREATE_REQUESTED` sería rechazado con `HOLD_ALREADY_EXISTS`.

## Qué hace hoy el código
En `develop@6695ef1e`, Mercado no consume `STUDENT_UNENROLLED` ni `STUDENT_ENROLLED`: `listeners/CoursesEventHandler.java` solo atiende `COURSE_COHORT_ARCHIVED`. Tampoco existe todavía el camino para ofertar (task #8412 de la US #8395).

## Opciones
1. **Puede pujar en las subastas donde no tenía oferta, pero no en las que tenía al darse de baja.** Mercado lo bloquea antes de pedir el hold y `HOLD_ALREADY_EXISTS` queda como defensa en Accounting. Respeta el contrato de Accounting sin cambios. Desventaja: Mercado tiene que recordar en qué subastas participó cada estudiante dado de baja.
2. **Puede volver a pujar en todas, incluidas las que tenía.** Es lo que sugiere Cursos. Desventaja: exige que Accounting acepte otro hold para la misma cuenta y subasta, o un `order_id` distinto por participación. Accounting ya rechazó algo equivalente para el reingreso después de un retiro voluntario (conversación `tpi-market#200`).
3. **No puede pujar en ninguna subasta que ya estuviera abierta cuando se dio de baja**, solo en las que se abran después. Es más simple de explicar, pero es más restrictiva que lo que hace falta para respetar el contrato.

## Recomendación
La opción 1: es la única que no requiere cambios de contrato con Accounting, y es el mismo bloqueo previo al hold que Mercado le planteó a Accounting para el retiro voluntario sin reingreso (`tpi-market#200`). Queda sin decidir hasta que el equipo lo confirme.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado. Solo hay que hablar con Accounting si se elige la opción 2. Cursos no necesita cambiar nada: su evento ya trae `enrollment_id`, `course_cohort_id` y `student_id`.

## Resolución
Pendiente.
