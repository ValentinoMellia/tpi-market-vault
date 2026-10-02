---
tipo: decision
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, decision, stock, oferta]
---
# DEC-002 - Stock opcional por oferta

> Cada [[Oferta de catálogo]] puede tener stock finito o ser ilimitada: `availableStock` nulo significa sin límite. Es lo que el código ya implementa.

## Contexto
Los documentos anteriores hablaban a veces de "nunca hay stock" y otras de stock por oferta. El equipo había fijado el stock opcional en su decisión #6 (revisada el 19/09) y el código la implementa. Pregunta de origen: [[Q-003 - Stock en ofertas]].

## Decisión
Confirmada por el líder del equipo de Mercado el 2026-10-01: las ofertas tienen **stock opcional**.

- Con stock finito, la compra descuenta de forma atómica y lo devuelve si la compra falla.
- Sin stock (`availableStock` nulo), la oferta es ilimitada.

## Alternativas descartadas
- **Sin stock en ninguna oferta**: obligaría a quitar código (`OfferStockServiceImpl`) y pruebas (`OfferStockConcurrencyTest`), y las historias de publicar, editar y comprar ya incluyen el stock.

## Consecuencias
- No hay cambios de código por esta decisión: el código ya la cumple (`services/impl/OfferStockServiceImpl.java`, `entities/CourseCatalogOfferEntity.java`).
- Los defectos asociados (`unitsSold` nunca se incrementa; editar el stock devuelve unidades vendidas) no se cierran acá: se resolvieron en [[DEC-013 - Reglas de la tienda]] (origen [[Q-015 - Reglas de la tienda]]) y siguen como tarea de código en [[Estado actual del código]] (gap 4).
- "Nunca hay stock" queda como idea superada ([[Ideas descartadas]]).

## Notas afectadas
[[Oferta de catálogo]], [[Épica 090 - Catálogo por plantillas]], [[Glosario]], [[Taller de decisiones]], [[Decisiones - Índice]].
