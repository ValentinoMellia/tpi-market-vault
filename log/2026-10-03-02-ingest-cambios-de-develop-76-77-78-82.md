## [2026-10-03] ingest | Cambios de develop desde 7528610 (PR #76, #77, #78 y #82)
- Se incorporaron las cuatro PR mergeadas desde `7528610` hasta `276af52`: formato de cable `snake_case` (#76), endpoint de resumen de vitrinas (#77), `LIFE_PURCHASE_CONFIRMED` (#78) y métrica de vidas omitidas con `itemType` en la orden (#82).
- Notas tocadas: [[Estado actual del código]] (endpoint nuevo, sección de cambios desde `7528610`, gaps 25 y 26 y anotaciones en los gaps 6, 10, 12, 21 y 23), [[Eventos y Kafka]], [[Errores de la API]].
- El resto de [[Estado actual del código]] sigue verificado contra `7528610`; no se re-verificó.
- Pendiente: no se verificó que la PR pareja del frontend de #76 se haya mergeado ni que Accounting consuma `LIFE_PURCHASE_CONFIRMED`.
