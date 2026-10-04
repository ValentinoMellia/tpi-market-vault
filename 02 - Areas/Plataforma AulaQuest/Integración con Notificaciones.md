---
tipo: integracion
estado: vigente
verificado_contra: DEC-008
actualizado: 2026-10-04
tags: [mercado, integracion, notificaciones]
---
# Integración con Notificaciones

> Notificaciones (Tema 11) debería avisar a los usuarios de hechos de Mercado; además define el estándar de eventos de la plataforma, que difiere del usado en el código.

## Equipo y responsabilidad
Tema 11. Según la documentación anterior, consume `CATALOG_OFFER_PUBLISHED`, `PURCHASE_CONFIRMED`, eventos de subasta y `BID_OUTBID`. Su estándar: nombres en `HYPHEN-CASE`, un tópico por dominio, eventos como hechos (nunca comandos) y productor `tema-XX-nombre`. Faltan definir muchos campos, reintentos, DLT y particiones.

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Mercado a Notificaciones | Kafka `market.events` (el código publica ahí por defecto desde el PR #88) | `PURCHASE_CONFIRMED` | Avisar la compra |
| Mercado a Notificaciones (previsto) | Kafka | `CATALOG_OFFER_PUBLISHED` | Avisar nueva oferta |
| Mercado a Notificaciones (Fase 3) | Kafka | eventos de subasta | Ver [[Subasta]] |

## Estado actual en el código
Solo se publica `PURCHASE_CONFIRMED` (con productor `tema-09-mercado`, a reemplazar por `market-service`). `CATALOG_OFFER_PUBLISHED` no está implementado.

## Evidencia nueva
- El tópico aprovisionado de Notificaciones es `notifications.events`; `notifications.alerts` fue una propuesta que nunca se aprovisionó, y `market.orders.events` tampoco ([[Mapa de servicios]]).
- Accounting no consume `PURCHASE_CONFIRMED` ([[Integración con Accounting]]); no está confirmado que Notificaciones lo consuma.
- La regla de plataforma "un dominio = un tópico `<dominio>.events`" lleva los eventos de Mercado a `market.events`, y el productor es `market-service` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]).

## Acuerdos pendientes
- Informar a Notificaciones que Mercado usa nombres de evento en inglés `SNAKE_CASE` (como Accounting) y no `HYPHEN-CASE` ([[DEC-008 - Nombre de productor y tópicos de Mercado]]); si Notificaciones lo exige, se renegocia.
- Ya no hay aviso de vencimiento de ítems: los ítems no vencen ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]).

## Relacionado
[[Eventos y Kafka]], [[Roadmap de trabajo]].
