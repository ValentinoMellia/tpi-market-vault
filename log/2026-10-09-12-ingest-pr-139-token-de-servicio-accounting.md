## [2026-10-09] ingest | PR #139 de tpi-market: token de servicio para Accounting con accounting.account.read (US-5193 T09)
- Fuente: PR #139 de `tpi-market` (Taiga #7598, US-5193 T09; responde la issue #126 de Accounting), mergeado en `develop` el 2026-10-09 (`6926af1`, aprobado y mergeado por tommikimmel). Verificado contra `develop@6926af1`.
- [[Integración con Accounting]]: nueva sección «Token de servicio para Accounting (issue 126)», que cubre:
  - por qué Accounting exige el scope y el registro de la plataforma (`needs`);
  - el mecanismo único de token, la configuración `market.service-token.accounting-*`, los errores (un 401 se reintenta una vez, un 403 nunca) y lo eliminado;
  - la confirmación en la issue.
  Se actualizan además la tabla de rutas REST, la fila «Vidas actuales» de los acuerdos del 2026-10-04, la fila «Consulta de hold», el punto 7 del mensaje del 2026-10-01, las brechas (nueva: `equip-summary` apagado en producción de Accounting) y los acuerdos pendientes (el token deja de figurar como pendiente).
- [[Estado actual del código]]: nueva actualización del 2026-10-09 con el PR #139. La tabla de clientes, el gap 1, el gap 5 y el párrafo de `gatewayRestClient` dejan de citar `IdentityServiceTokenClient` y `ACCOUNTING_SERVICE_TOKEN`.
- [[Roadmap de trabajo]]: fila 3 y P1, con una nueva línea «Token de servicio para Accounting» y el pendiente de `course.enrollment.read` para Cursos.
- [[Hold de monedas]]: la consulta de estado usa el token compartido; la lista de archivos cambia `IdentityServiceTokenClient` por `ServiceTokenConfig`.
- [[S2-OPC1 - Reconciliación de compras]]: los estados históricos aclaran que `IdentityServiceTokenClient` y su test se eliminaron en el PR #139.
- [[S2-11 - Acuerdos de compra de vidas con Accounting]]: el riesgo del token configurado a mano queda resuelto; el mock sigue por defecto porque Accounting tiene `equip-summary` apagado en producción.
- [[Gateway e identidad]]: las llamadas entre servicios pueden exigir el scope de la operación, declarado en los `needs` del registro.
- `node scripts/lint-vault.mjs` sin errores.
