---
tipo: integracion
estado: borrador
verificado_contra: codigo@276af529
actualizado: 2026-10-04
tags: [mercado, integracion, notificaciones, eventos, compra-directa]
---
# Contrato de avisos de compra

> Qué eventos publica Mercado cuando una compra directa termina, confirmada o fallida, qué datos llevan y qué necesita hacer Notificaciones para avisarle al alumno. Es el entregable de la tarea #1054 (T01) de la historia #1051 y está en borrador hasta que Notificaciones lo acepte. Al final, lo que ya está definido para el aviso de ofertas nuevas (#1052).

## Alcance

- Cubre el final de la [[Saga]] de compra directa: reserva de monedas, entrega del ítem y confirmación del cobro ([[DEC-004 - Máquina de estados de la orden según el código]]).
- Las ofertas nuevas (#1052) comparten el transporte y tienen su propia sección al final. Las subastas no están cubiertas.
- Mercado publica **hechos**. Qué texto se muestra, por qué canal y cuándo lo decide Notificaciones ([[Integración con Notificaciones]]).
- El alumno se identifica solo por su `studentId`: el aviso no lleva nombre, mail ni otro dato personal.

## Transporte

| Aspecto | Valor | Fuente |
|---|---|---|
| Tópico | `market.events` (DLT `market.events.DLT`) | [[DEC-008 - Nombre de productor y tópicos de Mercado]] |
| Key del mensaje | `studentId` | La misma que usa hoy el relay del outbox |
| `producer` | `market-service` | [[DEC-008 - Nombre de productor y tópicos de Mercado]] |
| Envelope | Los 6 campos de la plataforma: `eventId`, `eventType`, `eventVersion`, `timestamp`, `producer`, `payload` | [[Eventos y Kafka]] |
| `eventVersion` | `1` | Notificaciones descarta cualquier otra versión |
| Formato | JSON plano, campos en `camelCase`, fechas ISO-8601 UTC | Notificaciones acepta `camelCase` en `market.events` |
| Entrega | Al menos una vez (*at-least-once*): un mismo evento puede llegar repetido con el **mismo** `eventId` | [[Patrón Outbox]] |

## Cuándo se publica cada evento

Cada orden emite **un solo** evento de resultado, al llegar a su estado final. El evento se escribe en el outbox dentro de la misma transacción que el cambio de estado, así que nunca frena el cierre de la compra: si Kafka no responde, la orden queda cerrada igual y el relay reintenta el envío.

| Estado final de la orden | Evento | `reason` |
|---|---|---|
| `CONFIRMED` | `PURCHASE_CONFIRMED` | — |
| `REJECTED_INSUFFICIENT_FUNDS` (Accounting rechaza la reserva con `INSUFFICIENT_BALANCE`) | `PURCHASE_FAILED` | `INSUFFICIENT_FUNDS` |
| Reserva rechazada por `ACCOUNT_NOT_FOUND` o `ACCOUNT_INACTIVE` | `PURCHASE_FAILED` | `ACCOUNT_UNAVAILABLE` |
| Reserva rechazada por cualquier otro motivo de [[DEC-009 - Contrato de holds e ítems según Accounting]] | `PURCHASE_FAILED` | `PROCESSING_ERROR` |
| `EXPIRED` (la reserva venció antes de terminar) | `PURCHASE_FAILED` | `RESERVATION_EXPIRED` |
| `CANCELLED` con motivo `ITEM_PROVISION_FAILED` (el disparador depende de [[Q-008 - Orden de la saga de compra]]) | `PURCHASE_FAILED` | `ITEM_DELIVERY_FAILED` |
| `CANCELLED` con motivo `HOLD_NOT_SETTLED` (ítem entregado, cobro no realizado) | **No se publica** hasta resolver [[Q-019 - Aviso cuando el ítem se entregó sin cobro]] | — |

```mermaid
stateDiagram-v2
    HOLD_REQUESTED --> REJECTED_INSUFFICIENT_FUNDS: PURCHASE_FAILED
    HOLD_REQUESTED --> EXPIRED: PURCHASE_FAILED
    HOLD_GRANTED --> EXPIRED: PURCHASE_FAILED
    ITEM_PROVISION_REQUESTED --> CANCELLED: PURCHASE_FAILED (ITEM_DELIVERY_FAILED)
    ITEM_PROVISIONED --> CONFIRMED: PURCHASE_CONFIRMED
    ITEM_PROVISIONED --> CANCELLED: sin evento (Q-019)
```

## `PURCHASE_CONFIRMED` (versión 1)

La compra terminó bien: se cobraron las monedas y el ítem quedó en el inventario del alumno.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `orderId` | string (UUID) | Sí | `orderRef` de la orden: el mismo `orderId` que Mercado usa con Accounting en el bus. No es el id numérico de la API REST |
| `studentId` | string (UUID) | Sí | Alumno que compró; es el único destinatario del aviso |
| `courseId` | string | Sí | Curso donde se hizo la compra |
| `offerId` | string | Sí | Oferta del catálogo que se compró |
| `offerName` | string | Sí | Nombre de la oferta al momento de la compra (copiado en la orden al crearla) |
| `itemType` | string | Sí | `SHIELD`, `BOOST_XP`, `BOOST_COINS` o `LIFE` |
| `quantity` | integer | Sí | Unidades compradas: las vidas que otorga la oferta si `itemType` es `LIFE`, y `1` en los demás casos |
| `amount` | integer | Sí | Monedas cobradas: el precio aplicado a la orden (`appliedPrice`), que coincide con el `amount` de `HOLD_CONFIRMED` |
| `holdId` | string | No | Reserva de Accounting que se confirmó; solo sirve para trazabilidad y Notificaciones puede ignorarlo |
| `confirmedAt` | string (ISO-8601 UTC) | Sí | Momento en que la orden quedó confirmada |

```json
{
  "eventId": "8b1f2c4e-6d0a-4c43-9b8e-2f6a1d7e9c10",
  "eventType": "PURCHASE_CONFIRMED",
  "eventVersion": 1,
  "timestamp": "2026-10-04T15:30:00Z",
  "producer": "market-service",
  "payload": {
    "orderId": "6f1c2e8a-9b3d-4a57-8e21-0c4d5f6a7b8c",
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseId": "COURSE_PROG4_2026",
    "offerId": "7",
    "offerName": "Escudo anti-error",
    "itemType": "SHIELD",
    "quantity": 1,
    "amount": 120,
    "holdId": "4d2b7a90-1c3e-4f5a-8b6d-0e9f1a2b3c4d",
    "confirmedAt": "2026-10-04T15:30:00Z"
  }
}
```

## `PURCHASE_FAILED` (versión 1)

La compra no se completó. En todos los casos de este evento **no se cobró nada** y la reserva de monedas se liberó o vence sola en Accounting.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `orderId` | string (UUID) | Sí | `orderRef` de la orden: el mismo `orderId` que Mercado usa con Accounting en el bus. No es el id numérico de la API REST |
| `studentId` | string (UUID) | Sí | Alumno que intentó comprar; único destinatario del aviso |
| `courseId` | string | Sí | Curso donde se intentó la compra |
| `offerId` | string | Sí | Oferta del catálogo |
| `offerName` | string | Sí | Nombre de la oferta al momento del intento |
| `itemType` | string | Sí | `SHIELD`, `BOOST_XP`, `BOOST_COINS` o `LIFE` |
| `quantity` | integer | Sí | Unidades que se intentaron comprar, con la misma regla que en `PURCHASE_CONFIRMED` |
| `reason` | string | Sí | Motivo normalizado (tabla siguiente) |
| `failedAt` | string (ISO-8601 UTC) | Sí | Momento en que la orden llegó a su estado final |

| `reason` | Qué le pasó al alumno |
|---|---|
| `INSUFFICIENT_FUNDS` | No tenía monedas suficientes |
| `ACCOUNT_UNAVAILABLE` | Su cuenta en el curso no existe o está inactiva |
| `RESERVATION_EXPIRED` | La compra tardó demasiado y la reserva venció |
| `ITEM_DELIVERY_FAILED` | No se pudo entregar el ítem; las monedas reservadas se devolvieron |
| `PROCESSING_ERROR` | Error técnico al procesar la compra |

La lista de motivos puede crecer en la misma versión, por ejemplo con el tope de vidas cuando se acuerde con Accounting ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]). Un consumidor que reciba un `reason` desconocido debe tratarlo como `PROCESSING_ERROR`.

