---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-03
tags: [mercado, roadmap]
---
# Roadmap de trabajo

> Próximos pasos priorizados. P0 bloquea el funcionamiento real; P1 es trabajo decidido de menor urgencia o pendiente de acuerdo; P2 es alcance futuro. Las decisiones del 2026-10-01 ([[Decisiones - Índice]]) convirtieron en tareas de código lo que antes eran dudas.

## P0. Bloqueantes

| # | Trabajo | Por qué | Referencias |
|---|---|---|---|
| 1 | **Alinear el contrato con Accounting.** Cambiar tópicos, mensajes (`ITEM_CONFIRMED` y `ITEM_CREDITED` en lugar de `ITEM_PROVISION_*`) y `orderId` UUID. El **orden de la saga** sigue abierto: la activación de `ITEM_CONFIRMED` depende de él | Hoy Mercado y Accounting no se entienden: ninguno de los mensajes del código de Mercado llega al otro lado | [[DEC-009 - Contrato de holds e ítems según Accounting]], [[Integración con Accounting]] (tabla de diferencias) |
| 1b | **`orderId` UUID canónico**: generar y persistir un `orderRef` UUID por orden y usarlo como `orderId` en todos los comandos | Con un id numérico, accounting rechaza todo `HOLD_CREATE_REQUESTED` con `MALFORMED_COMMAND` | [[DEC-009 - Contrato de holds e ítems según Accounting]] |
| 1c | **Tópicos por variables de entorno**: apuntar `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `_EVENTS` a `accounting.events` y publicar en `market.events` en lugar de `market.orders.events`; verificar antes que el listener ignora los comandos propios en el tópico compartido (sin DLT) | Los tópicos actuales no existen en la plataforma | [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[Integración con Accounting]] (mensaje del 2026-10-01) |
| 2 | **Acordar [[Q-008 - Orden de la saga de compra]]** con Accounting. Postura de Mercado: entregar el ítem primero; exige pedir a Accounting la revocación de ítems (no existe) y un evento de error al fallar el acreditado | Define el flujo y la compensación de toda la compra | [[Q-008 - Orden de la saga de compra]], [[Saga]] |
| 3 | Proveer `BankHoldQueryClient` bajo `kafka`: cuando accounting integre `GET /api/accounting/holds/{holdId}` (en implementación este sprint), implementar el cliente real y encender `bank-hold.reconciliation.enabled` | La app no arranca con el transporte de docker/prod; la consulta de accounting aún no está integrada | [[Estado actual del código]] (gap 1), [[DEC-009 - Contrato de holds e ítems según Accounting]] |
| 4 | Clientes reales de Cursos usando `GET /course-cohorts/{id}/membership`; el cliente simulado es `@Primary` incluso en producción | Hoy toda inscripción es simulada | [[Integración con Cursos]] |
| 5 | Unificar la variable de entorno de Kafka | Evita que prod use `localhost:9092` | gap 7 de [[Estado actual del código]] |
| 6 | CI (`mvn verify`) en PR a `develop` | Hoy solo se verifica hacia `main` | [[Git workflow]] |
| 7 | **Puerto 8100 en la plataforma**: hacer `pull` de `tpi-system-compose` (el clon local está 96 commits atrás) y verificar que `.tpi/platform/.env` tenga `PORT=8100` (la plantilla define `SERVER_PORT=${PORT}`; gestión 8101) | Con otro puerto, el servicio no queda alcanzable en la plataforma | [[Q-016 - Puerto y registro de Mercado en la plataforma]], [[Mapa de servicios]] |

El trabajo 1 depende parcialmente del 2 y exige pedidos a Accounting (D4 y D10 en [[Taller de decisiones]]). La consecuencia de [[DEC-001 - Accounting es dueño del inventario]] es que no se construirá nada de inventario en Mercado.

## P1. Trabajo decidido y pendientes de acuerdo

Tareas de código derivadas de decisiones:

- **Nombre del productor**: reemplazar `tema-09-mercado` (usado en `PURCHASE_CONFIRMED`) por `market-service` en todos los mensajes ([[DEC-008 - Nombre de productor y tópicos de Mercado]]).
- **Mapear los motivos de rechazo de accounting**: `ACCOUNT_NOT_FOUND`, `ACCOUNT_INACTIVE`, `HOLD_ALREADY_EXISTS`, `HOLD_NOT_FOUND`, `INVALID_HOLD_STATE`, `INVALID_AMOUNT`, `INVALID_ORDER_TYPE`, `INVALID_TTL`, `MALFORMED_COMMAND` a estados o mensajes propios en lugar de `REJECTED_INSUFFICIENT_FUNDS` ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[Estado actual del código]] gap 22). Falta definir con producto qué ve el estudiante.
- **Quitar `itemValidityDays`** de la entidad de oferta, DTO, validaciones y datos de demostración ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]], gap 15).
- **Manejar el resultado de Accounting ante el tope de vidas**: reaccionar (liberar el hold o reflejarlo en la orden) al evento y motivo que Accounting publique. **Bloqueada** hasta acordar con Accounting la señal exacta. Ya no existe la tarea "Mercado valida el tope antes del hold" ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]).
- **Endurecer la autorización**: quitar el respaldo `X-Roles`, reemplazar el parseo con `contains()` por comparación exacta y no omitir el chequeo de profesor con cabecera vacía ([[DEC-006 - Roles y permisos según el código y los headers del gateway]], gap 12).
- Tareas del código derivadas de los gaps: liberar el stock en `HOLD_NOT_SETTLED`, reconciliar órdenes que quedan en `CREATED`, idempotencia por estudiante ([[Estado actual del código]], gaps 13 a 21).

Coordinación y comunicación:

- **Taiga**: cerrar o quitar las historias de la épica #770 sobre vencimiento de ítems (#778, #785 a #788), conservando lo que trate del vencimiento de la publicación ([[Épica 770 - Vencimiento de items]], [[Q-013 - Higiene del backlog]]).
- Informar a Notificaciones del `SNAKE_CASE` en inglés y del tópico `market.events` ([[Integración con Notificaciones]]); informar a Frontend del contrato HTTP ([[DEC-005 - Endpoints y prefijos según el código]]).
- Pedidos a Accounting: revocación de ítems, evento de error al fallar el acreditado ([[Q-008 - Orden de la saga de compra]]), y D4, D6, D10 ([[Taller de decisiones]]).
- **Reglas de la tienda** ([[DEC-013 - Reglas de la tienda]]):
  - Incrementar `unitsSold` al confirmar la orden y calcular disponible = total - vendidos - reservados (T1). Es un defecto de sobreventa: prioridad dentro de P1.
  - Aceptar `publicationExpiresAt` en `CatalogOfferPublishDto` y `CatalogOfferUpdateDto` (T6 modificada): **pendiente de implementar**. Pendiente decidir si al extender solo se aceptan fechas posteriores.
  - Validar al publicar plantilla existente y activa, tipo coincidente y multiplicador en rango (T5).
  - Desactivar en lugar de borrar ofertas; dejar de usar `deleted` (T4).
  - Confirmar con Frontend que `courseId` es la cohorte (T3).
- [[Q-013 - Higiene del backlog]]: estados de Taiga, épica 131 hacia accounting. Las historias obsoletas se cierran, no se borran ([[DEC-015 - Política del backlog de Taiga]]).
- Recomendaciones del taller sin decidir: ver el estado de cada una en [[Taller de decisiones]].

## Sprint 2 y Sprint 3

Detalle de historias y tareas del Sprint 2: [[Plan del Sprint 2]].

Alcance definido en [[DEC-015 - Política del backlog de Taiga]] (2026-10-01). Capacidad de cada sprint: 14 días, 340 h entre 10 integrantes (unas 34 h por persona). Fechas: **Sprint 2 del lunes 2026-09-28 al domingo 2026-10-11** y **Sprint 3 del lunes 2026-10-12 al domingo 2026-10-25** (según el sprint "G11 - Sprint 2" de Taiga; el Sprint 3 aún no está creado en Taiga, fechas estimadas). Al 2026-10-01 el Sprint 2 lleva 4 de 15 días sin historias cargadas en Taiga: quedan unas 11 jornadas (~250 h de las 340 h), por lo que el alcance del Sprint 2 debe priorizar los P0. La carga en Taiga se hace con el CLI local del coordinador (el MCP de Taiga lee correctamente, verificado el 2026-10-03); la plantilla US ya está en `03 - Resources/Templates/`. Saneamiento del backlog ([[Q-013 - Higiene del backlog]]).

| Sprint | Alcance | Referencias |
|---|---|---|
| Sprint 2 | Alinear el contrato con Accounting y las reglas de la tienda | P0 1, 1b y 1c, y [[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]]; reglas de la tienda de P1 ([[DEC-013 - Reglas de la tienda]]: `unitsSold`, validaciones, desactivar, extensión de `publicationExpiresAt`) |
| Sprint 3 | Subastas y/o propuestas nuevas | [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[Épica 577 - Subastas]]; [[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]] e [[Ítems únicos]] |

Las subastas se especifican ya porque ambos sprints están en planificación. El anti-sniping quedó decidido (fase final ciega, con X configurable por subasta y la regla de la oferta sellada pendiente de detalle).

**Sprint 3 sin bloqueo por ítems únicos**: las subastas ofrecen ítems regulares del catálogo ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]); [[Ítems únicos]] sigue como propuesta no aprobada.

## P2. Alcance futuro

- Subastas ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]], [[DEC-014 - Reglas de subastas]], [[Épica 577 - Subastas]]). Incluye `HOLD_INCREASE_REQUESTED` con el total nuevo y el manejo de `HOLD_INCREASED`; un `HOLD_RELEASE_REQUESTED` por postor; modo ciega y fase final ciega (anti-sniping) con desempate por dado decidido en el servidor. Previstas para el Sprint 3.
- Propuestas sin aprobar: [[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]] e [[Ítems únicos]].
- Eventos de notificaciones (`CATALOG_OFFER_PUBLISHED`) y consumo de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` ([[Integración con Notificaciones]], [[Integración con Cursos]]).

Backlog completo en [[Backlog - Índice]].
