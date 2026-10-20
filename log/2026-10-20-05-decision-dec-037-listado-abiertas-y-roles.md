## [2026-10-20] decision | DEC-037 - listado de abiertas y coincidencia de roles

- Valentino Mellia (equipo de Mercado) decidió en la sesión de la Task-8409 dos ampliaciones de [[DEC-037 - GESTOR como docente en las subastas]]: el listado de subastas abiertas del curso también admite al `GESTOR` como docente, y en todas las rutas de subastas el rol del JWT debe coincidir con el rol de la membresía de Cursos (si no coincide, se rechaza como a un docente no asignado; `ADMIN` conserva su acceso).
- Se editó la decisión directamente porque aún no está mergeada; no hay enmienda aparte.
- Notas tocadas: [[DEC-037 - GESTOR como docente en las subastas]] y [[Subasta]].