```json
{
  "eventId": "c2a9e7d1-5b44-4f0e-a1c3-7d8e9f0a1b2c",
  "eventType": "PURCHASE_FAILED",
  "eventVersion": 1,
  "timestamp": "2026-10-04T15:30:05Z",
  "producer": "market-service",
  "payload": {
    "orderId": "a3e5c7d9-1b2f-4c6e-9a8b-7d6c5e4f3a21",
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "courseId": "COURSE_PROG4_2026",
    "offerId": "7",
    "offerName": "Escudo anti-error",
    "itemType": "SHIELD",
    "quantity": 1,
    "reason": "INSUFFICIENT_FUNDS",
    "failedAt": "2026-10-04T15:30:05Z"
  }
}
```

## Casos fuera de la versión 1

| Caso | Por qué queda afuera | Dónde se sigue |
|---|---|---|
| Ítem entregado y cobro no realizado (`CANCELLED(HOLD_NOT_SETTLED)`) | Es una anomalía de revisión manual | [[Q-019 - Aviso cuando el ítem se entregó sin cobro]] |
| Vida cobrada y no acreditada (`LIFE_PURCHASE_REJECTED` de Accounting) | Es una propuesta de Accounting del 2026-10-03, pendiente de confirmar con Mercado y con Notificaciones. La vida se cobró y la devolución la hace un administrador a mano, así que no encaja ni en "confirmada" ni en "fallida" | [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[Integración con Accounting]] |

