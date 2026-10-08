---
tipo: decision
estado: vigente
verificado_contra: codigo@fb5f82d9
actualizado: 2026-10-08
tags: [mercado, decision, cursos, backlog]
---
# DEC-023 - Sin mocks de Cursos en el código

> Los clientes simulados de Cursos se eliminan del código productivo, no se mueven a un perfil. Las pruebas simulan el borde HTTP. El nuevo plan reemplaza las tareas T01, T03 y T04 de US-5202; la T02 (token de servicio) ya está mergeada y se reutiliza.

## Contexto
Hoy, en `develop@fb5f82d9`:

- `clients/impl/MockCourseInstructorClient.java` es `@Primary` sin condición: toda asignación de profesor es simulada en todos los perfiles.
- `clients/impl/MockCourseEnrollmentClient.java` ya no es `@Primary`: se registra con `market.course.client=mock`, que es el valor por defecto (`MARKET_COURSE_CLIENT`, `application.properties`). Con `gateway` se usa `GatewayCourseEnrollmentClient` sobre `CourseMembershipResolver` (PR #128 a #131 de `tpi-market`, T01 de US-5202 en cuatro partes).

La historia [[S2-02 - Clientes reales de Cursos]] planeaba, en su T04, mover los simulados a `@Profile` `dev` y `test`.

## Decisión
Confirmada por el PO el 2026-10-08.

- Se **eliminan** `MockCourseEnrollmentClient`, `MockCourseInstructorClient`, las interfaces `CourseEnrollmentClient` y `CourseInstructorClient` y su prueba. No queda ningún bean de Cursos `@Primary`; el contexto arranca solo con el cliente real.
- Las pruebas que dependían de los simulados (unas 20 clases) usan `@MockitoBean` sobre el cliente nuevo o un servidor HTTP simulado.
- En Taiga, el plan nuevo **reemplaza las tareas T01, T03 y T04 de US-5202**. La T02 (token de servicio) ya está mergeada y se reutiliza.
- La documentación de ejecución local indica qué URL y credenciales de Cursos hacen falta, porque ya no hay respaldo simulado.

## Alternativas descartadas
- **Mover los simulados a un perfil `dev`/`test`** (T04 original): mantiene en el código un comportamiento que no es el real y que se puede activar por error.
- **Conservar el interruptor `market.course.client`**: mismo problema, con `mock` como valor por defecto.

## Consecuencias
- Hoy el código conserva los dos simulados y el interruptor; DEC-023 pide quitarlos cuando las historias de acceso ya no los usen (US-5 de [[S2-02 - Clientes reales de Cursos]]).
- La migración de pruebas es grande y puede ir en su propio PR dentro de una cadena.
- Hay que cerrar o reasignar en Taiga las tareas T01, T03 y T04 de US-5202 para no duplicarlas ([[DEC-015 - Política del backlog de Taiga]]).

## Notas afectadas
[[S2-02 - Clientes reales de Cursos]], [[Estado actual del código]], [[Integración con Cursos]], [[Decisiones - Índice]].
