## [2026-10-04] ingest | Revisión del PR #92 de tpi-market (US-5214 T02)
- Ingeridas las revisiones de Patinio y tommikimmel sobre el PR #92. El PR #86 (T01) se mergeó en `develop` el 2026-10-03.
- [[DEC-017 - Servicios con MS en las rutas de estado de oferta]]: suma las dos correcciones de la revisión (ámbitos de servicio con forma de rol y `userId` vacío) y deja para la T03 y la T04 los GET de detalle de la vitrina. Verificado contra `codigo@5e9de7d`.
- [[S2-04 - Seguridad]] y [[Gateway e identidad]]: actualizados con esas correcciones y con lo derivado a la T03 y la T04. `node scripts/lint-vault.mjs` sin errores.
