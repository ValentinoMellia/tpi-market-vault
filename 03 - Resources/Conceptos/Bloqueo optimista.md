---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, concurrencia]
---
# Bloqueo optimista

> Detecta modificaciones concurrentes con un número de versión en lugar de bloquear filas.

## El problema que resuelve
Dos procesos modifican el mismo registro a la vez y uno pisa al otro sin enterarse.

## Cómo funciona
Cada registro tiene una versión. Al guardar se comprueba que siga siendo la leída; si cambió, la operación falla y se reintenta o se informa el conflicto.

## Cómo lo usamos en Mercado
`OrderEntity` tiene `@Version` (`entities/OrderEntity.java`). El stock se descuenta con una operación atómica en base de datos (`OfferStockServiceImpl`), probada en `OfferStockConcurrencyTest`. Las subastas previstas también usan versión ([[Subasta]]). Ver [[Orden de compra]] y [[Oferta de catálogo]].

## Relacionado
[[Idempotencia]].
