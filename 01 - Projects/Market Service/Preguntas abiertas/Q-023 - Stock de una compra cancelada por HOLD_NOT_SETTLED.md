---
tipo: pregunta
estado: archivado
verificado_contra: DEC-019
actualizado: 2026-10-06
tags: [mercado, pregunta-archivada, compra, stock, hold]
---
# Q-023 - Stock de una compra cancelada por HOLD_NOT_SETTLED

> Cuando una compra termina en `CANCELLED` con `HOLD_NOT_SETTLED`, el estudiante ya tiene el ítem pero no se le cobró. ¿La unidad vuelve al stock de la oferta, como pedía la T01 de [[S2-05 - Robustez de la compra]], o queda retenida, como hace el código y como asume el PR #113 de `tpi-market`? **Resuelta**: queda retenida, ver [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| T01 #5220 de [[S2-05 - Robustez de la compra]] (CA1, escenario 1) | La cancelación por `HOLD_NOT_SETTLED` debe devolver la unidad a `availableStock`; que hoy "no libera el stock" es un defecto | Gap 19 de [[Estado actual del código]], reportado por la documentación del equipo sin verificar |
| [[S2-OPC1 - Reconciliación de compras]] (CA2, escenario 2) | Una orden con hold `RELEASED` pasa a `CANCELLED` con `HOLD_NOT_SETTLED` "y libera el stock" | Historia opcional del Sprint 2 |
| Código actual, US-138 T05 (decisión de diseño CD12) | A propósito, `cancelUnsettled` no libera el hold ni el stock: el ítem ya está en el inventario del estudiante | `services/impl/OrderConfirmationServiceImpl.java` (`cancelUnsettled`); spec `order-cancellation-reason` de `tpi-market` |
| PR #113 de `tpi-market` (US-5207, [[S2-03 - Reglas de la tienda]], en revisión) | Las órdenes `CANCELLED / HOLD_NOT_SETTLED` son entregas "en cuarentena" que retienen su unidad, y una oferta no pasa de stock ilimitado a finito mientras haya alguna | `services/impl/CatalogOfferRules.java`, `db/manual/US5207__reconcile_store_rules.sql` en la rama del PR |

## Qué hace hoy el código
Verificado contra `develop@f7457882`:

- Una compra avanza así: se reserva una unidad (`availableStock` baja), Accounting retiene las monedas (hold), Inventory entrega el ítem (`ITEM_PROVISIONED`) y por último se confirma el cobro.
- `HOLD_NOT_SETTLED` pasa cuando ese último paso falla y la consulta a Accounting dice que el hold ya se liberó o venció (`RELEASED`). Es decir, **el estudiante tiene el ítem y no pagó nada**.
- `cancelUnsettled` cambia la orden a `CANCELLED` con `HOLD_NOT_SETTLED` y deja un `ERROR` en el log pidiendo revisión manual ("item delivered and nothing charged"). No devuelve el stock, no libera el hold y no publica evento. El comentario del método y la decisión CD12 del diseño de la US-138 T05 dicen que es **a propósito**.
- El historial le muestra al estudiante: "El ítem ya está en tu inventario. No se pudo completar el cobro, por lo que no se descontaron monedas de tu saldo." (spec `order-cancellation-reason`).
- No hay ningún camino, manual ni automático, que resuelva después esa orden: no se vuelve a cobrar ni se le quita el ítem al estudiante.

Por lo tanto, el gap 19 no era un olvido sino una decisión de la T05 que ninguna nota del vault registraba.

## Un ejemplo
Una oferta con stock finito de 10 unidades; un estudiante compra y su compra termina en `HOLD_NOT_SETTLED`:

| Momento | `availableStock` | Ítems en manos de estudiantes |
|---|---|---|
| Antes de la compra | 10 | 0 |
| El estudiante compra (se reserva la unidad) | 9 | 0 |
| Inventory le entrega el ítem | 9 | 1 |
| Falla el cobro → `HOLD_NOT_SETTLED` | **?** | 1 |

La pregunta es qué valor va en ese `?`, es decir, si la unidad cuenta como usada cuando se **entrega** o cuando se **cobra**. Solo importa con stock finito: con stock ilimitado ninguna opción cambia nada.

## Opciones
1. **Retener la unidad: queda en 9.** La tienda puede vender 9 más, así que entre todos los estudiantes terminan con 10 ítems: los 9 vendidos y el que ya se entregó. Se respeta el límite que puso el profesor.
   - *Ventajas:* no hay sobreventa, coincide con el código y con el PR #113, y la T01 no cambia código.
   - *Desventajas:* esa unidad no se cobró y queda en el limbo: no vuelve al stock ni cuenta como vendida, y no hay forma de resolver el caso.
2. **Devolver la unidad: vuelve a 10** (lo que pedía la T01). La tienda puede vender 10 más, así que entre todos los estudiantes terminan con 11 ítems en una oferta de 10. Por cada compra así se vende una unidad que ya tiene alguien.
   - *Ventajas:* la oferta no "pierde" unidades.
   - *Desventajas:* sobreventa. Además rompe la regla de cuarentena del PR #113: Mercado calcula las reservadas como `total - disponibles - vendidas`, y con la unidad devuelta esa cuenta deja de ver la cuarentena. También contradice CD12.
3. **Retener hasta resolver a mano.** Como la 1, pero con una acción administrativa que cierra el caso:
   - si después se le cobra al estudiante, la unidad pasa a vendida (`availableStock` sigue en 9 y `unitsSold` sube a 1);
   - si se le quita el ítem, la unidad vuelve al stock (`availableStock` pasa a 10, y ahí está bien porque nadie la tiene).

   *Ventajas:* el stock termina reflejando lo que pasó. *Desventajas:* necesita un endpoint nuevo y probablemente a Accounting (volver a cobrar) o a Inventory (quitar el ítem). Es más grande que la T01 (5 h).

## Recomendación
Opción 1 ahora. La T01 #5220 pasa a fijar el comportamiento con una prueba y a corregir la documentación (gap 19, CA1 y escenario 1 de S2-05, CA2 de [[S2-OPC1 - Reconciliación de compras]]). La opción 3 queda como trabajo futuro si la revisión manual resulta frecuente.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado: Patricio Fernandez (responsable de la T01), Mateo Conte (autor del PR #113) y Valentino Mellia (autor de la US-138 T05 y de CD12). La opción 3 necesitaría además a Accounting o a Inventory.

## Resolución
Archivada el 2026-10-06. Patricio Fernandez y Mateo Conte acordaron la **opción 1**: la unidad de una compra cancelada por `HOLD_NOT_SETTLED` queda retenida. Registrado en [[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]. La opción 3 queda como posible trabajo futuro.