## Dependencias con el contrato de Accounting (#5193)

La historia #5193 ya cubre parte de la brecha con el código. Su PR #88 (tareas T01 y T02) estaba abierta y sin aprobar el 2026-10-04.

| Tarea de #5193 | Qué resuelve para este contrato |
|---|---|
| T01 (PR #88) | Crea `orderRef` (UUID) en la orden; es el valor de `orderId` en estos eventos |
| T02 (PR #88) | Mueve `PURCHASE_CONFIRMED` a `market.events` |
| T04 | Cambia el productor a `market-service` |
| T05 y T06 | Reemplazan la entrega del ítem por `ITEM_CONFIRMED` → `ITEM_CREDITED`; con T06 la orden pasa a `CONFIRMED` al recibir `ITEM_CREDITED`. Accounting no publica una falla de entrega, así que el disparador de `ITEM_DELIVERY_FAILED` depende de [[Q-008 - Orden de la saga de compra]] |
| T07 | Guarda cada uno de los 10 motivos de rechazo de Accounting en la orden. Los motivos de `PURCHASE_FAILED` se derivan de ese mapeo |

## Otros eventos de la misma compra

Una compra confirmada también genera `ITEM_CONFIRMED` o `LIFE_PURCHASE_CONFIRMED`, dirigidos a Accounting y a Roadmap para acreditar el ítem o las vidas ([[DEC-009 - Contrato de holds e ítems según Accounting]]). **No son avisos para el alumno**: Notificaciones debe avisar solo con `PURCHASE_CONFIRMED` y `PURCHASE_FAILED`, para que una compra no genere dos avisos.

## Criterios acordados

Refinados con el equipo de Mercado el 2026-10-04, antes de enviar el contrato:

| Tema | Criterio | Motivo |
|---|---|---|
| Ítem entregado sin cobro | No se avisa; queda como revisión manual | Postura provisoria hasta que producto resuelva [[Q-019 - Aviso cuando el ítem se entregó sin cobro]] |
| Motivos de falla | Los 5 motivos normalizados, no los códigos de Accounting | Alcanzan para un aviso claro y no atan a Notificaciones con el contrato de Accounting |
| Precio en la compra fallida | No se incluye | No se cobró nada; el aviso no lo necesita |
| `producer` | `market-service` | [[DEC-008 - Nombre de productor y tópicos de Mercado]] |
| `offerName` y `quantity` | Se copian en la orden al crearla | El profesor puede editar la oferta después de la compra |
| Tipos de `orderId` y `offerId` | string | Preparado para el `orderRef` UUID de [[DEC-009 - Contrato de holds e ítems según Accounting]] |
| `holdId` | Opcional en `PURCHASE_CONFIRMED` | Trazabilidad; Notificaciones lo ignora |
| Key del mensaje | `studentId` | Mantiene en orden los avisos de un mismo alumno |
| Destino del aviso | No se sugiere | Es decisión de Notificaciones y del frontend |
| Comunicación | La envía el líder de Mercado | El contrato involucra una decisión del líder (DEC-008) |
| `orderId` | `orderRef` UUID | Es el id que comparten todos los eventos de la compra en el bus (PR #88) |
| `LIFE_PURCHASE_REJECTED` | Fuera de la versión 1, como pendiente | Depende de una propuesta de Accounting sin acordar y del orden de la saga |
| `ITEM_DELIVERY_FAILED` | Se mantiene, sujeto a [[Q-008 - Orden de la saga de compra]] | Existe en el código actual; con #5193 su disparador puede cambiar |

## Qué se espera de Notificaciones

- Agregar `PURCHASE_CONFIRMED` y `PURCHASE_FAILED` a lo que acepta su consumidor de `market.events`. Hoy acepta solo `TRADE_ITEM_PUBLISHED` y `AUCTION_STARTED` y descarta el resto sin registrarlo.
- Tratarlos con **un solo destinatario** (`studentId`), no con la lista `student_user_ids` de los avisos de ofertas.
- Descartar repetidos por `eventId`, como ya hace con `ProcessedEvent`. Con eso se cumple que el alumno reciba un solo aviso (escenario 3 de #1051).
- Ignorar los campos que no use y tratar un `reason` desconocido como error genérico.
- Definir el texto, el `notification_type` y la ruta de destino del aviso.

## Diferencias con el código actual

Hoy (`develop` en `276af529`) el código no cumple este contrato. Las tareas #1055 (T02) y #1056 (T03) cierran la brecha.

| Tema | Hoy en el código | Según este contrato |
|---|---|---|
| Tópico | `PURCHASE_CONFIRMED` sale por `market.orders.events` (`src/main/resources/application.properties`), que no existe en el broker | `market.events` (lo resuelve #5193 T02, PR #88) |
| Productor | `tema-09-mercado` en `PURCHASE_CONFIRMED` (`services/impl/OrderConfirmationServiceImpl.java`) | `market-service` (#5193 T04) |
| Ids y monto | `orderId` numérico interno, `offerId` numérico y `amount` decimal tomado de la respuesta de Accounting (`dtos/events/PurchaseConfirmedPayloadDto.java`) | `orderId` = `orderRef` UUID (#5193 T01, PR #88), `offerId` string y `amount` entero tomado de `appliedPrice` |
| Nombre, tipo y cantidad del ítem | `PURCHASE_CONFIRMED` no los lleva, y la orden no guarda el nombre de la oferta ni las vidas que otorga (`entities/OrderEntity.java`) | `offerName`, `itemType` y `quantity` copiados en la orden al crearla (requiere migración) |
| Compra fallida | No se publica nada: `services/impl/OrderHoldServiceImpl.java` y `services/impl/OrderItemProvisionServiceImpl.java` solo cambian el estado | `PURCHASE_FAILED` |
| Motivo del rechazo | Cualquier rechazo de Accounting termina en `REJECTED_INSUFFICIENT_FUNDS` (`OrderHoldServiceImpl.applyRejection`) | Mapear `ACCOUNT_UNAVAILABLE` y `PROCESSING_ERROR` aparte, a partir de #5193 T07 |
| Reenvío del relay | Si un envío falla, el relay corta la pasada y esa fila frena a las siguientes (`services/impl/OutboxRelayServiceImpl.java`) | Sin cambio en este contrato; lo trata [[S2-05 - Robustez de la compra]] |

## Acuerdos pendientes

- **Notificaciones:** aceptar el contrato, implementar el consumo y confirmar que el `studentId` que reciben de la plataforma es siempre un UUID (Mercado lo toma del header `X-User-Id` sin validarlo).
- **Producto:** [[Q-019 - Aviso cuando el ítem se entregó sin cobro]].
- **Contrato con Accounting (#5193):** coordinar con quien tome T07 el mapeo de motivos, y con T06 que `PURCHASE_CONFIRMED` se publique al pasar a `CONFIRMED`, sea cual sea el evento que lo dispare.
- **Accounting y Notificaciones:** acordar el aviso de `LIFE_PURCHASE_REJECTED` cuando se cierre [[Q-008 - Orden de la saga de compra]].

## Avisos de ofertas nuevas (#1052)

Lo que sigue ya está definido por la historia #1052 o por el código. El nombre del evento y a quién va dirigido siguen abiertos en [[Q-022 - Aviso de ofertas nuevas]]. Es el punto de partida de la tarea #1058 (T01 de #1052).

### Lo que comparte con los avisos de compra
- Mismo transporte: tópico `market.events`, productor `market-service`, envelope de 6 campos, `eventVersion = 1` y JSON en `camelCase`.
- Se escribe en el outbox dentro de la misma transacción que activa la oferta: si el envío falla, la oferta queda publicada igual y el relay reintenta.
- Un reenvío conserva el `eventId`, y Notificaciones descarta los repetidos. Así el alumno ve un solo aviso aunque el mismo hecho llegue dos veces.
- Mercado publica el hecho; el texto y el canal los decide Notificaciones.

### Cuándo se publica
| Hecho | ¿Avisa? |
|---|---|
| El profesor crea una oferta (queda activa al crearse: no hay borrador) | Sí, oferta nueva |
| El profesor pasa una oferta de pausada a activa | Sí, oferta reactivada |
| Cambio de precio, stock, nombre o descripción de una oferta activa | No |
| Pausar una oferta | No |
| Activación desde la ruta global del admin | Abierto en [[Q-022 - Aviso de ofertas nuevas]] |
| Reactivar una oferta vencida por fecha | Abierto en [[Q-022 - Aviso de ofertas nuevas]] |

El aviso de reactivación sale solo cuando la oferta pasa de `active = false` a `active = true`. Reenviar el mismo estado no genera aviso.

### Datos que pide la historia
| Campo | Tipo | Origen en `CourseCatalogOfferEntity` |
|---|---|---|
| `offerId` | string | `id` |
| `courseId` | string | `courseId` |
| `templateId` | string | `templateId` (plantilla base del ítem) |
| `offerName` | string | `customName` |
| `price` | integer | `coinPrice` (monedas) |
| `publishedAt` | string (ISO-8601 UTC) | Momento de la creación o de la reactivación |

Quedan abiertos en [[Q-022 - Aviso de ofertas nuevas]]: el `eventType` (uno o dos eventos), los destinatarios (`courseId` solo o lista de alumnos) y, según eso, la key del mensaje.

## Relacionado

[[Integración con Notificaciones]], [[Q-022 - Aviso de ofertas nuevas]], [[Eventos y Kafka]], [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[DEC-009 - Contrato de holds e ítems según Accounting]], [[Revisión del Sprint 2 en Taiga]].
