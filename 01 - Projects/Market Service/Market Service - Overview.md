---
tipo: indice
estado: vigente
verificado_contra: DEC-012
actualizado: 2026-10-04
tags: [mercado, overview]
---
# Market Service - Overview

> Mercado (`market-service`, Tema 09; en Taiga, grupo G11) es el servicio de AulaQuest donde los profesores publican ofertas de items para su curso y los estudiantes las compran con monedas. Esta nota es la puerta de entrada al proyecto.

## Qué es Mercado

Es la vitrina y el mostrador de la plataforma. Un profesor elige una [[Plantilla base]] (escudo, boost de XP, boost de monedas o vida), la configura y la publica como [[Oferta de catálogo]] de su curso. Un estudiante inscripto la compra: Mercado coordina con Accounting (ex Banco) el cobro de las monedas y la entrega del item mediante una [[Saga]], y le informa el resultado.

## Qué hace y qué no hace

Mercado **no es dueño del inventario, de las vidas ni de las monedas**: los tres pertenecen a Accounting ([[DEC-001 - Accounting es dueño del inventario]], [[Integración con Accounting]]).

| Mercado sí es responsable de | Mercado no es responsable de (otros equipos) |
|---|---|
| Catálogo de plantillas y ofertas por curso | Inventario y mochila del estudiante (Accounting, [[DEC-001 - Accounting es dueño del inventario]]) |
| Orden de compra y su ciclo de vida ([[Orden de compra]]) | Saldo de monedas y libro contable (Accounting) |
| Coordinar el hold de monedas ([[Hold de monedas]]) | Contador y tope de vidas (Accounting aplica y reporta; Mercado valida antes del hold de forma preventiva y reacciona, [[DEC-007 - Tope de vidas, Accounting decide y reporta]]) |
| Idempotencia de la compra y stock opcional ([[DEC-002 - Stock opcional por oferta]]) | Resolver efectos de los items al resolver un desafío (escudos en Accounting, multiplicadores en el motor de desafíos, [[DEC-010 - Los efectos de los ítems no son de Mercado]]) |
| Avisar que se confirmó la entrega del item (`ITEM_CONFIRMED`) y publicar `PURCHASE_CONFIRMED` | Notificaciones al usuario ([[Integración con Notificaciones]]) |

## Jerarquía de verdad en una línea

Decisiones registradas, luego el código (el de cada equipo para su propio lado, incluido accounting), luego el PRD, luego el contrato del equipo dueño y el resto. Detalle en `AGENTS.md`. Las 33 recomendaciones del taller del equipo **no son decisiones** salvo las que se indican como confirmadas: [[Taller de decisiones]].

## Equipo y vecinos

Mercado es el Tema 09 y, en Taiga, el grupo G11. Accounting (ex Banco) es el Tema 08 y, en Taiga, el grupo G12; Backoffice el Tema 12, Notificaciones el Tema 11, Roadmap el Tema 10, Cursos el Tema 02 y Users el Tema 01. Detalle en [[Mapa de servicios]].

## Mapa de la información

- Cómo usar este vault (con y sin agente, y flujo de PR): [[Guía del vault y la LLM wiki]].
- Qué hace el código hoy: [[Estado actual del código]].
- Cómo aprender el tema: [[Roadmap de entendimiento]]. Qué hacer después: [[Roadmap de trabajo]].
- Dudas abiertas: [[Q-008 - Orden de la saga de compra]] y [[Q-013 - Higiene del backlog]]; el resto está archivado, listado en [[index]].
- Decisiones: [[Decisiones - Índice]] (DEC-001 a DEC-013) y [[Taller de decisiones]] (qué recomendaciones están decididas).
- Propuestas de producto: [[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]].
- Backlog: [[Backlog - Índice]].
- Plataforma: [[Mapa de servicios]], [[Gateway e identidad]], [[Integración con Accounting]].
- Dominio: [[Plantilla base]], [[Oferta de catálogo]], [[Orden de compra]], [[Hold de monedas]], [[Tipos de item]], [[Subasta]], [[Vencimiento de items]].
- Convenciones: [[Eventos y Kafka]], [[Errores de la API]], [[Git workflow]], [[Calidad de código]].
- Conceptos y vocabulario: [[Glosario]], [[Saga]], [[Patrón Outbox]], [[Idempotencia]].
- Historia de ideas: [[Ideas descartadas]].

## Alcance por fases

- Sprint 1: catálogo ([[Épica 090 - Catálogo por plantillas]]) y compra directa ([[Épica 137 - Compra directa]]).
- Fase 3: [[Épica 577 - Subastas]] (qué se subasta depende de la propuesta [[Ítems únicos]]; cierra el tiempo o un profesor, [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]).
- Descartada: [[Épica 770 - Vencimiento de items]]; los ítems no vencen ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).
