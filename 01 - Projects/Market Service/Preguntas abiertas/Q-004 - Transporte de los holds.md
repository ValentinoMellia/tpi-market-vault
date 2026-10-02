---
tipo: pregunta
estado: archivado
verificado_contra: DEC-003
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, accounting, kafka]
---
# Q-004 - Transporte de los holds

> ¿Mercado pide los holds a Accounting (ex Banco) de forma síncrona por el gateway o solo por Kafka? **Resuelta**: solo Kafka, ver [[DEC-003 - Holds solo por Kafka]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Sincrónico | Los holds se piden vía gateway | Contexto de Sprint 1 |
| Solo Kafka | Sin REST para holds | Diagramas, flujos y contrato del equipo dueño |

## Decisión previa del equipo
Los holds van **solo por Kafka, sin REST**. Evidencia: accounting no tiene REST de holds de monedas (solo `GET /life-holds/{id}`) y el código de Mercado usa Kafka con outbox. Confirmada el 2026-10-01 en [[DEC-003 - Holds solo por Kafka]].

## Qué hace hoy el código
Kafka con [[Patrón Outbox]]: comandos a `accounting.holds.commands`, respuestas desde `accounting.holds.events` (esos nombres de tópico no coinciden con accounting, ver [[Q-006 - Naming de eventos y topics]]). No hay cliente REST (`clients/impl/OutboxBankHoldClient.java`).

## Opciones
1. **Kafka (código y accounting).** Desacopla; la respuesta es asíncrona.
2. **REST síncrono.** Respuesta inmediata, pero accounting no lo ofrece.

## Recomendación
Opción 1, adoptada. Ver [[Integración con Accounting]] y [[Hold de monedas]].

## Quién decide / con qué equipo hay que hablar
Mercado, con confirmación de Accounting.

## Resolución
Cerrada el 2026-10-01: el líder del equipo de Mercado confirmó que los holds van solo por Kafka. Ver [[DEC-003 - Holds solo por Kafka]]. Pregunta archivada.
