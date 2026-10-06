---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@f7457882
actualizado: 2026-10-06
tags: [mercado, pregunta-abierta, compra, stock, hold]
---
# Q-023 - Stock de una compra cancelada por HOLD_NOT_SETTLED

> Cuando una compra termina en `CANCELLED` con `HOLD_NOT_SETTLED`, el estudiante ya tiene el ítem pero no se le cobró. ¿La unidad vuelve al stock de la oferta, como pide la T01 de [[S2-05 - Robustez de la compra]], o queda retenida, como hace hoy el código y como asume el PR #113 de `tpi-market`?

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| T01 #5220 de [[S2-05 - Robustez de la compra]] (CA1, escenario 1) | La cancelación por `HOLD_NOT_SETTLED` debe devolver la unidad a `availableStock`; hoy "no libera el stock" es un defecto | Gap 19 de [[Estado actual del código]], reportado por la documentación del equipo sin verificar |
| [[S2-OPC1 - Reconciliación de compras]] (CA2) | Una orden con hold `RELEASED` pasa a `CANCELLED` con `HOLD_NOT_SETTLED` "y libera el stock" | Historia opcional del Sprint 2 |
| Código actual, US-138 T05 (decisión de diseño CD12) | A propósito, `cancelUnsettled` no libera el hold ni el stock: el ítem ya está en el inventario del estudiante | `services/impl/OrderConfirmationServiceImpl.java` (`cancelUnsettled`); spec `order-cancellation-reason` de `tpi-market` |
| PR #113 de `tpi-market` (US-5207, [[S2-03 - Reglas de la tienda]], en revisión) | Las órdenes `CANCELLED / HOLD_NOT_SETTLED` son entregas "en cuarentena" que retienen su unidad. Además, una oferta no puede pasar de stock ilimitado a finito mientras haya alguna | `services/impl/CatalogOfferRules.java`, `db/manual/US5207__reconcile_store_rules.sql` en la rama del PR |

## Qué hace hoy el código
Verificado contra `develop@f7457882`:

- `HOLD_NOT_SETTLED` solo se alcanza desde `ITEM_PROVISIONED`, es decir, **después** de que Inventory acreditó el ítem. Pasa cuando la confirmación del hold falla y la consulta a Accounting dice que el hold ya se liberó o venció (`RELEASED`).
- `cancelUnsettled` cambia la orden a `CANCELLED` con `HOLD_NOT_SETTLED` y deja un `ERROR` en el log pidiendo revisión manual: "item delivered and nothing charged". No devuelve el stock, no libera el hold y no publica evento. El comentario del método y la decisión CD12 del diseño de la US-138 T05 dicen que es así **a propósito**.
- El historial le muestra al estudiante: "El ítem ya está en tu inventario. No se pudo completar el cobro, por lo que no se descontaron monedas de tu saldo." (spec `order-cancellation-reason`).
- No hay ningún camino, ni manual ni automático, que resuelva después esa orden: no se vuelve a cobrar ni se le quita el ítem al estudiante.

Por lo tanto, el gap 19 no es un olvido: es una decisión de la T05 que ninguna nota del vault registraba. Lo que falta es qué hacer con esa unidad cuando alguien revise el caso.

## Opciones
1. **Retener la unidad (lo que hace hoy el código y lo que asume el PR #113).** La unidad se entregó, así que no vuelve a venderse. La T01 se redefine o se archiva y el gap 19 se reescribe como comportamiento esperado. *Ventajas:* no sobrevende ítems entregados, coincide con el código y con #113, y la T01 no cambia código. *Desventajas:* la unidad queda retenida para siempre, porque no hay forma de resolver el caso.
2. **Devolver la unidad al stock (lo que pide la T01).** *Ventajas:* la oferta no pierde unidades. *Desventajas:* se vende más de lo que hay, porque el estudiante se queda con el ítem y la unidad se vuelve a vender. Además choca con la regla de cuarentena del PR #113 y con CD12.
3. **Retener hasta resolver a mano.** Una acción administrativa cierra el caso: si se cobra después, la unidad cuenta como vendida (`unitsSold`); si se le quita el ítem al estudiante, vuelve al stock. *Ventajas:* el stock termina reflejando lo que pasó. *Desventajas:* necesita un endpoint nuevo y quizá a Inventory o Accounting (volver a cobrar, revocar el ítem). Es más grande que la T01 (5 h).

## Recomendación
Opción 1 ahora:
- La T01 #5220 pasa a verificar y documentar el comportamiento: una prueba que fije que la unidad queda retenida, más el gap 19 y el CA1/escenario 1 de S2-05 corregidos. La otra salida es archivarla.
- El CA2 de [[S2-OPC1 - Reconciliación de compras]] se ajusta igual.

La opción 3 queda como trabajo futuro, si la revisión manual resulta frecuente.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado:
- Patricio Fernandez, responsable de la T01.
- Mateo Conte, autor del PR #113.
- Valentino Mellia, autor de la US-138 T05 y de CD12.

La opción 3 necesitaría además a Accounting (volver a cobrar) o a Inventory (quitar el ítem).

## Resolución
Pendiente.
