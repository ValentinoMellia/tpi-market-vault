## [2026-10-02] ingest | PR #82 de tpi-market: métrica de vidas omitidas y tipo de ítem en la orden
- Origen: PR #82 de `tpi-market` (cierra los issues #79 y #81, review del PR #78, US-5899), verificado contra el commit `6e8b7fc` y, ya mergeado (`276af52`), contra `develop` en `349c8e2`.
- [[Estado actual del código]]: nueva sección "Confirmación de compra y métricas" (eventos al confirmar, métrica `market.life_purchase.event_skipped` registrada en 0 e incrementada después del commit, regla de alerta, `itemType` guardado en la orden). Se corrigieron los tópicos según el PR #88: holds en `accounting.events` y eventos de la orden, incluido `ITEM_CONFIRMED`, en `market.events`.
- [[Orden de compra]]: campo `itemType` en la tabla de datos.
