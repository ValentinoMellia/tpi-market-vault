## [2026-10-03] query | Revisión de PRs abiertas de tpi-market
- Se revisaron las PR #84, #85, #86 y #88 de `tpi-market` contra `develop` (`276af52`) y las reglas del repositorio. Resultado en [[Revisión de PRs abiertas (2026-10-03)]].
- Hallazgos principales: #85 repite el `contains()` de roles que corrige #86; #88 no resuelve el tópico compartido `accounting.events`; el `test` de CI falla por la imagen de Kafka de `KafkaSagaIntegrationTest`; javadoc generado en PR de trabajo.
- Pregunta nueva: [[Q-019 - Formato del resumen de ventas para Administración]].
- Notas tocadas: [[Revisión de PRs abiertas (2026-10-03)]], [[Q-019 - Formato del resumen de ventas para Administración]], [[S2-01 - Contrato con Accounting]], [[S2-04 - Seguridad]], [[Revisión del Sprint 2 en Taiga]], [[Sprint 2 - Índice]], [[Roadmap de trabajo]], [[Git workflow]], [[Gateway e identidad]], [[Integración con Accounting]].
- Las pruebas que declaran los autores de las PR no se re-ejecutaron. No se crearon `DEC`: las decisiones tomadas en código quedaron listadas como pendientes de formalizar.
