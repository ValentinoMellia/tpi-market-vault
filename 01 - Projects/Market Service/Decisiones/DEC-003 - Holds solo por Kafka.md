---
tipo: decision
estado: vigente
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, accounting, kafka, hold]
---
# DEC-003 - Holds solo por Kafka

> Mercado pide, confirma y libera los holds de monedas a Accounting únicamente por Kafka. No hay REST de escritura para holds.

## Contexto
El contexto de Sprint 1 asumía que los holds se pedían de forma síncrona por el gateway. Los diagramas, los flujos y el contrato del equipo dueño decían solo Kafka. Accounting no tiene REST de escritura de holds de monedas, y el código de Mercado usa Kafka con [[Patrón Outbox]]. Pregunta de origen: [[Q-004 - Transporte de los holds]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01:

- Los comandos de hold (`HOLD_CREATE_REQUESTED`, `HOLD_CONFIRM_REQUESTED`, `HOLD_RELEASE_REQUESTED`) y sus respuestas viajan solo por Kafka.
- La única lectura REST prevista es la consulta de estado `GET /api/accounting/holds/{holdId}`, que sirve para reconciliar y no para pedir holds. Está en implementación del lado de Accounting ([[Integración con Accounting]]).

## Alternativas descartadas
- **REST síncrono por el gateway**: respuesta inmediata, pero Accounting no lo ofrece y acoplaría la compra a la disponibilidad del servicio.

## Consecuencias
- No se construye un cliente REST de holds en Mercado. `OutboxBankHoldClient` sigue siendo el camino.
- Los nombres de los tópicos se alinean según [[DEC-008 - Nombre de productor y tópicos de Mercado]] y el contrato según [[DEC-009 - Contrato de holds e ítems según Accounting]].
- La consulta de estado pendiente de Accounting se incorpora al integrarse (tarea en [[Roadmap de trabajo]]).

## Notas afectadas
[[Hold de monedas]], [[Integración con Accounting]], [[Eventos y Kafka]], [[Taller de decisiones]], [[Decisiones - Índice]].
