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
[[DEC-021 - Acceso al mercado por membresía de Cursos]] descartó tratar al `GESTOR` como docente por curso: en el mercado solo importan `STUDENT`, `PROFESSOR` y `PROFESSOR_READ_ONLY`. La US #8394 (borradores de subasta, tarea T02, Task-8409) necesita que el gestor de una cohorte pueda administrar las subastas de ese curso, y CA5 pide que el `GESTOR` no obtenga permisos de `ADMIN`. La pregunta de fondo es [[Q-024 - Qué es el rol GESTOR]], que sigue abierta para las rutas sin curso.

La decisión la tomó Valentino Mellia, integrante del equipo de Mercado (G11), el 2026-10-20 durante la sesión de trabajo de la Task-8409. No es una confirmación del PO. Sus respuestas textuales fueron: "GESTOR como profesor", "cambiarlo y dejarlo sentado en el vault" y "DEC nueva aprobada".

## Decisión
- **Alcance:** las rutas de subastas de un curso: lanzar, borradores, editar, programar, cancelar, detalle y listado de staff.
- **GESTOR = docente de la cohorte.** El rol `GESTOR` de la membresía de Cursos se trata igual que `PROFESSOR`:
  - **Lectura:** exige `can_read = true`.
  - **Escritura:** exige `can_write = true`. Sin `can_write` el `GESTOR` es de solo lectura, igual que `PROFESSOR_READ_ONLY`.
- **Rol del JWT:** el `GESTOR` del JWT y del gateway se admite en esas rutas, pero siempre se contrasta con la membresía de Cursos de la cohorte. Tener el rol en el JWT no alcanza.
- **Sin permisos de ADMIN:** el `GESTOR` nunca obtiene los permisos de `ADMIN` (CA5 de US-8394). No hay bypass de membresía para él.
- **Fuera de alcance:** el resto del mercado (ofertas, metas, vitrinas y resúmenes) sigue como lo dejó [[DEC-021 - Acceso al mercado por membresía de Cursos]], sin cambios.

## Alternativas descartadas
- **Mantener DEC-021 también en subastas** (el `GESTOR` sin acceso): impide que el gestor de una cohorte administre sus subastas, que es lo que pide la US #8394.
- **GESTOR como administrativo global** (grupo de `ADMIN`): contradice CA5 de US-8394 y el modelo de Cursos, donde el gestor lo es de una cohorte.

## Consecuencias
- Requiere un cambio de código en `tpi-market`, rama `feature/tema-09-subastas-borradores-t02` (Task-8409): un gate de subastas separado de `requireProfessor`, que trate al `GESTOR` de la membresía como docente.
- El comportamiento difiere a propósito entre las subastas y el resto del mercado: en las subastas el `GESTOR` actúa como docente; en ofertas, metas, vitrinas y resúmenes sigue sin acceso por [[DEC-021 - Acceso al mercado por membresía de Cursos]].
- [[Q-024 - Qué es el rol GESTOR]] sigue abierta para las rutas sin curso; esta decisión solo la responde en parte, para las subastas.
- Hoy el código ya cuenta a `GESTOR` como docente con escritura en `CourseMembership`; el gate de subastas debe respetar `can_write` y no abrir permisos de `ADMIN`.

## Notas afectadas
[[DEC-021 - Acceso al mercado por membresía de Cursos]], [[Q-024 - Qué es el rol GESTOR]], [[Subasta]], [[Integración con Cursos]], [[Decisiones - Índice]].
