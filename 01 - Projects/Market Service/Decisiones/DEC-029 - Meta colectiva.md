---
tipo: decision
estado: vigente
verificado_contra: codigo@ac05a77f, accounting@8f11dbd, equipo-accounting@2026-10-15
actualizado: 2026-10-15
tags: [mercado, decision, meta-colectiva, accounting, kafka]
---
# DEC-029 - Meta colectiva

> El profesor publica una meta en su curso: un beneficio, un monto en monedas y una fecha de cierre. Aporta quien quiere, la meta se cumple al alcanzar el monto, y el cobro a todos los aportantes es atómico y va antes de la entrega. Acordada por Mercado y Accounting; los detalles del contrato que siguen abiertos están en [[Q-026 - Detalles del contrato de la meta colectiva con Accounting]].

## Contexto
Accounting (Persona 2) propuso una "compra colectiva" con dos modos: una vaquita abierta y una compra de todo el curso por unanimidad. Mercado tenía su propia propuesta, [[Meta colectiva (Colecta)]], que se descartó por desactualizada y sin verificar.

Mercado diseñó una contrapropuesta con 31 decisiones (D1 a D31), verificada contra el código de los dos servicios y el bus de la plataforma el 2026-10-14. Mercado y Accounting la aceptaron el 2026-10-15. No partió de una `Q`: es un acuerdo entre los dos equipos.

## Decisión
Acordada por Mercado y Accounting el 2026-10-15. El detalle de reglas, estados y flujos está en [[Meta colectiva]].

### Producto
| # | Decisión |
|---|---|
| D1 | Una sola modalidad: aporta quien quiere, y la meta se cumple si se alcanza el monto. No hay modo "todo el curso" |
| D2 | Solo el profesor crea metas |
| D3 | El profesor elige el modo de aporte: monto libre (mínimo y tope por alumno opcionales) o cuota fija, que se paga una sola vez |
| D4 | Un ítem de la plataforma va solo a los aportantes. Un beneficio externo (un punto extra, posponer un examen) lo reparte el profesor por su cuenta, y puede alcanzar a todo el curso |
| D5 | Si la meta falla, el profesor elige al crearla si las monedas se devuelven (por defecto) o se pierden |

### Aportes
| # | Decisión |
|---|---|
| D6 | En monto libre, los aportes se acumulan hasta el tope. El frontend recorta lo que escribe el alumno y el backend vuelve a validar |
| D7 | Un aporte no se retira ni se reembolsa. Antes de aportar hay un cartel de confirmación obligatorio |
| D8 | El último aporte paga solo lo que falta, también en cuota fija |
| D13 | El backend recorta el aporte al menor entre lo pedido, lo que le queda al alumno de su tope y lo que le falta a la meta. Solo rechaza si el resultado es 0 |
| D14 | Aporte mínimo opcional en monto libre. El último aporte queda exento |
| D15 | Mercado lleva un monto comprometido (incluye los aportes en vuelo) y uno confirmado. Cada alumno tiene un solo aporte en vuelo a la vez |
| D16 | El profesor ve la lista de aportantes, con los montos solo en monto libre. Los alumnos no ven ni quién aporta ni cuánto |

### Ciclo de vida
| # | Decisión |
|---|---|
| D9 | La meta se cumple al alcanzar el monto; la fecha de cierre solo marca cuándo falla |
| D10 | Beneficio externo: se cobra, se avisa al profesor y al curso, y la meta queda cumplida |
| D11 | Que el profesor la cierre antes es una cancelación: se devuelve todo, aunque la meta tuviera pérdida configurada |
| D12 | Después del primer aporte, solo se edita a favor del alumno: extender el cierre o bajar el monto |
| D21 | Si un aportante se da de baja del curso, su aporte siempre se devuelve |
| D22 | La meta tiene borrador, y también se puede publicar al crearla. Programar la apertura queda para más adelante |
| D23 | No hay límite de metas por curso. La duración máxima es de 2 meses desde la publicación (podría ser un parámetro de BackOffice) |
| D24 | Si el curso se archiva, la meta se cancela y se devuelve todo |
| D25 | Al cerrar, no se aceptan aportes nuevos y los holds que llegan tarde se liberan. Si el cobro en lote se rechaza, la meta vuelve a `OPEN`, o falla si ya pasó el cierre |
| D26 | Se avisa la publicación, las 24 h antes del cierre y el resultado |

