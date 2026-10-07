---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@276af529
actualizado: 2026-10-04
tags: [mercado, pregunta-abierta, notificaciones, compra-directa]
---
# Q-019 - Aviso cuando el ítem se entregó sin cobro

> Cuando Accounting libera la reserva después de que el ítem ya se entregó, la orden termina en `CANCELLED` con motivo `HOLD_NOT_SETTLED`: el alumno tiene el ítem y no pagó. Ese final no es ni "compra confirmada" ni "compra fallida" según la historia #1051, y hay que decidir si se avisa y cómo.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Historia #1051 | Hay dos casos: confirmada (el alumno tiene el ítem) y fallida (no se cobró nada y las reservas se liberaron) | Taiga, #1051 |
| Código | Existe un tercer final: ítem entregado y cobro no realizado | `services/impl/OrderConfirmationServiceImpl.java` (`cancelUnsettled`) |

## Qué hace hoy el código
`OrderConfirmationServiceImpl.cancelUnsettled` pasa la orden a `CANCELLED(HOLD_NOT_SETTLED)` cuando la consulta a Accounting devuelve la reserva como liberada después de entregar el ítem. Solo deja un log de error que pide revisión manual y no publica ningún evento. El alumno ve en el SSE el mensaje "El ítem ya está en tu inventario. No se pudo completar el cobro…" (`mappers/OrderStatusEventMapper.java`).

## Opciones
1. **No publicar aviso**: el caso es una anomalía que se revisa a mano. Ventaja: no hay que explicarle al alumno algo que todavía no se resolvió. Desventaja: el alumno no se entera fuera de la pantalla de compra.
2. **Publicar `PURCHASE_CONFIRMED` con `amount = 0`**: para el alumno la compra salió bien. Ventaja: no agrega un evento. Desventaja: dice "confirmada" cuando el cobro no se hizo, y otros consumidores podrían leerlo como una venta normal.
3. **Publicar un tercer evento** (por ejemplo `PURCHASE_SETTLEMENT_FAILED`): describe exactamente el hecho. Ventaja: no mezcla casos. Desventaja: Notificaciones tiene que agregar otro tipo, para un caso que debería ser raro.

## Recomendación
Opción 1 mientras sea un caso de revisión manual. El equipo de Mercado la adoptó como postura provisoria el 2026-10-04 y el [[Contrato de avisos de compra]] queda así hasta que producto decida.

## Quién decide / con qué equipo hay que hablar
Producto (PO de Mercado). Si se elige la opción 3, hay que avisar a Notificaciones ([[Integración con Notificaciones]]).

## Resolución
Pendiente.
