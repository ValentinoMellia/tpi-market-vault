---
tipo: guia
estado: vigente
verificado_contra: equipo-taller@2026-09-30
actualizado: 2026-10-01
tags: [mercado, taller, decisiones]
---
# Taller de decisiones

> El equipo recomendó 33 decisiones en un taller (documentación del 30/09). Las recomendaciones no son decisiones: solo las que figuran abajo como **decididas** o **confirmadas** subieron a `DEC-NNN` el 2026-10-01. El resto sigue como recomendación.

## Cómo leer esta nota
- Una recomendación del taller no es una decisión: no sube en la jerarquía de verdad de `AGENTS.md`. Para volverse `DEC-NNN` necesita confirmación del líder del equipo.
- Cuando una recomendación contradice el código de un equipo para su propio lado, manda el código hasta que se decida otra cosa.
- Estados usados: **confirmada** (la decisión adopta la recomendación), **reemplazada** (la decisión va en otra dirección), **sin decidir** (sigue siendo recomendación).
- Esta lista puede estar incompleta: se extrajeron 28 de las 33 (falta D11 y cuatro más) y el taller también define tareas K01 a K33.

## Resumen del 2026-10-01
Confirmadas: D7 ([[DEC-008 - Nombre de productor y tópicos de Mercado]]), D8 y D5 en lo que cubre el contrato ([[DEC-009 - Contrato de holds e ítems según Accounting]]), D13 ([[DEC-001 - Accounting es dueño del inventario]]) y T2 ([[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]). Confirmadas el mismo día en [[DEC-014 - Reglas de subastas]]: S1, S3, S5 y S6; reemplazada S10 (14 días). Reemplazada: D1 ([[DEC-007 - Tope de vidas, Accounting decide y reporta]]). El resto sigue sin decidir.

## Integración con Accounting y otros equipos

| ID | Tema | Recomendación | Estado | Pregunta |
|---|---|---|---|---|
| D1 | Vidas | Accounting rechaza con `LIFE_CAP_REACHED` y Mercado libera el hold | **Reemplazada** por [[DEC-007 - Tope de vidas, Accounting decide y reporta]]: Accounting decide y reporta (hoy recorta); Mercado reacciona y no valida | [[Q-002 - Vidas y tope de vidas]] (archivada) |
| D2 | Entrega del item | `ITEM_CONFIRMED` a `ITEM_CREDITED` reemplaza a `ITEM_PROVISION_*` | Sin decidir en cuanto al orden; los mensajes sí los adopta [[DEC-009 - Contrato de holds e ítems según Accounting]] | [[Q-008 - Orden de la saga de compra]] |
| D3 | Efectos | Vocabulario `ABSORB_FAILURE`, `XP_MULTIPLIER`, `COIN_MULTIPLIER` | Sin decidir; [[DEC-010 - Los efectos de los ítems no son de Mercado]] aclara que Mercado no los resuelve | [[Q-011 - Efectos y consumo de items]] (archivada) |
| D4 | Vencimiento de holds | Accounting expira los holds y publica `HOLD_EXPIRED` | Sin decidir (pedido a Accounting) | [[Q-007 - Contrato con Accounting]] (archivada) |
| D5 | Consulta de hold | Accounting expone `GET /holds/{holdId}` para Mercado | **Confirmada** en [[DEC-009 - Contrato de holds e ítems según Accounting]]; Accounting la implementa este sprint | [[Q-007 - Contrato con Accounting]] (archivada) |
| D6 | Reembolso | Sin reembolso por ahora; lo resuelve un ADMIN manualmente | Sin decidir | [[Q-007 - Contrato con Accounting]] (archivada) |
| D7 | Tópicos | Adoptar `accounting.events` y `market.events` | **Confirmada** en [[DEC-008 - Nombre de productor y tópicos de Mercado]] | [[Q-006 - Naming de eventos y topics]] (archivada) |
| D8 | Identificador de orden | Mercado genera un `orderRef` UUID y lo persiste | **Confirmada** en [[DEC-009 - Contrato de holds e ítems según Accounting]] | [[Q-007 - Contrato con Accounting]] (archivada) |
| D9 | Falla del item | Accounting publica un evento de error y Mercado libera el hold | Sin decidir (depende del orden de la compra) | [[Q-008 - Orden de la saga de compra]] |
| D10 | Catálogo de accounting | Acepta cualquier `catalogItemId` y toma las cargas del payload | **Confirmada** en cuanto a las cargas por [[DEC-020 - Las cargas del ítem las decide el profesor]]: `maxCharges` son las cargas que configura el profesor | [[Q-007 - Contrato con Accounting]] (archivada) |
| D12 | Matrícula y profesor | Verificar vía Cursos (recomendación sin extraer del todo) | Sin decidir | [[Integración con Cursos]] |
| D13 | Dueño de monedas e inventario | Accounting | **Decidida** en [[DEC-001 - Accounting es dueño del inventario]] | [[Q-001 - Dueño del inventario]] (archivada) |

## Subastas

[[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] fijó el cierre (por tiempo o por profesor, ítems únicos) y [[DEC-014 - Reglas de subastas]] confirmó S1, S3, S5 y S6 y reemplazó S10 (14 días). S2, S4, S7 y S8 siguen sin decidir. [[Q-012 - Alcance de subastas]] se archivó el 2026-10-01: el anti-sniping quedó decidido (fase final ciega, [[DEC-014 - Reglas de subastas]]) y qué se subasta quedó decidido en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] ("ítem único" es la propuesta [[Ítems únicos]]); S9 se adopta en ese alcance.

| ID | Recomendación | Estado | Pregunta |
|---|---|---|---|
| S1 | Un release por postor | **Confirmada** en [[DEC-014 - Reglas de subastas]]; no se adopta el release por `orderId` de Accounting | [[Q-012 - Alcance de subastas]] |
| S2 | Alinear los contratos de subasta al vocabulario de Accounting | Sin decidir | [[Q-012 - Alcance de subastas]] |
| S3 | No liberar antes a los superados | **Confirmada** en [[DEC-014 - Reglas de subastas]] | [[Q-012 - Alcance de subastas]] |
| S4 | Subastar solo equipamiento, sin vidas | Sin decidir; las vidas quedan excluidas salvo que se decida otra cosa ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]) | [[Q-012 - Alcance de subastas]] |
| S5 | Mercado consume eventos de Cursos y libera sus holds | **Confirmada** en [[DEC-014 - Reglas de subastas]] | [[Q-012 - Alcance de subastas]] |
| S6 | Incremento mínimo configurable | **Confirmada** en [[DEC-014 - Reglas de subastas]] (configurable por subasta) | [[Q-012 - Alcance de subastas]] |
| S7 | Generalizar outbox y correlación a un agregado genérico | Sin decidir | [[Q-012 - Alcance de subastas]] |
| S8 | Pedir a Accounting bajar el relay a ~1 s | Sin decidir | [[Q-012 - Alcance de subastas]] |
| S9 | Snapshot del item desde la plantilla al lanzar | Adoptada para ítems del catálogo ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]) | [[Q-012 - Alcance de subastas]] |
| S10 | Duración máxima de 7 días | **Reemplazada** por [[DEC-014 - Reglas de subastas]]: 14 días | [[Q-012 - Alcance de subastas]] |