### Integración con Accounting
| # | Decisión |
|---|---|
| D17 | Meta cumplida con ítem: primero el cobro, atómico para todos (`COLLECTIVE_PURCHASE_CONFIRM_REQUESTED`), y después un `ITEM_CONFIRMED` por aportante |
| D18 | Los cobros van en lote y atómicos (meta cumplida y pérdida). Las devoluciones van de a un hold, con `HOLD_RELEASE_REQUESTED` |
| D19 | `order_id` = `goal_ref` de la meta (UUID), el mismo para todos los holds |
| D20 | Accounting suma un comando para extender el vencimiento de los holds de una orden |

### Ítems
| # | Decisión |
|---|---|
| D27 | El ítem se elige de una oferta del catálogo o de una plantilla. Siempre se guarda una copia, que no descuenta stock |
| D28 | Tipos permitidos: escudos y boosts por usos (`PER_EXAM`). Sin vidas ni boosts por tiempo |
| D29 | Cada aportante recibe una unidad |
| D30 | Todos los aportantes reciben lo mismo |
| D31 | La meta da un ítem o un beneficio externo, nunca los dos |

### Diferencia con la compra directa
La meta **invierte el orden de [[DEC-025 - Saga de compra de ítems según la Propuesta C]]**, que entrega el ítem antes de cobrar. En la meta es a propósito: si se entregaran primero los N ítems y el cobro en lote se rechazara (por ejemplo, porque un alumno se dio de baja), quedarían ítems sin pagar. Además, Accounting no atiende hoy `ITEM_REVOKE_REQUESTED` ni emite `ITEM_CREDIT_FAILED` ([[Integración con Accounting]]). DEC-025 sigue vigente para la compra directa.

## Alternativas descartadas
- **Modo "todo el curso" con unanimidad (Accounting):** casi nunca se concretaría, porque siempre hay alumnos que no participan. El beneficio para todo el curso queda cubierto por el beneficio externo (D4).
- **Que los alumnos creen metas (Accounting):** el profesor controla el ítem, el precio y los plazos, igual que en el catálogo.
- **Retirar un aporte antes del cierre (Accounting):** la meta podría llegar al 100% y caer justo antes del cierre. Además, por la regla de un hold por orden, quien se retira no podría volver a aportar.
- **Entregar antes de cobrar, como en [[DEC-025 - Saga de compra de ítems según la Propuesta C]]:** ver "Diferencia con la compra directa".
- **`releaseHoldsByOrder` (Accounting):** liberar no necesita ser atómico, y el comando por hold ya funciona. La documentación de Accounting también lo considera probablemente innecesario.
- **Vencimiento fijo por duración máxima, en lugar del comando de extensión:** agregaba configuración confusa para el profesor (D20).
- **Ofrecer vidas y boosts por tiempo:** como el cobro va primero, una vida que supere el tope del alumno, o un boost que Accounting no puede acreditar (`max_charges` nulo), se cobrarían sin entregarse.
- **[[Meta colectiva (Colecta)]] (propuesta anterior de Mercado):** archivada por desactualizada y sin verificar.

## Consecuencias
- **Mercado (no hay código todavía en `tpi-market` `ac05a77f`):** tablas `goal` (id `Long` y `goal_ref` UUID), `goal_contribution` y `goal_contribution_request`, la API de metas, el job de cierre y la mensajería para entidades que no son órdenes. El detalle está en [[Meta colectiva]].
- **Accounting:**
  - Agregar `COLLECTIVE_PURCHASE` a los tipos de orden y `increaseHold` para ese tipo, tanto en el servicio como en `CoinHoldEntity.increaseTo`.
  - Agregar dos tipos de débito (meta cumplida y pérdida), incluidos en `CoinLedgerEventType.resolveFrom` y `CoinsLedgerEntryEntity.validateSign`.
  - Agregar los motivos de liberación, el cobro atómico y el comando de extensión.
- **Tema 11:** la key `course_id:order_id` de los mensajes colectivos cambia la `AccountingKey` del AsyncAPI de Accounting y necesita su visto bueno.
- **Fuera de Mercado y Accounting:** los avisos a todo el curso necesitan la lista de alumnos de [[Integración con Cursos|Cursos]] y tipos de evento nuevos en [[Integración con Notificaciones|Notificaciones]].
- Lo que todavía no se acordó (nombres, la forma de la pérdida y de la extensión, los márgenes, las fallas de acreditación) queda en [[Q-026 - Detalles del contrato de la meta colectiva con Accounting]].
- Varias piezas sirven también para las subastas: ver [[Meta colectiva#Qué sirve también para subastas]].

## Notas afectadas
[[Meta colectiva]], [[Integración con Accounting]], [[Integración con Cursos]], [[Integración con Notificaciones]], [[Subasta]], [[Decisiones - Índice]], [[Roadmap de trabajo]], [[Market Service - Overview]], [[Glosario]], [[Meta colectiva (Colecta)]] (archivada).
