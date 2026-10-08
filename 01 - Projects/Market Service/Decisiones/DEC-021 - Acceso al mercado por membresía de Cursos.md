---
tipo: decision
estado: vigente
verificado_contra: codigo@fb5f82d9
actualizado: 2026-10-08
tags: [mercado, decision, cursos, seguridad, roles]
---
# DEC-021 - Acceso al mercado por membresía de Cursos

> En un curso habilitado solo acceden el estudiante con inscripción `VALIDATED` (rol `STUDENT`) y el docente asignado (`PROFESSOR` o `PROFESSOR_READ_ONLY`); escribir ofertas exige `can_write`. El `GESTOR` de Cursos no tiene acceso al mercado y no es el `ADMIN` de Mercado. Volver a validar dentro de la saga de compra queda para el sprint 3.

## Contexto
La membresía de Cursos ([[DEC-022 - Contrato de membresía con Cursos]]) devuelve uno de cuatro roles por cohorte: `STUDENT`, `PROFESSOR`, `PROFESSOR_READ_ONLY` o `GESTOR`, con los flags `can_read` y `can_write`. Hoy el código lo interpreta en `models/enums/CourseMembership.java`, donde `GESTOR` cuenta como docente con escritura, igual que `PROFESSOR`. Además, en las rutas de Mercado el `GESTOR` del JWT está en el mismo grupo que `ADMIN` ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]). Verificado en `develop@fb5f82d9`.

El tratamiento de `GESTOR` estaba planteado como pregunta abierta (Q-024, en un PR del vault todavía sin mergear). La regla de esta decisión la confirmó el PO el 2026-10-08.

## Decisión
Confirmada por el PO el 2026-10-08.

- **Solo importan dos perfiles de Cursos:**
  - **STUDENT** con inscripción `VALIDATED` y activa (`can_read = true`): ve la vitrina y el detalle, y compra.
  - **PROFESSOR** y **PROFESSOR_READ_ONLY** asignados a la cohorte: leen la gestión del catálogo, el detalle y los resúmenes.
- **Escritura:** crear, editar o cambiar el estado de ofertas exige rol `PROFESSOR` con `can_write = true`. Con solo `can_read` (`PROFESSOR_READ_ONLY`) se puede ver, no modificar.
- **GESTOR:** es el gestor del curso en Cursos, **no** es el `ADMIN` de Mercado y **no** tiene acceso al mercado del curso.
- **No miembro** (`role: null`, por ejemplo una inscripción `PENDING`) o rol que no corresponde a la ruta: se rechaza con el error de inscripción o de asignación que ya existe.
- **Todo esto vale solo en un curso habilitado** ([[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]).
- **Saga de compra:** la membresía se valida al crear la orden. Volver a validar la inscripción y el estado de la cohorte dentro de la saga de confirmación y aprovisionamiento queda para el **sprint 3**.

## Alternativas descartadas
- **GESTOR como administrativo global** (lo que hace hoy el grupo `ADMINISTRATIVE_ROLES`) **o como docente por curso** (lo que hace hoy `CourseMembership`): el PO decidió que el gestor de Cursos no participa del mercado.
- **Revalidar en la saga ya en el sprint 2**: técnicamente posible con la membresía por `user_id`, pero el PO la pasó al sprint 3.

## Consecuencias
- Hoy el código trata a `GESTOR` de Cursos como docente con escritura (`CourseMembership.GESTOR`); DEC-021 pide rechazarlo en todas las rutas del curso (US-3 y US-4 de [[S2-02 - Clientes reales de Cursos]]).
- Fuera de alcance de esta decisión: cualquier cambio de comportamiento del `GESTOR` o del `ADMIN` del JWT en rutas sin curso. El flujo de `ADMIN` en `updateOfferStatus` no cambia ([[DEC-017 - Servicios con MS en las rutas de estado de oferta]]).
- Los resúmenes de vitrinas y de ventas piden membresía de lectura por curso y omiten los cursos deshabilitados. Cuando Cursos despliegue el listado por `professor_id`, se reemplaza por una sola consulta (tarea US4-T5).
- Un `X-User-Id` vacío se sigue rechazando antes de llamar a Cursos.

## Notas afectadas
[[Integración con Cursos]], [[Gateway e identidad]], [[DEC-006 - Roles y permisos según el código y los headers del gateway]], [[S2-02 - Clientes reales de Cursos]], [[Decisiones - Índice]].
