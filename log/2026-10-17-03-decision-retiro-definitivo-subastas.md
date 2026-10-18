## [2026-10-17] decision | Retiro definitivo y respuesta publicada
- [Comentario aprobado y publicado](https://github.com/2026-P4-BE/tpi-market/issues/200#issuecomment-6244678432).
- Creada [[DEC-032 - Retiro definitivo y contrato de holds de subastas]] y archivada [[Q-028 - Retiro y re-oferta frente al ciclo del hold]]. Retiro devuelve disponible sin cobro y excluye definitivamente; aumento reutiliza PENDING.
- Actualizados [[Subasta]], [[Integración con Accounting]], [[Flujos de compra directa y subasta]], [[Seguimiento con Accounting - Subastas y holds]], [[S2-09c - SPIKE Diseño técnico de subastas]], [[DEC-014 - Reglas de subastas]] y [[Decisiones - Índice]].
- Aceptados TTL configurable de 16 días y rechazo de confirmaciones vencidas; contrastados AsyncAPI 2.1.0 y HOLD_INCREASED. AUCTION_BID_WITHDRAWN sigue pendiente en enum. ITEM_CREDIT_FAILED es implementación informada por Accounting, sin verificar aquí el productor.
- Sin cambios en Taiga, código, snapshot adjunto ni acuerdos de meta colectiva.
