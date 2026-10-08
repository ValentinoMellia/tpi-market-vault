---
tipo: decision
estado: vigente
verificado_contra: codigo@fb5f82d9
actualizado: 2026-10-08
tags: [mercado, decision, cursos, seguridad]
---
# DEC-020 - Mercado habilitado solo con la cohorte ACTIVE

> El mercado de una cohorte está habilitado solo si Cursos la informa activa y con `cohort_status = ACTIVE`. Una cohorte en `DRAFT` o `ARCHIVED`, desactivada o inexistente deshabilita el mercado por completo, sin modo de solo lectura, y Mercado responde 403 `COURSE_MARKET_DISABLED`.

## Contexto
Hoy el código decide si un curso está "abierto" solo con la tabla local `course_closure`, que llena el evento `COURSE_COHORT_ARCHIVED` de `courses.events` (`listeners/CourseEventHandler.java`). `services/impl/CourseClosureServiceImpl.requireOpen` lanza `CourseClosedException` (403) si el curso figura cerrado, y deja el mercado del curso cerrado en solo lectura: lo llaman la gestión del catálogo (`CourseCatalogManageServiceImpl`, alta, edición y cambios de estado) y la validación de la compra (`PurchaseValidationServiceImpl`), pero no la vitrina. Una cohorte en `DRAFT` o desactivada nunca emite ese evento, así que su mercado queda abierto. Verificado en `develop@fb5f82d9`.

No había una `Q-NNN` en `main` para este punto: la regla la confirmó el PO el 2026-10-08 al revisar la propuesta SDD `courses-real-integration` de `tpi-market` y el contrato de [[DEC-022 - Contrato de membresía con Cursos]].

## Decisión
Confirmada por el PO el 2026-10-08.

- **Habilitado:** la cohorte existe, está activa (`is_active = true`) y Cursos informa `cohort_status = ACTIVE`.
- **Deshabilitado por completo:** `DRAFT`, `ARCHIVED`, cohorte desactivada o inexistente (Cursos responde 404). No se puede ver nada, ni siquiera en solo lectura: vitrina, detalle de oferta, gestión del catálogo, resúmenes y compra. Para `ARCHIVED` esto **reemplaza** el comportamiento actual de solo lectura.
- **Solo cuenta el estado que informa Cursos.** Mercado no evalúa `start_date` ni `end_date`.
- **Respuesta:** 403 con código `COURSE_MARKET_DISABLED`, documentado en el OpenAPI de Mercado. El chequeo va antes de cualquier otro en todas las rutas `courses/{courseId}`.
- **Falla cerrada:** si Cursos no responde, la petición termina en 503 y nunca se permite.

## Alternativas descartadas
- **Mantener la solo lectura para `ARCHIVED`** (lo que hace hoy `requireOpen`): el PO prefiere que un curso archivado no muestre su mercado.
- **Evaluar también las fechas de la cohorte**: duplica una regla que es de Cursos; el estado alcanza.
- **Que Cursos responda 404 para toda cohorte no `ACTIVE`**: deja la regla de negocio de Mercado dentro de Cursos. Se eligió recibir `cohort_status` y decidir en Mercado ([[DEC-022 - Contrato de membresía con Cursos]]).
- **Seguir solo con el evento `COURSE_COHORT_ARCHIVED`**: no cubre `DRAFT` ni las cohortes desactivadas.

## Consecuencias
- Hoy el código hace `requireOpen` sobre `course_closure` y deja la vitrina sin chequeo; DEC-020 pide un chequeo de disponibilidad contra Cursos en todas las rutas del curso (US-2 de la propuesta, [[S2-02 - Clientes reales de Cursos]]).
- La disponibilidad sale de la misma llamada de membresía que usa [[DEC-021 - Acceso al mercado por membresía de Cursos]]: una sola consulta a Cursos por petición.
- El destino de la tabla `course_closure`, de `CourseEventHandler` y de `DevCourseClosureController` (conservarlos como rechazo local rápido o eliminarlos) queda para la fase de diseño (tarea US2-T4).
- Las especificaciones de `tpi-market` que describen un mercado cerrado en solo lectura necesitan un delta `MODIFIED`.
- [[DEC-014 - Reglas de subastas]] no cambia: al archivarse un curso se cancelan sus subastas abiertas.

## Notas afectadas
[[Integración con Cursos]], [[S2-02 - Clientes reales de Cursos]], [[Estado actual del código]], [[Decisiones - Índice]].
