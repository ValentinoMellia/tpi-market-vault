## [2026-10-20] ingest | Transiciones DRAFT y SCHEDULED de la subasta (tpi-market PR #252)

- Se ingirió la Task-8408 de la US #8394 (tpi-market `5d5950dfc`, PR #252 a `develop`, sin mergear): el código aplica las transiciones de preparación del diagrama de estados del spike y la regla de que una subasta `SCHEDULED` exige `scheduledStartAt`.
- Transiciones implementadas: `DRAFT` → `SCHEDULED`/`OPEN`/`CANCELLED`, `SCHEDULED` → `OPEN`/`CANCELLED` y `OPEN` → `CANCELLED` (DEC-014). Las de cierre y liquidación quedan sin definir hasta la US #8397.
- Se registran como pendientes, sin convertirlos en regla: desprogramar o reprogramar, limpiar `scheduledStartAt` al abrir y crear directamente en `SCHEDULED`. La ratificación de DRAFT/SCHEDULED del spike #5256 sigue pendiente según la US.
- Notas tocadas: [[Subasta]] (sección "Estados" y "Dónde vive en el código").
