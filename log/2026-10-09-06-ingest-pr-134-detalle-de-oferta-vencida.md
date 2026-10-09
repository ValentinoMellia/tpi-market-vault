## [2026-10-09] ingest | PR #134 de tpi-market: el detalle de una oferta vencida responde 409 (US-5219 T04)
- Fuente: PR #134 de `tpi-market` (T04 #5223 de [[S2-05 - Robustez de la compra]]), mergeado en `develop` el 2026-10-08 (`8b23425e`, aprobado por 412102-PRESSET y tommikimmel, mergeado por tommikimmel). Verificado contra `develop@8b23425e`.
- [[S2-05 - Robustez de la compra]]: T04 en *Ready for test* en «Estado en Taiga», sección «Lo que dejó la T04» (defecto verificado, cómo queda, solo para el alumno, pruebas, revisión del PR, efecto en el frontend, qué hacer al traer `develop` al PR #113) y línea de avance en la tarea; la observación de validaciones deja de decir "sin verificar".
- [[Estado actual del código]]: el gap 18 pasa a titularse como resuelto desde el PR #134 y describe el defecto en pasado, como el gap 8.
- [[Q-015 - Reglas de la tienda]] (archivada): seguimiento en la fila T6, que era cierto y quedó resuelto.
- [[Oferta de catálogo]]: el ciclo de vida dice que el detalle de una oferta vencida le responde 409 al alumno; se quita de «Reglas decididas, pendientes de implementar» la línea "hoy responde 200".
- [[Errores de la API]]: `catalog-offer-expired` también sale del detalle de la oferta.
- `node scripts/lint-vault.mjs` sin errores.
