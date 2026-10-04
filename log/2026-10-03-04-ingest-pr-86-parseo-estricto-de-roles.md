## [2026-10-03] ingest | PR #86 de tpi-market: parseo estricto de roles (US-5214 T01)
- Ingerido el PR #86 de `tpi-market` (T01 #5215 de [[S2-04 - Seguridad]], todavía sin mergear) y la revisión de Valentino Mellia del mismo día. El código descripto como actual se verificó contra `develop@276af52`.
- Nuevas preguntas: [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]] (los dos cambios de conducta que propone el PR y que DEC-006 no cubre) y [[Q-021 - Principal de servicio MS en las reglas de negocio]] (un servicio con `MS` es rechazado en `PATCH /offers/{id}/status` y pasa sin chequeo en la ruta del curso). Se salta Q-019 porque está usada en una rama sin mergear.
- [[Gateway e identidad]]: corregido que el respaldo `X-Roles` estaba en el filtro (está en cuatro controladores); descripto el cambio en revisión; queda `en-disputa` por Q-020 y Q-021.
- [[Estado actual del código]]: el gap 12 suma lo verificado, el caso explotable (`PROFESSOR, SYSTEMS`) y el avance del PR #86.
- [[S2-04 - Seguridad]]: nueva sección *Estado en Taiga* con el avance de las cuatro tareas, el pedido para la T02 y la coordinación con el PR #85 de `tpi-market`.
- [[DEC-006 - Roles y permisos según el código y los headers del gateway]]: seguimiento en Consecuencias, sin modificar la decisión. [[Decisiones - Índice]]: Q-020 y Q-021 en las preguntas abiertas.
