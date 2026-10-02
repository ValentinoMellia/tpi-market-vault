---
tipo: guia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, sprint, planificacion]
---
# Plan del Sprint 2

> Propuesta de historias y tareas para el Sprint 2 (2026-09-28 al 2026-10-11). Al 2026-10-01 quedan unas 11 jornadas, alrededor de 250 h de las 340 h del equipo de 10 integrantes. Las horas son estimaciones a validar en la planning. Se carga en Taiga siguiendo la plantilla de historias de la wiki del proyecto ([[DEC-015 - Política del backlog de Taiga]]).

## Criterio

- Primero lo que bloquea el funcionamiento real: el contrato con Accounting ([[DEC-009 - Contrato de holds e ítems según Accounting]], [[DEC-008 - Nombre de productor y tópicos de Mercado]]).
- Después las reglas de la tienda ([[DEC-013 - Reglas de la tienda]]) y los gaps de [[Estado actual del código]].
- Frontend de Mercado: lo desarrolla el equipo.
- Spikes de entendimiento y diseño, que preparan el trabajo y el plan del Sprint 3 (pendiente).
- Las tareas se dimensionan entre 2 y 6 h para que sean trazables.

## Compromiso del sprint

| # | Historia (propuesta) | Contenido | Tareas | Horas |
|---|---|---|---|---|
| 1 | Contrato con Accounting | `orderRef` UUID persistido; tópicos `accounting.events` y `market.events` (ignorar los propios comandos en el tópico compartido); productor `market-service`; flujo `ITEM_CONFIRMED` → `ITEM_CREDITED`; mapeo de todos los motivos de rechazo; motivos de liberación | 8 | 45 |
| 2 | Clientes reales de Cursos | Verificación de matrícula y de profesor con `/course-cohorts/{id}/membership` y token de servicio; manejo de errores; tests ([[Integración con Cursos]]) | 4 | 22 |
| 3 | Reglas de la tienda | `unitsSold` y cálculo de disponible; validaciones al publicar; solo desactivar; `publicationExpiresAt` al publicar y editar | 6 | 30 |
| 4 | Seguridad | Parseo de roles sin `contains()`; sin bypass por cabecera vacía; quitar el usuario por defecto `usr-student-001` | 4 | 16 |
| 5 | Robustez de la compra | Liberar stock en `HOLD_NOT_SETTLED`; vencimiento del hold en UTC; excepciones que hoy responden 500; oferta vencida que responde 200; clave de idempotencia por estudiante | 5 | 22 |
| 6 | Plataforma y CI | CI sobre `develop`; despliegue con `PORT=8100`; variable de Kafka; quitar `itemValidityDays`; documentación placeholder | 5 | 15 |
| 7 | Pruebas integradas con Accounting | `KafkaSagaIntegrationTest` en verde; tests de contrato; prueba punta a punta con Accounting | 4 | 25 |
| 8 | Frontend de Mercado | Vitrina del curso (8 h); detalle de oferta (4 h); compra con idempotencia (6 h); estado de la compra en vivo por SSE (8 h); mis compras (5 h); errores `problem+json` (5 h) | 6 | 36 |
| 9 | Spikes | Ver tabla siguiente | 14 | 37 |
| 10 | Organizar la documentación en un vault de conocimiento (Taiga #4888, ya creada) | Trabajo del 2026-10-01: estructura del vault y guías para agentes; estado del código; plataforma e integraciones; contradicciones y decisiones (DEC-001 a DEC-016); saneamiento del backlog; roadmaps y este plan | 6 | a completar con las horas reales |
| | **Total comprometido** | | **62** | **~248 h + #4888** |

### Spikes

| Spike | Detalle | Tareas | Horas |
|---|---|---|---|
| Lectura del vault | Cada integrante recorre el [[Roadmap de entendimiento]] (una tarea por persona) | 10 | 20 |
| Orden de la compra con Accounting | Reunión y acuerdo sobre [[Q-008 - Orden de la saga de compra]], incluida la revocación de ítems; enviar la respuesta preparada en el Inbox | 1 | 3 |
| Diseño técnico de subastas | Modelo, estados, fase final ciega y contrato con Accounting ([[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]), para que el Sprint 3 empiece implementando | 2 | 10 |
| SSE en el frontend | Patrón de consumo de SSE con Signals y el kit de UI | 1 | 4 |

## Objetivos opcionales (si sobra capacidad)

| Historia | Por qué es opcional | Horas |
|---|---|---|
| Reconciliación de compras | Depende de que Accounting publique `GET /api/accounting/holds/{holdId}` este sprint. Incluye el `BankHoldQueryClient` real (arregla el arranque con kafka), activar el job y las órdenes trabadas en `CREATED` | 20 |
| Frontend de gestión del profesor | Listar, publicar, editar, activar o desactivar y extender el vencimiento | 14 |

## Riesgos

- La estimación tiene un margen de ±20 %: es una referencia para la planning, no un compromiso.
- El Sprint 2 empezó sin historias cargadas; cargar Taiga es lo primero ([[Q-013 - Higiene del backlog]]).
- Si Accounting no acepta el orden de compra propuesto ([[Q-008 - Orden de la saga de compra]]), la historia 1 puede cambiar.

## Detalle de las historias

Cada historia, con la plantilla de Taiga, criterios de aceptación, escenarios BDD y tareas: [[Sprint 2 - Índice]].

## Relacionado
[[Roadmap de trabajo]] · [[Taller de decisiones]] · [[Backlog - Índice]] · [[Sprint 2 - Índice]]
