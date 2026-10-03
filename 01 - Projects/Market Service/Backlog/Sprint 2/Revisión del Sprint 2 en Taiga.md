---
tipo: estado
estado: en-disputa
verificado_contra: codigo@7528610
actualizado: 2026-10-03
tags: [mercado, backlog, sprint-2, taiga]
---
# Revisión del Sprint 2 en Taiga

> Foto del sprint "G11 - Sprint 2" de Taiga al 2026-10-02: tiene 25 historias, y no solo las 13 del [[Plan del Sprint 2]]. Suma 92 puntos frente a los 73 que prevé el plan (Taiga todavía tiene #5219 con 5 puntos y el plan ya lo subió a 8), con duplicados, historias ya hechas en el código y algunas que contradicen decisiones. El alcance final está abierto en [[Q-018 - Alcance real del Sprint 2 en Taiga]].

## Fuente y alcance

- Taiga, proyecto `1804026`, sprint "G11 - Sprint 2" (id `533590`, del 2026-09-28 al 2026-10-11), leído el 2026-10-02 con la descripción completa de cada historia.
- Código: `tpi-market`, rama `develop`, commit `7528610`. Las rutas citadas son relativas a `src/main/java/ar/edu/utn/frc/tup/p4/`.
- Esta nota describe lo que hay y propone acciones. Las acciones no están decididas: dependen de [[Q-018 - Alcance real del Sprint 2 en Taiga]]. En Taiga solo se tocaron las tareas de #1010, #1011 y #1012 (sección «Tareas de #1010, #1011 y #1012»); las historias no se modificaron.

## Qué hay en el sprint

Las historias llegaron en tres tandas.

| Tanda | Historias | Origen | Puntos en Taiga |
|---|---|---|---|
| A. Anteriores | #1010, #1011, #1012, #1013, #1037, #1038, #1051, #1052, #1053 | Creadas el 2026-09-17, épicas #1008, #1035 y #1050. No figuran en el plan ni en otras notas del vault | 22 |
| B. Del plan | #5193 a #5259 (12 historias, una por nota de [[Sprint 2 - Índice]]) y #4888 | Cargadas el 2026-10-02 desde las notas del vault. El texto de #5193 coincide con [[S2-01 - Contrato con Accounting]] | 70 (#4888 sin puntos) |
| C. Frontend | #5288, #5289, #5290 | Creadas la noche del 2026-10-02 sobre trabajo ya implementado en el frontend | 0 (la descripción dice 8 y 5; #5290 no tiene) |
| **Total** | **25** | | **92**, más 13 sin cargar |

### Detalle

| US | Título en Taiga | Pts | Estado | Nota del vault | Propuesta (pendiente de [[Q-018 - Alcance real del Sprint 2 en Taiga]]) |
|---|---|---|---|---|---|
| #1010 | Publicar el contrato de la API antes de programarla | 2 | New | — | Mantener con las tareas reescritas: [[US-1010 - Contrato de la API publicado]] |
| #1011 | Saber quién entra al Mercado y qué puede hacer | 2 | New | — | Cerrar como duplicada de #5214 y #5202 |
| #1012 | Que los avisos entre módulos no se pierdan ni se dupliquen | 3 | New | — | Cerrar como obsoleta: lo pendiente pasa a #5219 ([[S2-05 - Robustez de la compra]], tareas 6 y 7) y #5193 ([[S2-01 - Contrato con Accounting]]) |
| #1013 | Simular al Banco para poder probar sin esperarlo | 2 | New | — | Cerrar como obsoleta (hecha; la adaptación al contrato está en #5193) |
| #1037 | Dejar el Mercado en solo lectura cuando el curso se cierra | 3 | New | — | Sprint 2 con mock o Sprint 3 |
| #1038 | Bloquear las compras de un alumno que deja el curso | 3 | New | — | Sprint 2 con mock o Sprint 3; casi cubierta por #5202 |
| #1051 | Avisar al alumno cuando su compra termina | 2 | New | — | Mover al backlog (P2) y ajustar el formato |
| #1052 | Avisar cuando hay ofertas nuevas en el curso | 2 | New | — | Mover al backlog (P2) y ajustar el formato |
| #1053 | Ver cuánto se vendió en mi curso | 3 | New | — | Mover al backlog y corregir la ruta |
| #4888 | Organizar la documentación de Mercado en un vault | — | In progress | [[US-4888 - Organizar la documentación en un vault]] | Mantener |
| #5193 | Contrato con Accounting | 13 | New | [[S2-01 - Contrato con Accounting]] | Mantener |
| #5202 | Clientes reales de Cursos | 5 | New | [[S2-02 - Clientes reales de Cursos]] | Mantener |
| #5207 | Reglas de la tienda | 8 | New | [[S2-03 - Reglas de la tienda]] | Mantener |
| #5214 | Seguridad | 3 | New | [[S2-04 - Seguridad]] | Mantener |
| #5219 | Robustez de la compra | 5 | New | [[S2-05 - Robustez de la compra]] | Mantener; en el vault ya son 8 puntos y 29 h por lo que absorbe de #1012 |
| #5225 | Plataforma y CI | 3 | New | [[S2-06 - Plataforma y CI]] | Mantener |
| #5231 | Pruebas integradas con Accounting | 8 | New | [[S2-07 - Pruebas integradas con Accounting]] | Mantener |
| #5236 | Frontend de Mercado | 13 | New | [[S2-08 - Frontend de Mercado]] | Reducir a lo que no cubren #5288 a #5290 |
| #5243 | SPIKE: Lectura del vault | 3 | New | [[S2-09a - SPIKE Lectura del vault]] | Mantener |
| #5254 | SPIKE: Orden de la compra con Accounting | 2 | New | [[S2-09b - SPIKE Orden de la compra con Accounting]] | Mantener |
| #5256 | SPIKE: Diseño técnico de subastas | 5 | New | [[S2-09c - SPIKE Diseño técnico de subastas]] | Mantener |
| #5259 | SPIKE: SSE en el frontend | 2 | New | [[S2-09d - SPIKE SSE en el frontend]] | Mantener |
| #5288 | Selector de curso y cohortes del Mercado | — | In progress, figura cerrada | — | Corregir lo implementado y cargar puntos |
| #5289 | Hub y navegación del mercado por curso | — | In progress, figura cerrada | — | Corregir lo implementado y cargar puntos |
| #5290 | Mejora visual del catalogo | — | New, figura cerrada | — | Normalizar (prefijo, tags, puntos) y delimitar frente a #5236 |

Las opcionales [[S2-OPC1 - Reconciliación de compras]] y [[S2-OPC2 - Frontend de gestión del profesor]] no están cargadas en Taiga.

## Duplicados y solapamientos

### #1011 frente a #5214 y #5202

| Lo que pide #1011 | Qué hace hoy el código | Dónde queda cubierto |
|---|---|---|
| Saber quién hace el pedido y con qué rol | Hecho: `configs/filters/GatewayIdentityFilter.java` lee `X-User-Id` y `X-User-Roles` | — |
| CA3: rechazar el pedido sin identidad | En parte: sin cabeceras responde 401 (`configs/SecurityConfig.java`, `anyRequest().authenticated()`). Con identidad pero sin `X-User-Id`, los controladores asumen `usr-student-001` (`controllers/StorefrontCatalogController.java`, `StudentOrderController.java`, `CatalogOfferController.java`) | [[S2-04 - Seguridad]] (#5214), CA3 |
| CA2: un alumno no administra el catálogo | Hecho pero frágil: `services/impl/CourseCatalogManageServiceImpl.java` (líneas 163 a 189) compara con `contains()`, de modo que `NOT_ADMIN` cuenta como ADMIN; con cabecera vacía se omite el chequeo | [[S2-04 - Seguridad]] (#5214), CA1 y CA2 |
| Qué puede hacer dentro de cada curso | Simulado: `MockCourseEnrollmentClient` y `MockCourseInstructorClient` | [[S2-02 - Clientes reales de Cursos]] (#5202) |

Todo lo pendiente de #1011 queda dentro de #5214 y #5202, que lo piden con criterios más precisos.

### #1013 ya existe en el código

Con `market.messaging.transport=mock` (el valor por defecto en dev), `clients/impl/MockBankHoldClient.java` y `MockInventoryItemProvisionClient.java` responden en el mismo proceso por medio de `LoopbackDispatcher`. Para forzar cada resultado hay identificadores de alumno "centinela":

| Criterio de #1013 | Centinela |
|---|---|
| CA1: compra completa | cualquier alumno común |
| CA2: sin saldo | `student-insufficient-funds` |
| CA3: falla la acreditación del ítem | `student-inventory-failure` |
| Otros fallos | `student-bank-timeout`, `student-bank-confirm-failed`, `student-bank-confirm-unavailable`, `student-bank-unknown-code` |

Diferencias: el mock no maneja un saldo configurable por alumno, sino que decide por el identificador. Además, la historia habla de "Banco" (hoy Accounting, [[DEC-001 - Accounting es dueño del inventario]]) y su CA3 usa el protocolo `ITEM_PROVISION_*`, que [[S2-01 - Contrato con Accounting]] reemplaza por `ITEM_CONFIRMED` y `ITEM_CREDITED`. Esa misma historia ya incluye actualizar `LoopbackDispatcher` y sus pruebas.

Novedad del 2026-10-03: la PR #84 de `tpi-market` (borrador, tarea 1029 de #1013, no mergeada) agrega el saldo configurable por alumno y curso al Banco simulado (`market.messaging.mock.bank.default-balance` y `balances[studentId:courseId]`), que es justo la diferencia anotada arriba. La propuesta de cerrar #1013 como obsoleta depende de [[Q-018 - Alcance real del Sprint 2 en Taiga]]; mientras tanto hay trabajo en curso sobre ella ([[Revisión de PRs abiertas (2026-10-03)]]).

### #1053 tiene una PR abierta

La PR #85 (borrador, tareas 1062 a 1065 de #1053, no mergeada) implementa `GET /api/market/courses/{courseId}/sales/summary`, con la ruta bajo `/api/market` como pide [[DEC-005 - Endpoints y prefijos según el código]]. El formato del reporte no se acordó con Administración ([[Q-019 - Formato del resumen de ventas para Administración]]) y la revisión encontró un defecto de autorización que hay que corregir antes de mergear ([[Revisión de PRs abiertas (2026-10-03)]]). La propuesta de mover #1053 al backlog sigue abierta en [[Q-018 - Alcance real del Sprint 2 en Taiga]].

### #1012 está hecha salvo un extra

| Criterio | Estado en el código |
|---|---|
| CA1: no se pierde el aviso si la mensajería está caída | Hecho: [[Patrón Outbox]] (`entities/OutboxEventEntity.java`); `job/OutboxRelayJob.java` reintenta cada 2 s |
| CA2: un aviso repetido se procesa una vez | Hecho: deduplicación por `eventId` en `processed_events` y guarda de estado ([[Entrega at-least-once y deduplicación]]) |
| Orden por alumno | Hecho: `services/OutboxRelayService.java` envía con el `studentId` como clave |
| CA3: formato común definido por Notificaciones | Contradice [[DEC-008 - Nombre de productor y tópicos de Mercado]] y [[DEC-009 - Contrato de holds e ítems según Accounting]] (ver más abajo) |
| Extra: consultar los avisos pendientes | No existe |
| Prueba con Kafka real | Pendiente en [[S2-07 - Pruebas integradas con Accounting]] |

Lo que sí falta del outbox (reintentos acotados, estado de fallo y contador de pendientes) se detalla en la sección «Tareas de #1010, #1011 y #1012» y se absorbe en [[S2-05 - Robustez de la compra]].

### #1038 queda casi cubierta por #5202

Con [[S2-02 - Clientes reales de Cursos]], cada compra consulta `GET /course-cohorts/{id}/membership`. Un alumno dado de baja recibe 403 `student-not-enrolled`, sin que haga falta consumir `STUDENT_UNENROLLED`. Así se cumple el CA1 de #1038. El CA2 (el historial no cambia) se cumple solo, porque nada toca las órdenes. Lo exclusivo de #1038 es procesar el evento de baja de forma idempotente (CA3) y registrar el momento de la baja (extra).

### Frontend: #5236 frente a #5288, #5289 y #5290

| Alcance | Dónde aparece |
|---|---|
| Vitrina, tarjetas, búsqueda y filtros | [[S2-08 - Frontend de Mercado]] (#5236, CA1) y #5290 |
| Vista de gestión del profesor (estado, ventas, vigencia, publicar) | #5290 y [[S2-OPC2 - Frontend de gestión del profesor]] (no cargada) |
| Selector de curso y Hub con pestañas | Solo #5288 y #5289, alcance nuevo |
| Compra con idempotencia, estado por [[SSE]], mis compras, errores `problem+json` | Solo #5236 |

Ya hay trabajo de vitrina terminado en el Sprint 1: #3636 y #3684, en Done.

## Tareas de #1010, #1011 y #1012

Las diez tareas de estas historias estaban en `New` y sin descripción (comprobado en #1019, #1022 y #1027; el listado de Taiga no devuelve ese campo). Se contrastó el alcance de cada una con `tpi-market` en `develop@7528610`. Criterio del equipo: si falta algo, la tarea se reescribe o se absorbe en una historia del Sprint 2; si no falta nada, se marca obsoleta.

| Tarea | Veredicto | Qué hay en el código | Destino |
|---|---|---|---|
| #1019 US-1010 T01, contrato de catálogo y compra | Obsoleta | Los 13 endpoints de negocio tienen `@Operation`, `@ApiResponses` y `ErrorApi` | Archivar con comentario |
| #1020 US-1010 T02, publicar en el navegador | Reescribir | `/swagger-ui.html` y `/v3/api-docs` están abiertos en `SecurityConfig`, pero el puerto de Mercado no se publica ([[Gateway e identidad]]) y no se verificó una ruta por el gateway | [[US-1010 - Contrato de la API publicado]], T02 |
| #1021 US-1010 T03, errores y compartir | Reescribir | `ErrorApi` está en todos los endpoints, pero `docs/api_doc/swagger.json` está desactualizado y nada lo regenera; no hay `@ExampleObject` | [[US-1010 - Contrato de la API publicado]], T03 y T04 |
| #1025 US-1012 T01, guardar y reintentar | Absorber en el Sprint 2 | El outbox existe, pero sin contador de intentos, espera creciente, máximo ni estado de fallo, y un mensaje que no sale bloquea la cola; tampoco hay contador de pendientes | [[S2-05 - Robustez de la compra]], tareas 6 y 7 |
| #1026 US-1012 T02, ignorar repetidos | Obsoleta | Los dos listeners deduplican por `eventId` en `processed_events` | Archivar con comentario |
| #1027 US-1012 T03, formato de los avisos | Absorber en el Sprint 2 | Envelope y productor `market-service` ya aplicados; el tópico de órdenes sigue en `market.orders.events` y falta informar a Notificaciones | [[S2-01 - Contrato con Accounting]], tareas 2 y 4 |
| #1028 US-1012 T04, pruebas | Obsoleta | Existen las pruebas de mensajería caída y de duplicados; `KafkaSagaIntegrationTest` se omite sin Docker | Lo cubre [[S2-07 - Pruebas integradas con Accounting]] |
| #1022 US-1011 T01, leer identidad y rol | Obsoleta | `GatewayIdentityFilter` ya lee `X-User-Id` y `X-User-Roles` y arma las autoridades | Archivar con comentario; los defectos que quedan están en [[S2-04 - Seguridad]] |
| #1023 US-1011 T02, definir qué puede hacer cada rol | Obsoleta | Roles y permisos definidos en [[DEC-006 - Roles y permisos según el código y los headers del gateway]]; falta el parseo exacto de roles | [[S2-04 - Seguridad]], tareas 1 y 2 |
| #1024 US-1011 T03, pruebas de acceso | Obsoleta | Existen `SecurityConfigTest`, `GatewayIdentityFilterTest` y pruebas de aceptación con 401 y 403; faltan los casos de subcadena, cabecera vacía y sin `X-User-Id` | [[S2-04 - Seguridad]], tarea 4 |

Resultado: #1011 y #1012 se cierran como obsoletas sin tareas propias abiertas. #1010 se mantiene con tareas reescritas, fuera del plan hasta que se resuelva [[Q-018 - Alcance real del Sprint 2 en Taiga]].

Aplicado en Taiga el 2026-10-02:

- Cerradas con la etiqueta `obsoleta` y un comentario con la evidencia: #1019, #1022, #1023, #1024, #1026 y #1028.
- Cerradas con la etiqueta `absorbida` y un comentario que apunta a la historia que las absorbe: #1025 y #1027.
- Reescritas (título y descripción): #1020 y #1021.
- Creadas: #5344 y #5345 en #5219 (outbox con reintentos y contador de pendientes) y #5346 en #1010 (ejemplos y validación con otro equipo). Quedan sin asignar.
- Las historias #1010, #1011 y #1012 no se modificaron: su destino depende de [[Q-018 - Alcance real del Sprint 2 en Taiga]]. #5219 sigue con 5 puntos en Taiga y en el vault ya son 8.

## Contradicciones que la jerarquía de verdad resuelve

Las decisiones registradas tienen el rango más alto (ver `AGENTS.md`). Por eso estas diferencias no abren preguntas: lo que hay que corregir es el texto de las historias.

| Historia | Qué dice | Qué está decidido |
|---|---|---|
| #1012, #1051, #1052 | El formato de los avisos lo define Notificaciones | Envelope de Accounting, `SNAKE_CASE` en inglés, productor `market-service`, tópico `market.events` ([[DEC-008 - Nombre de productor y tópicos de Mercado]], [[DEC-009 - Contrato de holds e ítems según Accounting]]). Falta informárselo a Notificaciones ([[Integración con Notificaciones]]) |
| #1012, #1013, #1037, #1038 | Hablan de "Banco" | El servicio es Accounting ([[DEC-001 - Accounting es dueño del inventario]]) |
| #1053 | `GET /api/cursos/{cursoId}/mercado/resumen` | Prefijo `/api/market/...` ([[DEC-005 - Endpoints y prefijos según el código]]) |
| #5289 | Pestaña Inventario dentro del Mercado | El inventario es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]). La pestaña sirve solo si lee `GET /api/accounting/courses/{courseId}/accounts/me/items` |
| #5289 | Pestañas Subastas y Metas colaborativas | Las subastas son del Sprint 3 ([[DEC-014 - Reglas de subastas]]) y la [[Meta colectiva (Colecta)]] es una propuesta no aprobada: solo pueden mostrarse como "próximamente" |

## Otros hallazgos

- **#1010:** springdoc publica `/swagger-ui.html` y `/v3/api-docs` sin autenticación (`configs/SecurityConfig.java`). Las 13 operaciones de los controladores de negocio tienen `@Operation` y 42 `@ApiResponse`. Falta que una persona valide el CA3 ("otro equipo lo entiende sin preguntarnos").
- **#5288:** consume `GET /api/market/courses/{courseId}/summary`, que no existe en `develop`. Hay que agregarlo al backend (trabajo no planificado) o calcular el conteo desde `GET /api/market/courses/{courseId}/catalog`.
- **#1037 y #1038:** el consumo de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` figura en P2 del [[Roadmap de trabajo]], y el contrato de esos eventos no está confirmado con Cursos ([[Integración con Cursos]]). #1038 además espera una definición del PO sobre las monedas y los ítems de quien deja la cursada.
- **Estados raros en Taiga:** #5288 y #5289 dicen "In progress" y #5290 dice "New", pero las tres figuran cerradas, con fecha de cierre minutos después de crearlas. #5290 no tiene prefijo `[G11]`, tags, puntos ni épica.
- **Historias del Sprint 1 desalineadas** (se suman a [[Q-013 - Higiene del backlog]]):
  - #140 "Seguir el avance de mi compra" figura en Done, pero el SSE envía un solo evento y cierra ([[SSE]], [[S2-08 - Frontend de Mercado]]).
  - #785 "Saber cuánto dura un ítem antes de comprarlo" figura en Done, aunque [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] descarta el vencimiento de ítems.
  - #138 "Comprar una oferta del catálogo" sigue en New dentro del Sprint 1.

## Cómo aplicar la política en Taiga

[[DEC-015 - Política del backlog de Taiga]] pide cerrar como obsoletas las historias que no aplican, sin borrarlas. Taiga no tiene un estado "obsoleta": los estados del proyecto son New, Ready, In progress, Ready for test, Done y Archived. Archived cuenta como cerrado y se oculta del kanban, y ya se usó con #142. El proyecto lo comparten todos los grupos, así que no conviene crear estados nuevos. Para cada historia:

1. Sacarla del sprint y dejarla en el backlog. Una historia cerrada dentro del sprint cuenta como completada en el burndown.
2. Agregar el tag `obsoleta` o `duplicada`.
3. Comentar el motivo y la historia que la reemplaza, por ejemplo: "Duplicada: lo pendiente lo cubren #5214 y #5202".
4. Pasarla a Archived.

## Relacionado

[[Sprint 2 - Índice]] · [[Plan del Sprint 2]] · [[Carga en Taiga - Sprints 2 y 3]] · [[Q-018 - Alcance real del Sprint 2 en Taiga]] · [[Q-013 - Higiene del backlog]] · [[Estado actual del código]]
