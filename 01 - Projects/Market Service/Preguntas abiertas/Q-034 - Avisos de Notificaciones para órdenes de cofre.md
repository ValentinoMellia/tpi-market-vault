---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@5fb82d80
actualizado: 2026-10-26
tags: [mercado, pregunta-abierta, cofres, notificaciones, eventos]
---
# Q-034 - Avisos de Notificaciones para órdenes de cofre

> Una orden de cofre publica `PURCHASE_CONFIRMED` o `PURCHASE_FAILED` con `offer_id` en `null`, pero el [[Contrato de avisos de compra]] lo marca como obligatorio. ¿Notificaciones acepta esos avisos tal como salen, y hace falta un aviso propio que diga qué premio tocó?

## Qué se contradice
| Postura | Qué dice | Dónde aparece |
|---|---|---|
| [[Contrato de avisos de compra]] (borrador, versión 1) | `offerId` es obligatorio en `PURCHASE_CONFIRMED` y en `PURCHASE_FAILED`: «oferta del catálogo que se compró» | Propuesto a Notificaciones; todavía no lo aceptaron |
| Código de Mercado desde la PR 321 de `tpi-market` (#12019) | Una orden de cofre no tiene oferta: el aviso sale con `offer_id` `null` (antes habría salido el texto `"null"`), `offer_name` con el nombre del cofre e `item_type` y `quantity` del premio | `dtos/events/PurchaseConfirmedPayloadDto.java`, decisión D9 del change `us-12004-t04-chest-purchase-saga` |
| US-12004 | El alumno abre un cofre y le toca un premio; nada en el aviso dice que fue un cofre ni qué premio salió, salvo `item_type` | [[S3-04 - Cofres, el alumno compra un cofre]] |

## Qué hace hoy el código
Verificado en `develop@5fb82d80` de `tpi-market`:

- Una orden `CHEST` llega a `CONFIRMED` o falla por la misma saga que una compra directa, así que publica los mismos dos eventos, con el mismo payload.
- `offer_id` va en `null` y `offer_name` lleva el nombre del cofre (la orden guarda el nombre del cofre en `offer_name`).
- El evento no trae `order_kind`, `chest_id` ni el premio. El premio está en la orden (`drawn_prize`, [[DEC-047 - Cuándo ve el alumno el premio de un cofre]]).
- No se probó contra Notificaciones: Mercado no sabe si su consumidor valida `offerId`.

## Opciones
1. **Dejar los avisos como están** y que Notificaciones acepte `offerId` nulo cuando el aviso es de un cofre.
   - Ventajas: sin cambios en Mercado.
   - Desventajas: el alumno recibe «compraste el cofre X», sin saber qué le tocó; si Notificaciones valida el campo, el aviso se descarta.
2. **Agregar campos opcionales al mismo evento** (`order_kind`, `chest_id` y el nombre del premio), sin subir la versión.
   - Ventajas: un solo evento y un texto completo («abriste el cofre X y te tocó Y»).
   - Desventajas: hay que acordarlo con Notificaciones y actualizar el contrato.
3. **Un evento propio para cofres** (por ejemplo `CHEST_OPENED`).
   - Ventajas: contrato claro, separado de la compra directa.
   - Desventajas: un evento más para Notificaciones y para el outbox; duplica casi todo el payload.

## Recomendación
Opción 2: es el cambio más chico que permite el aviso completo. Mientras tanto, confirmar con Notificaciones que un `offerId` nulo no rompe su consumidor.

## Quién decide / con qué equipo hay que hablar
Mercado propone; decide Notificaciones (Tema 11), dueño del texto y del consumidor ([[Integración con Notificaciones]]).

## Resolución
Pendiente. Quedó abierta en la PR 321 de `tpi-market` («a coordinar con Notificaciones»). Notas afectadas: [[Contrato de avisos de compra]], [[Cofre]], [[S3-04 - Cofres, el alumno compra un cofre]].
