---
tipo: pregunta
estado: archivado
verificado_contra: DEC-008
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, kafka, convenciones]
---
# Q-006 - Naming de eventos y topics

> Hay varias convenciones de nombres de eventos, tópicos y productores en circulación; la plataforma aprovisionó un conjunto distinto del que usa el código de Mercado. **Resuelta**: ver [[DEC-008 - Nombre de productor y tópicos de Mercado]].

## Qué se contradice
| Tema | Posturas | Dónde aparecía |
|---|---|---|
| Estilo de eventos | `SNAKE_CASE` (decisión de Mercado) contra `HYPHEN-CASE` (estándar de plataforma) | Decisiones anteriores y estándar de Notificaciones |
| Comandos o hechos | Tópicos de comandos contra "los eventos son hechos, nunca comandos" | Estándar de plataforma |
| Regla de tópicos | Regla de plataforma: **un dominio = un tópico `<dominio>.events`** | Contrato de Kafka de la plataforma (v5) |
| Tópicos de holds | `bank.holds.*` y `accounting.holds.*` (propuestas) contra `accounting.events` (el que existe) | Documentos y código de ambos lados |
| Tópicos de Cursos | `courses.lifecycle`, `cursos.ciclo-vida`, `course-events`; el repositorio real usa `courses.events` | Documentos y repositorio de Cursos |
| Productor | `market-service`, `tema-09-mercado`, `team-09-market` | El propio código |
| Idioma | Eventos en español (`CURSO_ARCHIVADO`, `OFERTA_SUPERADA`, `SUBASTA_ADJUDICADA`) contra inglés | Historias |

## Evidencia nueva
- Tópicos aprovisionados según el README de la documentación del equipo: `market.events`, `accounting.events`, `notifications.events`, `courses.events` y `users.events`, cada uno con su `.DLT`, 3 particiones y creación automática desactivada (el compose de la plataforma la tiene activada: en disputa).
- Nombres como `bank.holds.*`, `inventory.items.*`, `market.orders.events`, `market.auctions.events` y `notifications.alerts` fueron propuestas de diseño **nunca aprovisionadas**. Mercado usa tres de ellos en código ([[Eventos y Kafka]]).
- Accounting ya produce y consume `accounting.events` y espera `market.events` ([[Integración con Accounting]]).

## Recomendación del taller del equipo
D7: adoptar los tópicos `accounting.events` y `market.events`. Coincide con la regla de plataforma. Ver [[Taller de decisiones]].

## Qué hace hoy el código
`SNAKE_CASE` en inglés, tópicos `accounting.holds.*`, `inventory.items.*` y `market.orders.events`, y productor inconsistente: `market-service` en comandos y `tema-09-mercado` en `PURCHASE_CONFIRMED`. Ver [[Eventos y Kafka]].

## Opciones
1. **Mantener los nombres del código y pedir que los demás se alineen.** Imposible para holds: los tópicos no están aprovisionados.
2. **Adoptar la regla de plataforma (D7).** Un tópico por dominio; requiere migrar Mercado.
3. **Mínimo:** unificar solo el nombre del productor.

## Recomendación
Opción 2 para los tópicos de holds y de Mercado (`accounting.events`, `market.events`), más opción 3 de inmediato (adoptadas). El estilo de eventos quedó decidido en `SNAKE_CASE` en inglés; solo falta informar a Notificaciones.

## Quién decide / con qué equipo hay que hablar
Equipo de Notificaciones (Tema 11), Accounting y plataforma. Ver [[Integración con Notificaciones]].

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: el productor es `market-service` en todos los mensajes (se reemplaza `tema-09-mercado`), Mercado publica en `market.events` y habla con Accounting por `accounting.events` (un dominio, un tópico) y los nombres de evento siguen en inglés `SNAKE_CASE`. Ver [[DEC-008 - Nombre de productor y tópicos de Mercado]]. Pregunta archivada.
