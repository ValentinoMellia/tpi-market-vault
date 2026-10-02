---
tipo: integracion
estado: borrador
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, integracion, backoffice]
---
# Integración con Backoffice

> Backoffice (Tema 12) administraría parámetros que afectan a la plataforma. Para Mercado es una integración prevista y sin código; el parámetro de vidas PAR-12 lo consume Accounting, no Mercado.

## Equipo y responsabilidad
Tema 12. Según la documentación anterior, publica los parámetros PAR-06, PAR-07 y PAR-12 con el evento `PARAMETRO_ACTUALIZADO` y un `GET` de consulta; el significado exacto de PAR-06 y PAR-07 no quedó confirmado.

PAR-12 es el tope de vidas. Accounting lo consume del tópico `administration.events` con el evento `GLOBAL_CONFIGURATION_CHANGED {initialLives, maxLives}` y usa 3 y 3 como valores por defecto (lectura del código de accounting). Mercado no valida el tope: Accounting lo aplica y reporta ([[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[Integración con Accounting]]). Ese tópico no figura entre los cinco aprovisionados de [[Mapa de servicios]].

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Backoffice a Mercado (previsto) | Kafka | `PARAMETRO_ACTUALIZADO` | Actualizar parámetros |
| Mercado a Backoffice (previsto) | REST | `GET` de parámetros | Leer valor vigente |
| Backoffice a Accounting | Kafka `administration.events` | `GLOBAL_CONFIGURATION_CHANGED` | Tope de vidas (no pasa por Mercado) |

## Estado actual en el código
No hay consumidor de `PARAMETRO_ACTUALIZADO` ni cliente de parámetros en Mercado.

## Acuerdos pendientes
Qué parámetros usa Mercado (posiblemente ninguno si las vidas son de Accounting), el nombre del evento ([[DEC-008 - Nombre de productor y tópicos de Mercado]]) y el contrato del `GET`.

## Relacionado
[[Mapa de servicios]], [[Estado actual del código]].
