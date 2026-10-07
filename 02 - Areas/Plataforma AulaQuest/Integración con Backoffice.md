---
tipo: integracion
estado: borrador
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-06
tags: [mercado, integracion, backoffice]
---
# Integración con Backoffice

> Backoffice (Tema 12) administraría parámetros que afectan a la plataforma. Para Mercado es una integración prevista y sin código de consumo: el tope de vidas PAR-12 lo aplica Accounting y Mercado lo replica por configuración para validar antes de vender vidas.

## Equipo y responsabilidad
Tema 12. Según la documentación anterior, publica los parámetros PAR-06, PAR-07 y PAR-12 con el evento `PARAMETRO_ACTUALIZADO` y un `GET` de consulta; el significado exacto de PAR-06 y PAR-07 no quedó confirmado.

PAR-12 es el tope de vidas. Accounting lo consume del tópico `administration.events` con el evento `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` y usa 3 y 3 como valores por defecto (lectura del código de accounting). El tópico `administration.events` no figura entre los cinco aprovisionados de [[Mapa de servicios]]. Accounting lo aplica y reporta; desde el 2026-10-04 Mercado también lo usa para validar antes del hold ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[Integración con Accounting]]). Como Accounting no expone PAR-12, Mercado lo toma de `market.lives.max-lives` (`MARKET_LIVES_MAX_LIVES`, por defecto 3, `configs/LifeCapProperties.java`) y hay que mantenerlo igual al `maxLives` de Backoffice hasta que Mercado consuma `GLOBAL_CONFIGURATION_CHANGED`.

La devolución de una compra de vidas cobrada sin acreditar (`SETTLED_UNCREDITED`) la pide un ADMIN desde BackOffice como reversión del débito de la orden (`COIN_LEDGER_REVERSAL_REQUESTED`), y Accounting solo la acepta con la cuenta activa ([[S2-11 - Acuerdos de compra de vidas con Accounting]]).

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Backoffice a Mercado (previsto) | Kafka | `PARAMETRO_ACTUALIZADO` | Actualizar parámetros |
| Mercado a Backoffice (previsto) | REST | `GET` de parámetros | Leer valor vigente |
| Backoffice a Accounting | Kafka `administration.events` | `GLOBAL_CONFIGURATION_CHANGED` | Tope de vidas (no pasa por Mercado) |

## Estado actual en el código
No hay consumidor de `PARAMETRO_ACTUALIZADO` ni cliente de parámetros en Mercado.

## Acuerdos pendientes
Qué parámetros usa Mercado (hoy PAR-12, replicado por configuración), el nombre del evento ([[DEC-008 - Nombre de productor y tópicos de Mercado]]) y el contrato del `GET`.

## Relacionado
[[Mapa de servicios]], [[Estado actual del código]].
