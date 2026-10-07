---
tipo: integracion
estado: vigente
verificado_contra: equipo-notificaciones@2026-10-04
actualizado: 2026-10-05
tags: [mercado, integracion, notificaciones]
---
# Integración con Notificaciones

> Notificaciones (Tema 11) avisa a los usuarios de hechos de Mercado y mantiene el contrato de Kafka de la plataforma. Hoy consume `market.events`, pero solo dos eventos que Mercado no publica; los avisos de compras y de ofertas nuevas están propuestos en [[Contrato de avisos de compra]].

## Equipo y responsabilidad
Tema 11, repositorio `tpi-notifications`. Mantiene el contrato de Kafka de la plataforma: envelope de 6 campos con `eventVersion = 1`, nombres de evento en inglés `SCREAMING_SNAKE_CASE`, un tópico `<dominio>.events` con su `.DLT`, eventos como hechos (nunca comandos) y productor `tema-XX-service-name`. Esto coincide con [[DEC-008 - Nombre de productor y tópicos de Mercado]] salvo en el nombre del productor, que Mercado fija en `market-service`.

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Mercado a Notificaciones | Kafka `market.events` | `PURCHASE_CONFIRMED` y `PURCHASE_FAILED` ([[Contrato de avisos de compra]]) | Avisar el resultado de la compra |
| Mercado a Notificaciones | Kafka `market.events` | `CATALOG_OFFER_PUBLISHED` y `CATALOG_OFFER_REACTIVATED` ([[DEC-018 - Aviso de ofertas nuevas]]) | Avisar una oferta nueva o reactivada a los alumnos del curso |
| Mercado a Notificaciones (Fase 3) | Kafka | eventos de subasta | Ver [[Subasta]] |

## Estado actual en el código
Verificado en `develop` (`9b4c05f9`): solo se publica `PURCHASE_CONFIRMED`, ya en `market.events` y con productor `market-service`, pero con un payload que todavía no cumple el contrato. `PURCHASE_FAILED` y los avisos de ofertas no están implementados.

## Lo que consume Notificaciones hoy
Verificado en la rama `develop` de `tpi-notifications` el 2026-10-04 (PR #67, del 2026-10-03):
- `MarketEventsListener` escucha `market.events` y acepta solo `TRADE_ITEM_PUBLISHED` y `AUCTION_STARTED`. Cualquier otro `eventType` se confirma y se descarta sin dejar registro, así que hoy `PURCHASE_CONFIRMED` se perdería.
- Esos dos eventos esperan `trade_item_id`, `course_id`, `title`, `cost_points`, `publisher_id` y la lista de destinatarios `student_user_ids` (acepta también `camelCase`). Describen una "tienda de canjes" donde publica un alumno con puntos, que no coincide con el catálogo de Mercado: publica el profesor, en monedas, y el evento previsto es `CATALOG_OFFER_PUBLISHED`. Afecta a #1052.
- Descartan repetidos por `eventId` (`ProcessedEvent`), exigen `eventVersion = 1` y los destinatarios tienen que ser UUID.

## Evidencia anterior
- El tópico aprovisionado de Notificaciones es `notifications.events`; `notifications.alerts` fue una propuesta que nunca se aprovisionó, y `market.orders.events` tampoco ([[Mapa de servicios]]).
- Accounting no consume `PURCHASE_CONFIRMED` ([[Integración con Accounting]]).

## Acuerdos pendientes
- Que Notificaciones acepte el [[Contrato de avisos de compra]] y consuma `PURCHASE_CONFIRMED` y `PURCHASE_FAILED` con un solo destinatario.
- Alinear el evento de ofertas nuevas: Notificaciones espera `TRADE_ITEM_PUBLISHED` con su propio payload y la lista de destinatarios; Mercado decidió publicar `CATALOG_OFFER_PUBLISHED` y `CATALOG_OFFER_REACTIVATED` solo con `courseId`, y que Notificaciones resuelva los alumnos con Cursos ([[DEC-018 - Aviso de ofertas nuevas]], #1052).
- Avisarles que el productor de Mercado es `market-service` y no `tema-09-...` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]). Hoy no validan ese campo.
- Ya no hay aviso de vencimiento de ítems: los ítems no vencen ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).

## Relacionado
[[Eventos y Kafka]], [[Roadmap de trabajo]], [[Contrato de avisos de compra]].
