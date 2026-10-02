---
tipo: pregunta
estado: en-disputa
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, saga, accounting]
---
# Q-008 - Orden de la saga de compra

> ¿Qué va primero en la compra: entregar el item o confirmar el débito? Hay tres órdenes en conflicto: el código de Mercado, el código de Accounting y la recomendación de los documentos del equipo. Es la decisión de integración más importante que sigue abierta.

## Los tres órdenes

| | A. Código de Mercado | B. Código de Accounting | C. Recomendación del taller (D2, D9) |
|---|---|---|---|
| Secuencia | Provisionar el item (`ITEM_PROVISION_REQUESTED` y `ITEM_PROVISIONED`), luego `HOLD_CONFIRM_REQUESTED` | `HOLD_CONFIRM_REQUESTED` (débito), luego Mercado publica `ITEM_CONFIRMED` y accounting responde `ITEM_CREDITED` | `ITEM_CONFIRMED` y `ITEM_CREDITED`, luego `HOLD_CONFIRM_REQUESTED` |
| Principio | Nunca confirmar el débito antes de entregar | Primero se cobra, después se acredita | "Nunca debitar antes de acreditar" |
| Estado hoy | Implementado, pero con mensajes que accounting no conoce | Implementado del lado de accounting (según su documento de modelo); `ITEM_CONFIRMED` en Mercado está detrás de `market.events.item-confirmed.enabled=false` | No implementado en ninguno de los dos lados |
| Riesgo principal | **Entregar sin cobrar**: si falla la confirmación o el hold vence (TTL fijo de 300 s) después de entregar | **Cobrar sin entregar**: acreditar el item falla en silencio (reintentos y DLT, sin evento de falla) | **Entregar sin cobrar**: si `HOLD_CONFIRM` falla o vence tras acreditar |
| Compensación necesaria | Revocar el item entregado o reintentar el débito; accounting no tiene operación de revocación | Reembolso o reacreditación manual; D6 propone no reembolsar y resolver a mano por un ADMIN | Igual que A, más un evento de error de accounting para que Mercado libere el hold (D9), que hoy no existe |

Los mensajes de las columnas B y C son los reales de accounting (ver [[Integración con Accounting]]); los de la columna A existen solo en Mercado.

## Otras opciones registradas
Un contrato de comando único `PURCHASE_SETTLEMENT_REQUESTED` (v2.0, 26/09) fue propuesto y no lo implementa ninguno de los dos lados; quedó descartado ([[Ideas descartadas]]).

## Qué hace hoy el código de Mercado
Entrega primero (orden A): `ITEM_PROVISIONED` y luego `HOLD_CONFIRM_REQUESTED`. `ITEM_CONFIRMED` está detrás del flag `market.events.item-confirmed.enabled=false` y se publica en `market.orders.events`, que accounting no escucha. Ver [[Saga]] y [[Orden de compra]].

## Recomendación del taller del equipo
D2: `ITEM_CONFIRMED` a `ITEM_CREDITED` reemplaza a los mensajes `ITEM_PROVISION_*`. D9: si falla el item, accounting publica un evento de error y Mercado libera el hold. Juntas equivalen al orden C. Ver [[Taller de decisiones]].

## Opciones
1. **A: entregar primero (código de Mercado).** Evita cobrar sin entregar; exige que accounting ofrezca un mensaje de entrega con respuesta de falla, que hoy no existe.
2. **B: débito primero (código de accounting).** Sin cambios en accounting; exige compensación con reembolso, que hoy no existe.
3. **C: acreditar y luego confirmar (taller).** Mantiene el principio de no cobrar antes de entregar con los mensajes reales de accounting; exige que accounting publique fallas y que Mercado tolere el vencimiento del hold.

## Recomendación
La recomendación del taller es el orden C, pendiente de decisión del equipo y de acuerdo con Accounting. Sea cual sea el orden, hay que acordar la compensación del riesgo que deja: ninguna opción es segura sin ella. Decidir esto es el primer paso del trabajo P0 en [[Roadmap de trabajo]].

## Estado tras el mensaje de accounting del 2026-10-01
El mensaje de accounting no menciona el orden de la saga ni `ITEM_CONFIRMED` e `ITEM_CREDITED`: sigue siendo la conversación principal pendiente. Ver [[Integración con Accounting]].

## Postura de Mercado (2026-10-01)
El líder del equipo de Mercado prefiere **entregar el ítem primero**: considera más viable revertir un ítem del inventario que devolver monedas. **No es una decisión**: debe acordarse con Accounting, por eso la pregunta sigue abierta. [[DEC-009 - Contrato de holds e ítems según Accounting]] adopta el contrato de Accounting pero excluye explícitamente este orden.

### Nota técnica
- Con holds, las monedas **no se debitan hasta `HOLD_CONFIRM_REQUESTED`**. Antes de la confirmación, "devolver monedas" equivale a liberar el hold, que es barato (`HOLD_RELEASE_REQUESTED`).
- El riesgo real de entregar primero aparece cuando **la confirmación falla después de la entrega** (por ejemplo, el hold venció o fue rechazado): el estudiante ya tiene el ítem. Para corregirlo hace falta que Accounting soporte la **revocación de un ítem**, y hoy no existe: no hay REST ni evento para quitar un ítem del inventario ([[Integración con Accounting]]).
- **Pedido a Accounting**: operación o evento de revocación de ítem (por `itemInstanceId` o por `orderId`), junto con un evento de error cuando acreditar falla (hoy va a DLT sin evento).
- El borrador de respuesta en el inbox propone el orden `ITEM_CONFIRMED`, luego `HOLD_CONFIRM_REQUESTED`, con un evento de error de Accounting para que Mercado libere el hold. Esa propuesta es el orden C de la tabla y coincide en la dirección (entregar antes de cobrar), pero **no incluye la revocación**.

## Quién decide / con qué equipo hay que hablar
Mercado y Accounting. Relacionada: [[Q-007 - Contrato con Accounting]] (archivada, ver [[DEC-009 - Contrato de holds e ítems según Accounting]]), [[DEC-001 - Accounting es dueño del inventario]].

## Resolución
Pendiente.
