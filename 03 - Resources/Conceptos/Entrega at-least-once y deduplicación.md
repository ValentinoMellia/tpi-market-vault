---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, kafka, deduplicacion]
---
# Entrega at-least-once y deduplicación

> Kafka garantiza que un mensaje llega al menos una vez, no exactamente una; el receptor debe tolerar duplicados.

## El problema que resuelve
Por reintentos o reinicios, el mismo mensaje puede entregarse varias veces. Procesarlo dos veces podría confirmar dos veces una orden.

## Cómo funciona
Cada mensaje trae un identificador único. El receptor registra los ya procesados y descarta repetidos, de forma atómica con el efecto.

## Cómo lo usamos en Mercado
`processed_events` (`entities/ProcessedEventEntity.java`) guarda cada `eventId` consumido en la misma transacción que el efecto. Los mensajes que fallan se reintentan dos veces y luego van a `<topic>.DLT` ([[Eventos y Kafka]]). Complementa a [[Patrón Outbox]] e [[Idempotencia]].

## Relacionado
[[Saga]], [[Orden de compra]].
