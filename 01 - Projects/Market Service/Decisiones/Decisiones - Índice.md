---
tipo: indice
estado: vigente
verificado_contra: DEC-018
actualizado: 2026-10-05
tags: [mercado, decision]
---
# Decisiones - Índice

> Registro de decisiones (`DEC-NNN`) de Mercado. Hay dieciocho decisiones registradas.

## Decisiones registradas

| ID | Título | Origen | Fecha |
|---|---|---|---|
| DEC-001 | [[DEC-001 - Accounting es dueño del inventario]] | [[Q-001 - Dueño del inventario]] (archivada) | 2026-10-01 |
| DEC-002 | [[DEC-002 - Stock opcional por oferta]] | [[Q-003 - Stock en ofertas]] (archivada) | 2026-10-01 |
| DEC-003 | [[DEC-003 - Holds solo por Kafka]] | [[Q-004 - Transporte de los holds]] (archivada) | 2026-10-01 |
| DEC-004 | [[DEC-004 - Máquina de estados de la orden según el código]] | [[Q-005 - Estados de la orden]] (archivada) | 2026-10-01 |
| DEC-005 | [[DEC-005 - Endpoints y prefijos según el código]] | [[Q-009 - Endpoints y prefijos]] (archivada) | 2026-10-01 |
| DEC-006 | [[DEC-006 - Roles y permisos según el código y los headers del gateway]] | [[Q-010 - Roles y permisos]] (archivada; enmendada el 2026-10-04 por [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]], archivada) | 2026-10-01 |
| DEC-007 | [[DEC-007 - Tope de vidas, Accounting decide y reporta]] | [[Q-002 - Vidas y tope de vidas]] (archivada; enmendada el 2026-10-02 y el 2026-10-04: validación preventiva del tope y `LIFE_PURCHASE_REJECTED`) | 2026-10-01 |
| DEC-008 | [[DEC-008 - Nombre de productor y tópicos de Mercado]] | [[Q-006 - Naming de eventos y topics]] (archivada) | 2026-10-01 |
| DEC-009 | [[DEC-009 - Contrato de holds e ítems según Accounting]] | [[Q-007 - Contrato con Accounting]] (archivada) | 2026-10-01 |
| DEC-010 | [[DEC-010 - Los efectos de los ítems no son de Mercado]] | [[Q-011 - Efectos y consumo de items]] (archivada) | 2026-10-01 |
| DEC-011 | [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] | [[Q-012 - Alcance de subastas]] (archivada; enmendada: "ítem único" es la propuesta [[Ítems únicos]]) | 2026-10-01 |
| DEC-012 | [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]] | [[Q-014 - Vencimiento de items]] (archivada) | 2026-10-01 |
| DEC-013 | [[DEC-013 - Reglas de la tienda]] | [[Q-015 - Reglas de la tienda]] (archivada) | 2026-10-01 |
| DEC-014 | [[DEC-014 - Reglas de subastas]] | [[Q-012 - Alcance de subastas]] (archivada; actualizada el 2026-10-01 con la fase final ciega) | 2026-10-01 |
| DEC-015 | [[DEC-015 - Política del backlog de Taiga]] | [[Q-013 - Higiene del backlog]] (sigue abierta) | 2026-10-01 |
| DEC-016 | [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] | [[Q-017 - Qué se subasta mientras no existan ítems únicos]] (archivada) | 2026-10-01 |
| DEC-017 | [[DEC-017 - Servicios con MS en las rutas de estado de oferta]] | [[Q-021 - Principal de servicio MS en las reglas de negocio]] (archivada) | 2026-10-03 |
| DEC-018 | [[DEC-018 - Aviso de ofertas nuevas]] | [[Q-022 - Aviso de ofertas nuevas]] (archivada) | 2026-10-05 |

[[Q-012 - Alcance de subastas]] y [[Q-017 - Qué se subasta mientras no existan ítems únicos]] están archivadas: [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]], [[DEC-014 - Reglas de subastas]] y [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] cubren el cierre, las reglas, el anti-sniping y qué se subasta.

Una decisión se crea cuando el equipo resuelve una pregunta abierta: se parte de la `Q-NNN`, se escribe `DEC-NNN - Título corto` con la plantilla de decisión, se archiva la pregunta y se actualizan las notas afectadas. Las decisiones tienen el rango más alto de la jerarquía de verdad definida en `AGENTS.md`.

## Resuelta sin decisión
- [[Q-016 - Puerto y registro de Mercado en la plataforma]]: hecho verificado (puerto 8100, registrado en la plataforma), no requiere `DEC`.

## Preguntas que siguen abiertas
- [[Q-008 - Orden de la saga de compra]]: postura de Mercado registrada (entregar primero), pendiente de acordar con Accounting.

- [[Q-013 - Higiene del backlog]]: [[DEC-015 - Política del backlog de Taiga]] fija la política; falta sanear Taiga y planificar los sprints.

- [[Q-018 - Alcance real del Sprint 2 en Taiga]]: el sprint de Taiga tiene historias que no están en el plan; falta decidir qué se queda, qué entra con mock y cómo se reparte el frontend.

- [[Q-019 - Aviso cuando el ítem se entregó sin cobro]]: postura provisoria de Mercado (no avisar); decide producto.

Las 33 recomendaciones del taller y cuáles quedaron decididas: [[Taller de decisiones]]. Prioridad en [[Roadmap de trabajo]]; contexto en [[Market Service - Overview]].
