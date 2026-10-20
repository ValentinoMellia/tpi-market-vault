---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-20
actualizado: 2026-10-20
tags: [mercado, decision, subastas, seguridad, roles]
---
# DEC-037 - GESTOR como docente en las subastas

> En las rutas de subastas de un curso, el `GESTOR` de la membresía de Cursos se trata exactamente como un docente de la cohorte: lee con `can_read` y escribe solo con `can_write = true`. Nunca recibe permisos de `ADMIN`. Enmienda [[DEC-021 - Acceso al mercado por membresía de Cursos]] únicamente para las subastas.

## Contexto
[[DEC-021 - Acceso al mercado por membresía de Cursos]] descartó tratar al `GESTOR` como docente por curso: en el mercado solo importan `STUDENT`, `PROFESSOR` y `PROFESSOR_READ_ONLY`. Durante la Task-8409 (US #8394, borradores de subasta, tarea T02) el equipo decidió que el gestor de una cohorte administre las subastas de ese curso. La US no lo exige; su CA5 solo pide que el `GESTOR` no obtenga permisos de `ADMIN`. La pregunta de fondo es [[Q-024 - Qué es el rol GESTOR]], que sigue abierta para las rutas sin curso.

La decisión la tomó Valentino Mellia, integrante del equipo de Mercado (G11), el 2026-10-20 durante la sesión de trabajo de la Task-8409. No es una confirmación del PO. Sus respuestas textuales fueron: "GESTOR como profesor", "cambiarlo y dejarlo sentado en el vault" y "DEC nueva aprobada". En la misma sesión, y sobre esta misma decisión, respondió "Incluirlo" (el listado de subastas abiertas del curso también admite al `GESTOR`) y "Exigir coincidencia" (el rol del JWT debe coincidir con el de la membresía).

## Decisión
- **Alcance:** las rutas de subastas de un curso: lanzar, borradores, editar, programar, cancelar, detalle, listado de staff y listado de subastas abiertas del curso (`GET .../courses/{courseId}/auctions`), que también admite al `GESTOR` como docente.
- **GESTOR = docente de la cohorte.** El rol `GESTOR` de la membresía de Cursos se trata igual que `PROFESSOR`:
  - **Lectura:** exige `can_read = true`.
  - **Escritura:** exige `can_write = true`. Sin `can_write` el `GESTOR` es de solo lectura, igual que `PROFESSOR_READ_ONLY`.
- **Rol del JWT:** tener el rol en el JWT no alcanza. En todas las rutas de subastas el rol del JWT debe coincidir con el rol de la membresía de Cursos de la cohorte: la membresía `GESTOR` solo con rol `GESTOR` en el JWT; la membresía `PROFESSOR` o `PROFESSOR_READ_ONLY` solo con rol `PROFESSOR` en el JWT. Un JWT con ambos roles se acepta con cualquiera de esas membresías. Si no coinciden, se rechaza igual que a un docente no asignado. `ADMIN` conserva su acceso.
- **Sin permisos de ADMIN:** el `GESTOR` nunca obtiene los permisos de `ADMIN` (CA5 de US-8394). No hay bypass de membresía para él.
- **Fuera de alcance:** el resto del mercado (ofertas, metas, vitrinas y resúmenes) sigue como lo dejó [[DEC-021 - Acceso al mercado por membresía de Cursos]], sin cambios.

## Alternativas descartadas
- **Mantener DEC-021 también en subastas** (el `GESTOR` sin acceso): el equipo eligió que el gestor de una cohorte pueda administrar sus subastas.
- **GESTOR como administrativo global** (grupo de `ADMIN`): contradice CA5 de US-8394 y el modelo de Cursos, donde el gestor lo es de una cohorte.

## Consecuencias
- Requiere un cambio de código en `tpi-market`, rama `feature/tema-09-subastas-borradores-t02` (Task-8409): un gate de subastas separado de `requireProfessor`, que trate al `GESTOR` de la membresía como docente.
- El comportamiento difiere a propósito entre las subastas y el resto del mercado: en las subastas el `GESTOR` actúa como docente; en ofertas, metas, vitrinas y resúmenes sigue sin acceso por [[DEC-021 - Acceso al mercado por membresía de Cursos]].
- [[Q-024 - Qué es el rol GESTOR]] sigue abierta para las rutas sin curso; esta decisión solo la responde en parte, para las subastas.
- Según [[DEC-021 - Acceso al mercado por membresía de Cursos]] (verificado en `develop@fb5f82d9`), `CourseMembership` cuenta a `GESTOR` como docente con escritura, mientras que el gate compartido `CourseMembershipServiceImpl#requireProfessor` lo rechaza; el gate de subastas debe respetar `can_write` y no abrir permisos de `ADMIN`.

## Notas afectadas
[[DEC-021 - Acceso al mercado por membresía de Cursos]], [[Q-024 - Qué es el rol GESTOR]], [[Subasta]], [[Integración con Cursos]], [[Decisiones - Índice]].
