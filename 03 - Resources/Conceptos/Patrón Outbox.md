---
tipo: concepto
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [concepto, outbox, kafka]
---
# Patrón Outbox

> Guardar el mensaje a enviar en la misma transacción que el cambio de datos, y enviarlo después con un proceso aparte.

## El problema que resuelve
Si se actualiza la base y luego se publica en Kafka, un fallo entre ambos pasos deja datos y mensajes inconsistentes (cambio sin mensaje, o mensaje sin cambio).

## Cómo funciona
El mensaje se escribe en una tabla `outbox` dentro de la misma transacción. Un relevador lee las filas pendientes, las publica y las marca como procesadas. Garantiza entrega al menos una vez, por lo que el receptor debe deduplicar ([[Entrega at-least-once y deduplicación]]).

## Cómo lo usamos en Mercado
Tabla `outbox_events` (`entities/OutboxEventEntity.java`); `OutboxRelayJob` cada 2 segundos, clave `studentId`, se detiene en el primer fallo. Detalle en [[Eventos y Kafka]]. Alimenta la [[Saga]] de la [[Orden de compra]].

## Relacionado
[[Idempotencia]].
