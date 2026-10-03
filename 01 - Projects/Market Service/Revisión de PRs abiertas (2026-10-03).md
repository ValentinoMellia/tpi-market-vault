---
tipo: estado
estado: vigente
verificado_contra: codigo@276af52
actualizado: 2026-10-03
tags: [mercado, revision, pull-requests, codigo]
---
# Revisión de PRs abiertas (2026-10-03)

> Revisión de código de las cuatro PRs abiertas de `tpi-market` (#84, #85, #86 y #88) contra `develop` (`276af52`) y contra las reglas del repositorio. Hay un hallazgo alto (#85 repite el defecto de roles que corrige #86), uno medio (#88 no resuelve el tópico compartido con Accounting) y varios de proceso. También lista los cambios ya mergeados y las decisiones tomadas en código que todavía no tienen `DEC`.

## Fuentes y alcance

- Código: `tpi-market`, `develop` en `276af52`. Cabezas de las PRs: #88 `7b6a862`, #86 `6973b14`, #85 `9b846cb`, #84 `6bf4348`. Las cuatro parten de `276af52`.
- Reglas aplicadas: `AGENTS.md` de `tpi-market` (destino `develop`, plantilla completa, commits convencionales), `COMMANDS.md` y [[Git workflow]].
- Las afirmaciones sobre el código se verificaron leyendo los archivos de cada rama. Las pruebas que declaran los autores (939 a 969 tests en verde) **no se re-ejecutaron**.

## Estado de las PRs

| PR | Historia | Base | Borrador | CI | Mergeable | Revisión |
|---|---|---|---|---|---|---|
| #88 | US-5193 T01 y T02 ([[S2-01 - Contrato con Accounting]]) | `develop` (reabierta desde #87, que apuntaba a `main`) | No | `test` en rojo (ejecución de #87), nombre de PR en verde | Sí | Requerida |
| #86 | US-5214 T01, tarea #5215 ([[S2-04 - Seguridad]]) | `develop` | No | Solo nombre de PR (no corre `verify`) | Sí | Requerida |
| #85 | US-1053, tareas 1062 a 1065 | `develop` | Sí | Solo nombre de PR | Sí | Requerida |
| #84 | US-1013 T01, tarea 1029 | `develop` | Sí | Solo nombre de PR | Sí | Requerida |

Conflictos entre ellas (probados con `git merge-tree`): solo #84 contra #85, en `README.md` y en los archivos generados de `docs/java_doc`. Las demás combinaciones fusionan sin conflicto de texto.

El flujo `Code checks CI` (`.github/workflows/verify.yml`) corre solo en PR hacia `main` o `release/**`. El rojo de #88 viene de la PR #87, abierta primero desde la misma rama hacia `main` (2026-10-03 18:29, regla 1.1 del `AGENTS.md` de `tpi-market`) y cerrada a los tres minutos para reabrirla como #88 hacia `develop`: esa ejecución es la que corrió `mvn verify` y la que falló, y sus resultados quedaron asociados al mismo commit. Para #86, #85 y #84 no hay CI más allá de la verificación del nombre de rama.

## Hallazgos por gravedad

### Alta

**#85, el resumen de ventas repite el defecto de roles que corrige #86.**

- `src/main/java/ar/edu/utn/frc/tup/p4/services/impl/CourseSalesSummaryServiceImpl.java`, `validateAccess`: deja pasar sin chequear la asignación si `rolesHeader.contains("ADMIN")` o `rolesHeader.contains("GESTOR")`, y decide `otherRole` con `!rolesHeader.contains("PROFESSOR")`.
- Con `X-User-Roles: PROFESSOR,NOT_ADMIN` el usuario pasa `@PreAuthorize("hasAnyRole('PROFESSOR','ADMIN','GESTOR')")` por `PROFESSOR` y el service lo trata como administrador: ve las ventas de un curso que no dicta. Es el mismo patrón que #86 demuestra explotable en la gestión del catálogo.
- `CourseSalesSummaryController` conserva el respaldo `X-Roles` (`effectiveRoles`), que #86 elimina de los demás controladores y que [[DEC-006 - Roles y permisos según el código y los headers del gateway]] descarta.
- Qué hacer: rebasar sobre #86 y usar `UserRole.fromHeader` y `UserRole.hasAny`; quitar el parámetro `X-Roles`; agregar una prueba de subcadena en `CourseSalesSummaryServiceTest`.

### Media

**#88, el tópico compartido `accounting.events` sigue sin resolver** (gap 23 de [[Estado actual del código]]).

- Los defaults de `accounting-holds-commands` y `accounting-holds-events` pasan a ser el mismo tópico (`MessagingProperties.java`, `application.properties`).
- `AccountingHoldKafkaListener.onMessage` se suscribe a ese tópico y delega todo en `AccountingHoldEventHandler.handle`. El handler no filtra por `producer` ni por `eventType`: un comando propio sin `correlationId` conocido solo genera un `WARN`, y uno cuya correlación se resuelve se marca procesado y cae en `default ->` ("Unrecognized accounting hold event type"). No hay DLT, pero tampoco hay descarte explícito, y todo mensaje de otro dominio con otro payload puede terminar como `MalformedEventException` en DLT.
- Esto es lo que pide la tarea T03 de [[S2-01 - Contrato con Accounting]] (CA3 y escenario 2), que la PR no incluye: cubre T01 y T02.
- `KafkaSagaIntegrationTest` se modificó para **volver a fijar los tópicos de Accounting a los nombres viejos** (`accounting.holds.commands` y `accounting.holds.events`) con `@TestPropertySource`. Por eso la prueba de integración nunca ejercita el tópico compartido, que es el riesgo real. La descripción de la PR dice "verificación end-to-end con Kafka sobre `market.events`": solo cambia ese tópico y el de `ITEM_CONFIRMED`.

**#88, el `test` de CI está en rojo por un defecto previo.**

- Falla `KafkaSagaIntegrationTest` con `ExceptionInInitializerError`: `new KafkaContainer(DockerImageName.parse("apache/kafka:3.7.0"))` no declara `asCompatibleSubstituteFor("confluentinc/cp-kafka")` y Testcontainers rechaza la imagen. En CI hay Docker, así que la clase corre y falla; localmente se omite (`disabledWithoutDocker`), por eso nadie la vio fallar (gap 21 de [[Estado actual del código]]).
- No lo causa la PR (la inicialización de `KAFKA` es la misma en `develop`), pero la PR de `release/*` hacia `main` fallará igual con `mvn verify`. La ejecución roja fue la de #87 (base `main`): confirma qué verá la PR de release. El resultado del resto de la suite en esa corrida: 931 pruebas, un solo error, el de esta clase (la descripción de #88 declara 939 con 9 omitidas, que son las de esta clase cuando no hay Docker).

**#88, el respaldo `String.valueOf(orderId)` envía un id no UUID.** `OrderHoldServiceImpl.requestHold` usa `orderRef` y, si es `null` (órdenes anteriores al cambio), el id numérico. Accounting rechaza eso con `MALFORMED_COMMAND`, que además hoy se mapea a `REJECTED_INSUFFICIENT_FUNDS` (gap 22). El caso solo afecta a órdenes en vuelo durante el despliegue, pero conviene decidir si se rellena `orderRef` al leerlas o se acepta ese rechazo.

**#88, no cumple la regla 1.2 del `AGENTS.md` de `tpi-market`.** El checklist de la plantilla quedó con todos los ítems sin tildar (`- [ ]`) y el título nombra solo US-5193 aunque agrupa T01 y T02. La descripción sí completa las secciones.

**#88, el `orderRef` solo llega al comando del hold.** `PURCHASE_CONFIRMED`, `ITEM_CONFIRMED` y `LIFE_PURCHASE_CONFIRMED` siguen llevando el `orderId` numérico (`OrderConfirmationServiceImpl`, `order.getId()`), mientras que el contrato con Accounting pide el UUID en todos ([[S2-01 - Contrato con Accounting]], T05 y T06). No es una regresión de la PR, pero deja a esos eventos desalineados con el comando que ahora sí lleva el UUID.

### Baja y observaciones

**#86, parseo exacto de roles. Buena PR; cierra en parte el gap 12.**

- Introduce `models/enums/UserRole.java` con `fromHeader` (separa por comas, recorta, quita un solo `ROLE_` inicial, compara exacto y con mayúsculas) y `hasAny`. Lo usan `GatewayIdentityFilter.rolesOf` y los tres services de catálogo y gestión; se eliminan `contains()` y el respaldo `X-Roles` de los cuatro controladores.
- Lo que sigue abierto, declarado por el autor: cabecera vacía o ausente sigue omitiendo el chequeo de profesor (T02, tarea #5216); `usr-student-001` (T03, #5217); matriz de seguridad (T04, #5218). Un servicio con `X-Service-Scopes: MS` pasa `@PreAuthorize` en `PATCH /offers/{id}/status` pero `validateAdminRole` lo rechaza porque los services solo leen `X-User-Roles` (preexistente).
- Cambios de comportamiento que introduce, sin `DEC`: los roles desconocidos ya no se convierten en autoridades y `/whoami` deja de listarlos; `ROLE_PROFESSOR` produce `ROLE_PROFESSOR` y no `ROLE_ROLE_PROFESSOR`; la especificación de `gateway-mesh-integration` ("prefijo `ROLE_` incondicional") se refina a "quitar un `ROLE_` y luego prefijar". Ver la tabla de decisiones pendientes.
- No incluye javadoc generado y deja el ítem de cobertura sin tildar con la explicación (no hay JaCoCo). Es la forma correcta de completar la plantilla.

**#84 y #85, proceso.**

- Ambas están en borrador y cada una versiona unos 460 a 490 archivos generados de `docs/java_doc` más `README.md`. `COMMANDS.md` §1 dice que el javadoc se genera solo en ramas de release; el mismo desvío está en las PR ya mergeadas #78 y #82. Además hace que #84 y #85 se pisen entre sí y ensucia la revisión (el diff real de #84 son 6 archivos de código y el de #85 unos 14).
- #85 y #84 tienen el texto de la PR en inglés; el resto de las PR del repositorio está en español. No hay regla escrita; se anota.
- Ambas dejan sin tildar "cobertura mayor a 80 %" sin explicar el motivo.

**#85, límites declarados por el autor.** El formato del reporte no se acordó con Administración (ver [[Q-019 - Formato del resumen de ventas para Administración]]); las compras rechazadas por falta de stock no se persisten, así que no aparecen en `failures`; la ruta es `GET /api/market/courses/{courseId}/sales/summary` y no el prototipo de Taiga `/api/cursos/{cursoId}/mercado/resumen` (coherente con [[DEC-005 - Endpoints y prefijos según el código]]); las unidades vendidas son la cantidad de órdenes `CONFIRMED` y no `unitsSold` (que sigue sin incrementarse, gap 4); el período se aplica sobre la fecha de creación de la orden. Una sola consulta JPQL agrupada, sin datos de alumnos.

**#84, semántica del saldo del Banco simulado.** `MockBankBalances` (solo con transporte `mock`) guarda en memoria un saldo por `studentId:courseId`. `market.messaging.mock.bank.default-balance` vacío significa ilimitado; `balances[studentId:courseId]` lo sobrescribe; conceder un hold reserva el monto, liberar lo devuelve y confirmar lo deja cobrado. Se pierde al reiniciar y un hold nunca liberado ni confirmado deja las monedas reservadas. Los centinelas por `studentId` siguen funcionando.

## Cambios y decisiones tomados en código sin `DEC`

Todo lo de esta tabla está **pendiente de formalizar**. No son decisiones del vault: describen lo que el código hace o hará. Para registrarlas hace falta una `Q-NNN` y confirmación explícita del equipo.

| Origen | Qué se decidió en el código | Relacionado |
|---|---|---|
| #86 (abierta) | Un único parser de roles; los roles desconocidos no son autoridades; `/whoami` no los lista; se refina la regla del prefijo `ROLE_` | [[DEC-006 - Roles y permisos según el código y los headers del gateway]], [[S2-04 - Seguridad]] |
| #85 (abierta) | Semántica del resumen de ventas: unidades = órdenes `CONFIRMED`, ventana por fecha de creación, motivos de falla derivados del estado, ruta bajo `/api/market` | [[DEC-005 - Endpoints y prefijos según el código]], [[Q-019 - Formato del resumen de ventas para Administración]] |
| #78 (mergeada) | La compra de vidas publica `LIFE_PURCHASE_CONFIRMED` en `market.events`, una vez por orden y tras el cobro, y no `ITEM_CONFIRMED` con `itemType=LIFE`; la cantidad sale de `livesGranted` de la oferta | [[DEC-007 - Tope de vidas, Accounting decide y reporta]], [[Q-002 - Vidas y tope de vidas]], [[Tipos de item]] |
| #82 (mergeada) | La orden guarda `itemType` al crearse; un evento de vida omitido se registra con la métrica `market.life_purchase.event_skipped{reason}` y se cuenta después del commit | [[Orden de compra]] |
| #76 (mergeada) | Formato de cable `snake_case` en la API REST; `ErrorApi` y `FieldErrorApi` siguen en `camelCase`. Exige mergear junto con la PR del frontend | [[DEC-005 - Endpoints y prefijos según el código]], [[Errores de la API]] |
| #88 (abierta) | `orderRef` UUID persistido (único, nulo para órdenes anteriores) como `orderId` del hold; tópicos por defecto `accounting.events` y `market.events` (ejecuta DEC-008 y DEC-009, pero fija además `order-events` en `market.events`) | [[DEC-008 - Nombre de productor y tópicos de Mercado]], [[DEC-009 - Contrato de holds e ítems según Accounting]] |

## Relación con el backlog

- [[S2-01 - Contrato con Accounting]]: #88 entrega T01 y T02. Faltan T03 (ignorar comandos propios), T04 a T08.
- [[S2-04 - Seguridad]]: #86 entrega T01.
- #1013 y #1053 de Taiga: [[Q-018 - Alcance real del Sprint 2 en Taiga]] propone cerrar la primera como obsoleta y mover la segunda al backlog, pero #84 y #85 ya implementan trabajo de ambas. El alcance de esas historias hay que decidirlo en esa pregunta; ver [[Revisión del Sprint 2 en Taiga]].

## Orden de merge sugerido

1. #86, porque #85 debe usar su parser.
2. #88, una vez corregido el test de Kafka (o con el defecto previo aceptado y registrado) y con T03 programada.
3. #85, rebasada sobre #86 y sin los archivos de javadoc.
4. #84, sin javadoc, después de #85 para no resolver el conflicto de `README.md` dos veces.

## Pendientes de verificar

- Que Accounting publique en `accounting.events` mensajes que no sean los de hold, y qué `producer` llevan, para decidir el filtro de T03.
- Qué muestra el gateway real en `X-User-Roles` (mayúsculas, prefijo `ROLE_`): #86 es fail-closed si llega en minúsculas.
- Si el consumidor de `LIFE_PURCHASE_CONFIRMED` existe del lado de Accounting ([[Integración con Accounting]] lo describe solo en una rama sin integrar).

## Relacionado

[[Estado actual del código]], [[Git workflow]], [[Roadmap de trabajo]], [[Gateway e identidad]], [[Eventos y Kafka]].