## Tienda

| ID | Recomendación | Estado | Pregunta |
|---|---|---|---|
| T1 | Incrementar `unitsSold` al confirmar; disponible = total - vendidos - reservados | **Confirmada** en [[DEC-013 - Reglas de la tienda]] | [[Q-015 - Reglas de la tienda]] (archivada) |
| T2 | Descartar el vencimiento de items | **Confirmada** en [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] | [[Q-014 - Vencimiento de items]] (archivada) |
| T3 | `courseId` es la cohorte | **Confirmada** en [[DEC-013 - Reglas de la tienda]] | [[Q-015 - Reglas de la tienda]] (archivada) |
| T4 | Desactivar alcanza, sin borrado lógico | **Confirmada** en [[DEC-013 - Reglas de la tienda]] | [[Q-015 - Reglas de la tienda]] (archivada) |
| T5 | Validar plantilla, tipo y multiplicador al publicar | **Confirmada** en [[DEC-013 - Reglas de la tienda]] | [[Q-015 - Reglas de la tienda]] (archivada) |
| T6 | El vencimiento de la publicación no se extiende: se publica una oferta nueva | **Modificada** en [[DEC-013 - Reglas de la tienda]]: `publicationExpiresAt` sí puede extenderse (reemplaza la recomendación) | [[Q-015 - Reglas de la tienda]] (archivada) |

## Relacionado
[[Decisiones - Índice]], [[Roadmap de trabajo]], [[Integración con Accounting]], [[Meta colectiva (Colecta)]], [[Cofres y nuevos ítems]].
