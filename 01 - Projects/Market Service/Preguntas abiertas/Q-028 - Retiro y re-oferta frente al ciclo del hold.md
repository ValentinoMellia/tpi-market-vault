---
tipo: pregunta
estado: archivado
verificado_contra: equipo-mercado@2026-10-17, equipo-accounting@2026-10-17
actualizado: 2026-10-17
tags: [mercado, pregunta-abierta, subastas, accounting, holds]
---
# Q-028 - Retiro y re-oferta frente al ciclo del hold

> Resuelta por [[DEC-032 - Retiro definitivo y contrato de holds de subastas]]: retiro con devolución sin cobro y sin volver a pujar. El intercambio anterior se conserva como historia; AUCTION_BID_WITHDRAWN sigue pendiente de entrega en Accounting.

## Resolución vigente

Resuelta por [[DEC-032 - Retiro definitivo y contrato de holds de subastas]]: retiro con devolución y sin re-oferta. La entrega de AUCTION_BID_WITHDRAWN sigue pendiente en Accounting; ver [[Seguimiento con Accounting - Subastas y holds]].

## Qué se contradice

Accounting cita RF-INT-05 sin retiro y propone un hold por cuenta/subasta. El usuario informa que Hernán confirmó cambiar el PRD. No se aportó aquí la versión revisada del PRD ni una respuesta de Accounting a la aclaración técnica posterior. [[Seguimiento con Accounting - Subastas y holds]] conserva el alcance de los mensajes.

## Restricción documentada

[[Flujos de compra directa y subasta]] S1/S3 reutiliza PENDING con HOLD_INCREASE_REQUESTED / HOLD_INCREASED. S4 libera al retirar; el contrato documentado mantiene UNIQUE(account_id, order_id). No está documentado que aumentar reactive RELEASED. No hace falta otro hold para cada mejora de una puja activa.

## Qué hay que definir

- Alinear retiro y re-oferta con Accounting, respetando el requisito actualizado.
- Cómo representar la nueva participación después de liberar, sin asumir reapertura ni inventar identificadores.
- Motivo y confirmación de liberación por retiro; límites de fase y efecto sobre la mejor oferta.
- Resolver concurrencia y respuestas tardías durante retiro y reingreso.

## Quién decide

Mercado y Hernán confirman el alcance funcional; Accounting define su contrato y acuerda el mecanismo con Mercado. Retirar una puja no cancela toda la subasta ni equivale a bajar una puja activa.

## Estado anterior a la decisión (histórico)

Estaba pendiente durante el intercambio anterior; sustituido por la resolución vigente de arriba. No resuelve [[Q-025 - Desempate de las subastas]].

## Relacionado

[[Subasta]], [[Integración con Accounting]], [[Flujos de compra directa y subasta]], [[Seguimiento con Accounting - Subastas y holds]].
