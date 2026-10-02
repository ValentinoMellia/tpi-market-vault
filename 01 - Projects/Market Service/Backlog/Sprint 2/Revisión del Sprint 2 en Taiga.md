---
tipo: estado
estado: en-disputa
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, backlog, sprint-2, taiga]
---
# Revisión del Sprint 2 en Taiga

> Foto del sprint "G11 - Sprint 2" de Taiga al 2026-10-02: tiene 25 historias, y no solo las 13 del [[Plan del Sprint 2]]. Suma 92 puntos frente a los 70 previstos, con duplicados, historias ya hechas en el código y algunas que contradicen decisiones. El alcance final está abierto en [[Q-018 - Alcance real del Sprint 2 en Taiga]].

## Fuente y alcance

- Taiga, proyecto `1804026`, sprint "G11 - Sprint 2" (id `533590`, del 2026-09-28 al 2026-10-11), leído el 2026-10-02 con la descripción completa de cada historia. Taiga guarda las fechas en UTC; acá se dan en hora de Argentina (UTC-3). Los datos de Taiga no surgen del código: para verificarlos hay que abrir cada historia en Taiga.
- Código: `tpi-market`, rama `develop`, commit `7528610`. Las rutas citadas son relativas a `src/main/java/ar/edu/utn/frc/tup/p4/`.
- Esta nota describe lo que hay y propone acciones. Las acciones no están decididas: dependen de [[Q-018 - Alcance real del Sprint 2 en Taiga]]. Taiga no se modificó.

## Qué hay en el sprint

Las historias llegaron en tres tandas.

| Tanda | Historias | Origen | Puntos en Taiga |
|---|---|---|---|
| A. Anteriores | #1010, #1011, #1012, #1013, #1037, #1038, #1051, #1052, #1053 | Creadas el 2026-09-17, épicas #1008, #1035 y #1050. No figuran en el plan ni en otras notas del vault | 22 |
| B. Del plan | #5193 a #5259 (12 historias, una por nota de [[Sprint 2 - Índice]]) y #4888 | Cargadas el 2026-10-01 desde las notas del vault. El texto de #5193 coincide con [[S2-01 - Contrato con Accounting]] | 70 (#4888 sin puntos) |
| C. Frontend | #5288, #5289, #5290 | Creadas la noche del 2026-10-01 sobre trabajo ya implementado en el frontend | 0 (la descripción dice 8 y 5; #5290 no tiene) |
| **Total** | **25** | | **92**, más los 13 de #5288 y #5289 que no tienen puntos cargados |

### Detalle

| US | Título en Taiga | Pts | Estado | Nota del vault | Propuesta (pendiente de [[Q-018 - Alcance real del Sprint 2 en Taiga]]) |
|---|---|---|---|---|---|
| #1010 | Publicar el contrato de la API antes de programarla | 2 | New | — | Verificar y pasar a Done |
| #1011 | Saber quién entra al Mercado y qué puede hacer | 2 | New | — | Cerrar como duplicada de #5214 y #5202 |
| #1012 | Que los avisos entre módulos no se pierdan ni se dupliquen | 3 | New | — | Cerrar como obsoleta (hecha) o reducir al contador de pendientes |
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
| #5219 | Robustez de la compra | 5 | New | [[S2-05 - Robustez de la compra]] | Mantener |
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

Las opcionales [[S2-OPC1 - Reconciliación de compras]] (#5261) y [[S2-OPC2 - Frontend de gestión del profesor]] (#5266) están cargadas en Taiga, pero en el backlog, fuera del sprint.

## Duplicados y solapamientos

### #1011 frente a #5214 y #5202

| Lo que pide #1011 | Qué hace hoy el código | Dónde queda cubierto |
|---|---|---|
| Saber quién hace el pedido y con qué rol | Hecho: `configs/filters/GatewayIdentityFilter.java` lee `X-User-Id` y `X-User-Roles` | — |
| CA3: rechazar el pedido sin identidad | En parte: sin cabeceras responde 401 (`configs/SecurityConfig.java`, `anyRequest().authenticated()`). Con identidad pero sin `X-User-Id`, los controladores asumen `usr-student-001` (`controllers/StorefrontCatalogController.java`, `StudentOrderController.java`, `CatalogOfferController.java`) | [[S2-04 - Seguridad]] (#5214), CA3 |
| CA2: un alumno no administra el catálogo | Hecho pero frágil. En `services/impl/CourseCatalogManageServiceImpl.java`, `validateAdminRole` y `validateAdminOrInstructorAccess` (líneas 160 a 191) comparan con `contains()`, de modo que `NOT_ADMIN` cuenta como ADMIN. En `validateProfessorAccess` (líneas 342 a 361), si `X-User-Roles` llega vacío se saltea la verificación de rol y solo queda la de asignación al curso; si además falta `X-User-Id`, no se valida nada | [[S2-04 - Seguridad]] (#5214), CA1 y CA2 |
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

### #1012 está hecha salvo un extra

| Criterio | Estado en el código |
|---|---|
| CA1: no se pierde el aviso si la mensajería está caída | Hecho: [[Patrón Outbox]] (`entities/OutboxEventEntity.java`); `job/OutboxRelayJob.java` reintenta cada 2 s |
| CA2: un aviso repetido se procesa una vez | Hecho: deduplicación por `eventId` en `processed_events` y guarda de estado ([[Entrega at-least-once y deduplicación]]) |
| Orden por alumno | Hecho: `services/OutboxRelayService.java` envía con el `studentId` como clave |
| CA3: formato común definido por Notificaciones | Contradice [[DEC-008 - Nombre de productor y tópicos de Mercado]] y [[DEC-009 - Contrato de holds e ítems según Accounting]] (ver más abajo) |
| Extra: consultar los avisos pendientes | No existe |
| Prueba con Kafka real | Pendiente en [[S2-07 - Pruebas integradas con Accounting]] |

### #1038 queda casi cubierta por #5202

Con [[S2-02 - Clientes reales de Cursos]], cada compra consulta `GET /course-cohorts/{id}/membership`. Un alumno dado de baja recibe 403 `student-not-enrolled`, sin que haga falta consumir `STUDENT_UNENROLLED`. Así se cumple el CA1 de #1038. El CA2 (el historial no cambia) se cumple solo, porque nada toca las órdenes. Lo exclusivo de #1038 es procesar el evento de baja de forma idempotente (CA3) y registrar el momento de la baja (extra).

### Frontend: #5236 frente a #5288, #5289 y #5290

| Alcance | Dónde aparece |
|---|---|
| Vitrina, tarjetas, búsqueda y filtros | [[S2-08 - Frontend de Mercado]] (#5236, CA1) y #5290 |
| Vista de gestión del profesor (estado, ventas, vigencia, publicar) | #5290 y [[S2-OPC2 - Frontend de gestión del profesor]] (#5266, en el backlog) |
| Selector de curso y Hub con pestañas | Solo #5288 y #5289, alcance nuevo |
| Compra con idempotencia, estado por [[SSE]], mis compras, errores `problem+json` | Solo #5236 |

Ya hay trabajo de vitrina terminado en el Sprint 1: #3636 y #3684, en Done.

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
