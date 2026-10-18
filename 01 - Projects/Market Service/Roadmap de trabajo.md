---
tipo: guia
estado: vigente
verificado_contra: codigo@7528610, codigo@2fc155ad
actualizado: 2026-10-18
tags: [mercado, roadmap]
---
# Roadmap de trabajo

> Próximos pasos priorizados. P0 bloquea el funcionamiento real; P1 es trabajo decidido de menor urgencia o pendiente de acuerdo; P2 es alcance futuro. Las decisiones del 2026-10-01 ([[Decisiones - Índice]]) convirtieron en tareas de código lo que antes eran dudas.

## P0. Bloqueantes

| # | Trabajo | Por qué | Referencias |
|---|---|---|---|
| 1 | **Alinear el contrato con Accounting.** Cambiar tópicos, mensajes (`ITEM_CONFIRMED` y `ITEM_CREDITED` en lugar de `ITEM_PROVISION_*`) y `order_id` UUID. El orden de la saga quedó adoptado bajo la Propuesta C ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]), cerrando [[Q-008 - Orden de la saga de compra]]. En `develop@d3b7a4de`, se encuentran completamente integrados y mergeados T01 (PR #179), T02 (PR #189), T03 (PR #182), T04 (PR #184), T05 (PR #188), T08 (PR #187) y la migración a `snake_case` (PR #186); ratificación de Accounting pendiente | Define la compatibilidad real en el bus | [[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Integración con Accounting]] |
| 1b | **`orderId` UUID canónico**: generar y persistir un `orderRef` UUID por orden y usarlo como `orderId` en todos los comandos. **Hecho para `HOLD_CREATE_REQUESTED`** (PR #88, `develop` en `349c8e2`); `ITEM_CONFIRMED` ya lleva el `orderRef` UUID desde US-7697 T02 (PR #189, `develop@d3b7a4de`); falta verificar el `orderId` de `PURCHASE_CONFIRMED` y de los demás eventos de la orden, que llevaban el `id` numérico | Con un id numérico, accounting rechaza todo `HOLD_CREATE_REQUESTED` con `MALFORMED_COMMAND` | [[DEC-009 - Contrato de holds e ítems según Accounting]], [[Orden de compra]] |
| 1c | **Tópicos por variables de entorno**: apuntar `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `_EVENTS` a `accounting.events` y publicar en `market.events` en lugar de `market.orders.events`. **Hecho como valores por defecto** (PR #88, `develop` en `349c8e2`). La verificación pendiente del tópico compartido quedó cerrada: `a4e6ac76` (US-5193 T03) hace que el listener descarte los comandos propios por `producer` antes de parsear, sin enviarlos a DLT ([[Eventos y Kafka]]) | Los tópicos actuales no existen en la plataforma | [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[Integración con Accounting]] (mensaje del 2026-10-01) |
| 2 | **Adoptar la Propuesta C para compra directa** ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]). Cerró [[Q-008 - Orden de la saga de compra]]. Se congela el contrato emisor de `ITEM_REVOKE_REQUESTED` y esquemas propuestos para Accounting (`ITEM_CREDIT_FAILED`, `ITEM_REVOKED`, `ITEM_REVOKE_FAILED`) pendientes de su ratificación | Define el flujo y la compensación de toda la compra | [[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Q-008 - Orden de la saga de compra]], [[Saga]] |
| 3 | **Proveer `BankHoldQueryClient` bajo `kafka`**: **Hecho en `develop`** (PR #116, `e456c55f`, issue #114). Se implementó `HttpBankHoldQueryClient` consumiendo `GET /api/accounting/holds/{holdId}` con token de servicio (desde el PR #139, el proveedor compartido con scope `accounting.account.read`) y soporte para activar la conciliación | Corrige el arranque con transporte `kafka` y habilita la reconciliación | [[Estado actual del código]] (gaps 1 y 3), [[DEC-009 - Contrato de holds e ítems según Accounting]] |
| 4 | **Integración real con Cursos** sobre `GET /api/course/course-cohorts/{id}/membership?user_id=`: mercado habilitado solo con la cohorte `ACTIVE`, acceso solo de alumnos validados y docentes asignados (`GESTOR` sin acceso), sin simulados y listado "Mis mercados". Replanificado el 2026-10-08 en [[S2-02 - Clientes reales de Cursos]]. **'Mis mercados' y listados por servicio implementados en `develop@2fc155ad` (PR #159, US-7382 T01-T04)** | Membresía puntual y eliminación de mocks pendientes; listados de Cursos y `GET /api/market/courses` ya resueltos | [[Integración con Cursos]], [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]], [[DEC-021 - Acceso al mercado por membresía de Cursos]], [[DEC-022 - Contrato de membresía con Cursos]], [[DEC-023 - Sin mocks de Cursos en el código]], [[DEC-024 - Listado Mis mercados]] |
| 5 | Unificar la variable de entorno de Kafka | Evita que prod use `localhost:9092` | gap 7 de [[Estado actual del código]] |
| 6 | CI (`mvn verify`) en PR a `develop` | Hoy solo se verifica hacia `main` | [[Git workflow]] |
| 7 | **Puerto 8100 en la plataforma**: hacer `pull` de `tpi-system-compose` (el clon local está 96 commits atrás) y verificar que `.tpi/platform/.env` tenga `PORT=8100` (la plantilla define `SERVER_PORT=${PORT}`; gestión 8101) | Con otro puerto, el servicio no queda alcanzable en la plataforma | [[Q-016 - Puerto y registro de Mercado en la plataforma]], [[Mapa de servicios]] |

El trabajo 1 depende parcialmente del 2 y exige pedidos a Accounting (D4 y D10 en [[Taller de decisiones]]). La consecuencia de [[DEC-001 - Accounting es dueño del inventario]] es que no se construirá nada de inventario en Mercado.

## P1. Trabajo decidido y pendientes de acuerdo

Tareas de código derivadas de decisiones:

- **Nombre del productor**: resuelto en `develop` (PR #102, `2485d8cf`, US-5193 T04): reemplazó `tema-09-mercado` por `market-service` en todos los mensajes salientes ([[DEC-008 - Nombre de productor y tópicos de Mercado]]).
- **Mapear los motivos de rechazo de accounting**: resuelto en `develop` (PR #110, `f7457882`, US-5193 T07). Se mapearon los 10 motivos contractuales en `OrderRejectionReason`, se incorporó el estado terminal `REJECTED` y el campo `rejectionReason` en la orden, con mensajes provisionales en español (`OrderRejectionMessageServiceImpl`) a la espera de la definición final con producto ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[Estado actual del código]] gap 22 cerrado).
- **Enviar motivo de liberación como enum tipado**: resuelto en `develop` (PR #115, `5de30854`, US-5193 T08). `BankHoldReleaseReason` restringido estrictamente a los 3 valores contractuales de Accounting (`AUCTION_LOST`, `AUCTION_CANCELLED`, `PURCHASE_NOT_COMPLETED`) con DTO tipado (`BankHoldReleaseRequestDto`), parseo estricto `Optional` y `OrderHoldServiceImpl.expireGrantedHold` optimizado sin liberaciones redundantes ([[DEC-009 - Contrato de holds e ítems según Accounting]]).
- **Publicar `ITEM_CONFIRMED` y consumir `ITEM_CREDITED` (contrato con Accounting)**: resuelto en `develop` (PR #151, `966bdd00`, US-5193 T05 y T06 / Tasks #5198 y #5199). `ItemProvisionDispatcher` publica `ITEM_CONFIRMED` con los 7 campos canónicos y UUID `orderRef` en `market.events` alternado por toggle, y `AccountingItemCreditedEventHandler` consume `ITEM_CREDITED` en `accounting.events` deduplicando por `eventId` y avanzando la orden a `ITEM_PROVISIONED` e iniciando la confirmación del hold ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-025 - Saga de compra de ítems según la Propuesta C]], [[Integración con Accounting]]).
- **Quitar `itemValidityDays`** de la entidad de oferta, DTO, validaciones y datos de demostración ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]], gap 15).
- **Compra de vidas y emisión de `LIFE_PURCHASE_CONFIRMED`**: señal acordada con Accounting el 2026-10-02 e incorporada como historia en el Sprint 2 ([[S2-10 - Compra de vidas con LIFE_PURCHASE_CONFIRMED]]). Mercado publica `LIFE_PURCHASE_CONFIRMED` en `market.events` tras confirmar el débito del hold; Accounting aplica su tope (acredita hasta el máximo o 0 si llegó al tope sin devolver monedas) y reporta con `LIFE_CREDITED` en `accounting.events` ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]).
- **Acuerdos de compra de vidas del 2026-10-04**: validación del tope antes del hold, `orderId` UUID unificado y manejo de `LIFE_PURCHASE_REJECTED` con orden cobrada sin acreditar ([[S2-11 - Acuerdos de compra de vidas con Accounting]]). Falta: que Accounting publique `LIFE_PURCHASE_REJECTED` y consumir PAR-12 desde Backoffice en lugar de configurarlo. El token de servicio quedó resuelto en el PR #139 (US-5193 T09).
- **Token de servicio para Accounting**: resuelto en `develop` (PR #139, `6926af1`, US-5193 T09, issue #126). Los dos clientes REST de Accounting envían el token propio de Mercado con `accounting.account.read`, y se eliminaron el token fijo `ACCOUNTING_SERVICE_TOKEN` y el cliente duplicado `IdentityServiceTokenClient` ([[Integración con Accounting]]). Pendiente fuera de Mercado: sumar `course.enrollment.read` a los `needs` de `market-service` en tpi-system-compose antes de que el cliente de Cursos sea siempre el real.
- **Endurecer la autorización**: quitar el respaldo `X-Roles`, reemplazar el parseo con `contains()` por comparación exacta y no omitir el chequeo de profesor con cabecera vacía ([[DEC-006 - Roles y permisos según el código y los headers del gateway]], gap 12).
- Tareas del código derivadas de los gaps: fijar con una prueba que la unidad de una compra `HOLD_NOT_SETTLED` queda retenida ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]; el gap 19 no era un defecto), reconciliar órdenes que quedan en `CREATED`, idempotencia por estudiante ([[Estado actual del código]], gaps 13 a 21).

Coordinación y comunicación:

- **Taiga**: cerrar o quitar las historias de la épica #770 sobre vencimiento de ítems (#778, #785 a #788), conservando lo que trate del vencimiento de la publicación ([[Épica 770 - Vencimiento de items]], [[Q-013 - Higiene del backlog]]).
- Informar a Notificaciones del `SNAKE_CASE` en inglés y del tópico `market.events` ([[Integración con Notificaciones]]); informar a Frontend del contrato HTTP ([[DEC-005 - Endpoints y prefijos según el código]]).
- Pedidos a Accounting: ratificación de revocación de ítems (`ITEM_REVOKE_REQUESTED`), esquemas de respuesta propuestos ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]), y D4, D6, D10 ([[Taller de decisiones]]).
- **Reglas de la tienda** ([[DEC-013 - Reglas de la tienda]]):
  - Incrementar `unitsSold` al confirmar la orden y calcular disponible = total - vendidos - reservados (T1). Es un defecto de sobreventa: prioridad dentro de P1.
  - Aceptar `publicationExpiresAt` en `CatalogOfferPublishDto` y `CatalogOfferUpdateDto` (T6 modificada): **propuesto en PR #113, pendiente de integración**. El contrato de fecha/TTL y extensión estrictamente posterior provisional se registra en [[DEC-013 - Reglas de la tienda]]; ratificación pendiente.
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
| Sprint 3 | Subastas y/o propuestas nuevas | [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[Épica 577 - Subastas]]; [[Meta colectiva]] ([[DEC-029 - Meta colectiva]]); [[Cofres y nuevos ítems]] e [[Ítems únicos]] |

Las subastas se especifican ya porque ambos sprints están en planificación. El anti-sniping quedó decidido (fase final ciega, con X configurable por subasta y la regla de la oferta ciega pendiente de detalle).

**Sprint 3 sin bloqueo por ítems únicos**: las subastas ofrecen ítems regulares del catálogo ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]); [[Ítems únicos]] sigue como propuesta no aprobada.

## P2. Alcance futuro

- Subastas ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]], [[DEC-014 - Reglas de subastas]], [[Épica 577 - Subastas]]). Incluye `HOLD_INCREASE_REQUESTED` con el total nuevo y el manejo de `HOLD_INCREASED`; un `HOLD_RELEASE_REQUESTED` por postor; modo ciega y fase final ciega (anti-sniping) con desempate por dado decidido en el servidor (en revisión: [[Q-025 - Desempate de las subastas]]). Previstas para el Sprint 3.
- Meta colectiva: decidida en [[DEC-029 - Meta colectiva]], sin código; los detalles del contrato siguen en [[Q-026 - Detalles del contrato de la meta colectiva con Accounting]].
- Cofres: decididos en [[DEC-031 - Cofres configurables con ítems, monedas y XP]] a [[DEC-034 - Acreditación de premios de cofre en Accounting]], sin código. Se construyen en dos fases ([[DEC-035 - Cofres en dos fases]]): primero con premios de ítem y después con monedas y XP. Las historias se cargan en la próxima planning.
- Propuestas sin aprobar: el resto de [[Cofres y nuevos ítems]] e [[Ítems únicos]].
- Eventos de notificaciones (`CATALOG_OFFER_PUBLISHED`) y consumo de `COURSE_COHORT_ARCHIVED` y `STUDENT_UNENROLLED` ([[Integración con Notificaciones]], [[Integración con Cursos]]).

Backlog completo en [[Backlog - Índice]].

## Seguimiento acotado de US-5207 — 2026-10-05

[PR #113 de tpi-market](https://github.com/2026-P4-BE/tpi-market/pull/113) (fuente original `669ba7d0`) propone T05 (#5212) y T06 (#5213) de [[S2-03 - Reglas de la tienda]]. Aún requiere aprobación e integración en `develop`; este registro no cierra Taiga ni los demás pendientes del roadmap. Los ajustes locales de revisión se separan del snapshot base en [[Estado actual del código]].
