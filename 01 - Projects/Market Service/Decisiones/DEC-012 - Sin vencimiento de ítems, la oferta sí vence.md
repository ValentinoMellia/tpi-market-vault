---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, decision, vencimiento, oferta]
---
# DEC-012 - Sin vencimiento de ítems, la oferta sí vence

> Los ítems del inventario nunca vencen. Lo que sí vence es la publicación de la oferta (`publicationExpiresAt`).

## Contexto
La intención original era que un ítem comprado pudiera vencer (fecha fija o 1 a 180 días). Ningún servicio lo implementa, Accounting no lo modela y la función se integró en el PR #44 de Mercado y se revirtió en el PR #60, dejando `itemValidityDays` como residuo que nunca se envía a Accounting. Pregunta de origen: [[Q-014 - Vencimiento de items]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01 (corresponde a T2 del [[Taller de decisiones]]):

- Los **ítems en el inventario no vencen**.
- Las **ofertas conservan `publicationExpiresAt`**: es el vencimiento de la publicación y es otra cosa. Cuando se escribió esta decisión se asumía que no se extendía; [[DEC-013 - Reglas de la tienda]] (T6 modificada) establece que sí puede extenderse.

## Alternativas descartadas
- **Mercado solo configura y Accounting aplica el vencimiento**: exige trabajo en Accounting y no hay demanda.
- **Mercado aplica el vencimiento**: contradice [[DEC-001 - Accounting es dueño del inventario]].

## Consecuencias
- **Tarea de código**: quitar el residuo `itemValidityDays` (`entities/CourseCatalogOfferEntity.java` y los DTO, validaciones y datos asociados) ([[Roadmap de trabajo]]).
- **Taiga**: cerrar o quitar las historias de la épica #770 sobre el vencimiento de ítems: #778, #785, #786, #787 y #788. Se conserva cualquier historia sobre el vencimiento de la publicación de la oferta ([[Épica 770 - Vencimiento de items]], [[Q-013 - Higiene del backlog]]).
- Las historias #786 a #788 ya no se transfieren a Accounting: se descartan.
- Se elimina el aviso a 24 horas de un vencimiento que no existe ([[Integración con Notificaciones]]).

## Notas afectadas
[[Vencimiento de items]], [[Épica 770 - Vencimiento de items]], [[Oferta de catálogo]], [[Estado actual del código]], [[Integración con Accounting]], [[Ideas descartadas]], [[Taller de decisiones]], [[Decisiones - Índice]].
