---
tipo: guia
estado: borrador
verificado_contra: DEC-015
actualizado: 2026-10-01
tags: [mercado, backlog, taiga, sprint]
taiga_proyecto: "1804026"
---
# Carga en Taiga - Sprints 2 y 3

> Lista exacta de operaciones a hacer en Taiga (proyecto `1804026`) para dejar el backlog de Mercado al día: qué historias se cierran como obsoletas, cuáles se verifican y cuáles se crean para los sprints 2 y 3. Sigue [[DEC-015 - Política del backlog de Taiga]]: nada se borra; lo inconsistente se cierra como obsoleto. Las historias nuevas usan la plantilla oficial de la wiki de Taiga, copiada en `03 - Resources/Templates/Taiga - Historia de usuario.md` (y `Taiga - Épica.md` para épicas). Los spikes usan `Taiga - Spike.md` (versión simplificada de la de historia). El texto listo para copiar de cada historia del Sprint 2 está en [[Sprint 2 - Índice]]; el prefijo del título en Taiga es `[G11]`.

## 1. Historias existentes

Fuente: [[Backlog - Índice]] y las notas de cada épica. Verificar el estado en Taiga antes de aplicar cada acción.

| Historia / épica | Acción | Motivo |
|---|---|---|
| #810 | Cerrar como obsoleta | Duplicado de #130 |
| #130 y épica #482 | Cerrar en Mercado y avisar para reasignar | No es de Mercado: los multiplicadores los aplica el motor de desafíos ([[DEC-010 - Los efectos de los ítems no son de Mercado]]) |
| Épica #131 y #132 a #136 | Cerrar como obsoletas en Mercado | El inventario es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]) |
| #778, #785, #786, #787, #788 (épica #770) | Cerrar como obsoletas | Sin vencimiento de ítems ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]) |
| #142 | Cerrar como obsoleta y reemplazar | El tope de vidas lo decide Accounting y Mercado reacciona ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]); se cubre en la historia nueva "Contrato con Accounting" |
| #578 a #589 (subastas) | Cerrar como obsoletas y reemplazar en el Sprint 3 | Usan nombres de eventos y reglas anteriores a [[DEC-014 - Reglas de subastas]] y [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] |
| #94, #96, #98, #945, #946 | Verificar contra el código y marcar como Done si corresponde | Implementadas en el código según [[Estado actual del código]] |
| #138, #139, #140, #141 | Mantener; vincular sus tareas restantes a las historias nuevas del Sprint 2 | Parcialmente implementadas |
| #143 | Mantener como objetivo opcional | Depende del `GET` de holds de Accounting (reconciliación) |
| #92, #95 | Sin cambios | Ya están en Done |


## 2. Sprint 2 (2026-09-28 al 2026-10-11)

Detalle de contenido y horas en [[Plan del Sprint 2]].

| # | Historia nueva | Tareas a crear |
|---|---|---|
| 1 | Contrato con Accounting | `orderRef` UUID persistido · tópicos por variable de entorno · ignorar comandos propios en `accounting.events` · productor `market-service` · publicar `ITEM_CONFIRMED` · consumir `ITEM_CREDITED` · mapear motivos de rechazo · motivos de liberación |
| 2 | Clientes reales de Cursos | Cliente de membership · token de servicio · manejo de errores · tests |
| 3 | Reglas de la tienda | `unitsSold` al confirmar · cálculo de disponible · validaciones al publicar · solo desactivar · `publicationExpiresAt` en publicar · `publicationExpiresAt` en editar |
| 4 | Seguridad | Parseo de roles · bypass por cabecera vacía · quitar `usr-student-001` · tests de seguridad |
| 5 | Robustez de la compra | Stock en `HOLD_NOT_SETTLED` · hold en UTC · excepciones 500 · oferta vencida 200 · idempotencia por estudiante |
| 6 | Plataforma y CI | CI en `develop` · `PORT=8100` · variable de Kafka · quitar `itemValidityDays` · documentación placeholder |
| 7 | Pruebas integradas con Accounting | `KafkaSagaIntegrationTest` en verde · tests de contrato · entorno con Accounting · prueba punta a punta |
| 8 | Frontend de Mercado | Vitrina · detalle de oferta · compra con idempotencia · estado por SSE · mis compras · errores `problem+json` |
| 9 | Spikes | 10 × lectura del vault (una por integrante) · reunión con Accounting por [[Q-008 - Orden de la saga de compra]] · 2 × diseño técnico de subastas · patrón SSE en el frontend |
| 10 | #4888 Organizar la documentación en un vault de conocimiento (ya existe) | Estructura del vault y guías para agentes · estado del código · plataforma e integraciones · contradicciones y decisiones · saneamiento del backlog · roadmaps (las primeras cuatro, hechas el 2026-10-01) |

Opcionales: reconciliación de compras (absorbe #143) y frontend de gestión del profesor.

## 3. Sprint 3 (2026-10-12 al 2026-10-25), borrador

A detallar en la planning del Sprint 3, con el resultado del spike de diseño de subastas.

| Historia nueva | Base |
|---|---|
| Lanzar y ver subastas (profesor y estudiante) | [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] |
| Ofertar y mejorar oferta (`HOLD_CREATE` / `HOLD_INCREASE` con el total nuevo) | [[DEC-014 - Reglas de subastas]], [[DEC-009 - Contrato de holds e ítems según Accounting]] |
| Fase final ciega y modo ciego, con desempate por dado decidido en el servidor | [[DEC-014 - Reglas de subastas]] |
| Cierre: entregar al ganador y liberar a los demás (un release por postor) | [[DEC-014 - Reglas de subastas]] |
| Cancelación por profesor, curso archivado y baja de estudiante | [[DEC-014 - Reglas de subastas]], [[Integración con Cursos]] |
| Frontend de subastas (incluida la animación del dado) | [[Subasta]] |
| Propuestas, si el PO las aprueba | [[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]], [[Ítems únicos]] |

## 4. Orden de ejecución

1. Completar cada historia con la plantilla `Taiga - Historia de usuario` (incluye BDD con mínimo 3 escenarios, estimación Fibonacci y prioridad MoSCoW).
2. Cerrar las obsoletas (sección 1).
3. Crear las historias del Sprint 2 con sus tareas y asignarlas al sprint.
4. Cargar las tareas de #4888.
5. Dejar las historias del Sprint 3 en el backlog, sin tareas hasta la planning.
6. Registrar el resultado en `log.md` y cerrar [[Q-013 - Higiene del backlog]].
