## [2026-10-01] ingest | Verificación de puerto y registro de Mercado (Q-016)
- Se verificó contra `tpi-system-compose` upstream (`main`): `market-service` en el puerto 8100 (gestión 8101), equipo `market`, incluido en `GATEWAY_ALLOWLIST` y en la red `tpi-market`. El clon local estaba 96 commits atrás (8092, `g09`).
- [[Q-016 - Puerto y registro de Mercado en la plataforma]] se archivó como hecho verificado, sin `DEC`.
- Notas actualizadas: [[Mapa de servicios]], [[Estado actual del código]], [[Gateway e identidad]], [[Roadmap de trabajo]] (tarea: `pull` y `PORT=8100`).
- Además, [[Q-008 - Orden de la saga de compra]] sigue abierta: se agregó la "Postura de Mercado (2026-10-01)" y una nota técnica (entregar primero exige revocación de ítems en Accounting). También se actualizaron [[Decisiones - Índice]], [[Taller de decisiones]], [[Market Service - Overview]] e [[index]].
