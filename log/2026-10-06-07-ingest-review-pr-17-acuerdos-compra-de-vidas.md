## [2026-10-06] ingest | Correcciones de la review de la PR 17 (acuerdos de compra de vidas, US-6268)
- Verificado contra `tpi-market` `develop` (`74e671ef`), con las cinco PRs de US-6268 ya mergeadas.
- Cupo de vidas: el código suma las vidas de las órdenes de vidas propias en vuelo (`livesInFlight`, `OrderRepository.sumLivesInFlight`) y no usa `reservedLives`. Se agregan el segundo mensaje del 422 y el BDD. Notas: [[S2-11 - Acuerdos de compra de vidas con Accounting]], [[Integración con Accounting]], [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[Orden de compra]].
- `ExternalOrderId` pasa a llamarse `ExternalId` y valida también `studentId` y `courseId` (400 si se pasan de 36 caracteres).
- Se saca "pendiente de merge" de [[Estado actual del código]] (gap 5) y de [[Q-002 - Vidas y tope de vidas]].
- El listener de `accounting.events` descarta primero por `producer` y después enruta por `eventType`.
- Origen de los acuerdos en DEC-007: Accounting los propuso el 2026-10-03 y Mercado los aceptó con US-6268. Falta que Tema 11 ratifique `LIFE_PURCHASE_REJECTED` en `contratos-kafka`.
- Menores: en [[Integración con Backoffice]], la frase sobre los tópicos aprovisionados vuelve al párrafo de PAR-12; en [[Sprint 2 - Índice]], los totales pasan a 318 h y 79 tareas.
