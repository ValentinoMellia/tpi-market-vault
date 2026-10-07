## [2026-10-05] ingest | Contrato de avisos de compra contra develop 9b4c05f9
- [[Contrato de avisos de compra]] verificado contra `develop` en `9b4c05f9`: ya están mergeados `orderRef` (PR #88), `PURCHASE_CONFIRMED` en `market.events` (PR #88), productor `market-service` (PR #102), el manejo de `LIFE_PURCHASE_REJECTED` (PR #96) y la validación del tope de vidas antes del hold (PR #97). La tabla de diferencias con el código y las dependencias con #5193 quedan al día.
- `PURCHASE_FAILED` suma el motivo obligatorio `LIFE_CAP_REACHED` (seis motivos) y la tabla de estados usa el estado `REJECTED` de #5193 T07, que sigue en rama sin mergear.
- `LIFE_PURCHASE_REJECTED` sigue fuera de la versión 1: la orden queda `CONFIRMED` con la marca `SETTLED_UNCREDITED` y el alumno ya recibió `PURCHASE_CONFIRMED`.
- [[Integración con Notificaciones]]: el tópico y el productor de `PURCHASE_CONFIRMED` ya coinciden con el contrato.
