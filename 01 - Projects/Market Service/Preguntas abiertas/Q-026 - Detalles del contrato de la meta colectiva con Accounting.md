---
tipo: pregunta
estado: en-disputa
verificado_contra: DEC-029, accounting@8f11dbd
actualizado: 2026-10-15
tags: [mercado, pregunta-abierta, meta-colectiva, accounting, kafka]
---
# Q-026 - Detalles del contrato de la meta colectiva con Accounting

> [[DEC-029 - Meta colectiva]] fija el flujo, pero quedan sin acordar varios detalles del contrato con Accounting (nombres, la forma de la pérdida y de la extensión, los márgenes y las fallas de acreditación), además de cuatro reglas que Mercado derivó de las decisiones y todavía no validó.

## Qué se contradice
No hay una contradicción: son puntos que la propuesta llevó a la reunión del 2026-10-15 y que quedaron sin responder.

| # | Punto | Propuesta de Mercado |
|---|---|---|
| 1 | Nombres finales del tipo de orden, de los dos tipos de débito (meta cumplida y pérdida) y de los motivos de liberación | Los de Accounting (`COLLECTIVE_PURCHASE`, `COLLECTIVE_PURCHASE_DEBIT`), más uno para la pérdida (por ejemplo, `COLLECTIVE_FORFEIT_DEBIT`) y los motivos `COLLECTIVE_GOAL_NOT_REACHED` y `COLLECTIVE_CANCELLED` |
| 2 | Pérdida: ¿un campo `settlement` (`GOAL_REACHED` / `GOAL_FORFEITED`) en el cobro en lote, o un comando aparte? | Un campo: es la misma operación atómica, con otro tipo de débito |
| 3 | Comando para extender el vencimiento (D20): forma, ¿por orden o por hold?, ¿tiene tope?, ¿qué responde? | Por orden (por ejemplo, `HOLD_EXPIRY_EXTEND_REQUESTED { order_id, course_id, new_expires_at }`), con una respuesta que liste los holds extendidos |
| 4 | Margen del vencimiento respecto de `closes_at` | Tiene que cubrir el cobro y sus reintentos |
| 5 | ¿`confirmAll` valida `expires_at`? ¿Cuál es su techo de participantes? | Sí, que lo valide (hoy `confirmHold` no lo hace). Y el techo tiene que cubrir el curso más grande |
| 6 | `catalog_item_id` del ítem de una meta | `goal_ref`: Accounting no lo valida contra ningún catálogo |
| 7 | Motivo para liberar un hold que llega después del cierre | Uno propio, por ejemplo `COLLECTIVE_LATE_CONTRIBUTION` |
| 8 | Tres lugares de Accounting que fallan recién al ejecutar con los tipos nuevos: `CoinLedgerEventType.resolveFrom`, `CoinsLedgerEntryEntity.validateSign` y `CoinHoldEntity.increaseTo` | Que entren en el mismo PR de la migración |
| 9 | ¿Accounting avisará cuando falle una acreditación (`ITEM_CREDIT_FAILED`)? | Sí: Mercado ya tiene el handler. Si no, Mercado la detecta por plazo |
| 10 | La key `course_id:order_id` de los mensajes colectivos cambia la `AccountingKey` del AsyncAPI de Accounting | La presenta Accounting a Tema 11, porque es su contrato |

Reglas derivadas por Mercado, que falta validar dentro del equipo:

| # | Regla |
|---|---|
| R1 | El monto de la meta no se puede bajar por debajo de lo comprometido, porque un hold no se puede achicar |
| R2 | El aporte mínimo aplica al primer aporte de cada alumno; los siguientes pueden ser de cualquier monto |
| R3 | Si Accounting rechaza el primer aporte, el alumno puede volver a intentar (no se creó el hold, así que el `order_id` sigue libre) |
| R4 | `catalog_item_id = goal_ref` (igual que el punto 6) |

## Qué hace hoy el código
No hay código de la meta en `tpi-market` (`ac05a77f`) ni en Accounting (`8f11dbd`). Lo que existe y condiciona estos puntos está en [[Integración con Accounting#Meta colectiva]].

## Opciones
Las del cuadro, punto por punto.

## Recomendación
La columna "Propuesta de Mercado".

## Quién decide / con qué equipo hay que hablar
Accounting con Mercado, salvo el punto 10, que necesita el visto bueno de Tema 11. Las reglas R1 a R3 las valida el equipo de Mercado.

## Resolución
Pendiente.
