## [2026-10-20] ingest | Listado de subastas abiertas (tpi-market PR #247)

- Ingest del PR #247 de `tpi-market` (US-5347 T04, Task-5351): `GET /api/market/courses/{courseId}/auctions`, con subastas `OPEN` no vencidas ordenadas por cierre, autorización por membresía del curso y `AuctionListItemDto` con `best_bid` e `in_final_phase`. Rama `feature/tema-09-subastas-t04`, commit `cb46bb18e`, 7 tests nuevos y `mvn verify` completo en verde (6.261 tests).
- Notas tocadas: [[S3-01 - Subastas, lanzar y ver las abiertas]] (sección "Estado de implementación" con el detalle de las 6 tareas), [[Estado actual del código]] (dos filas nuevas en la tabla de endpoints, corrección de Flyway desde US-9727 T01 y `V12`/`V13` de subastas) y [[Subasta]] ("Dónde vive en el código" deja de decir "No existe").
- Sin cambios en Taiga: el cierre de la Task-5351 y los reacomodos de US y tasks quedan pendientes de aprobación del usuario.
