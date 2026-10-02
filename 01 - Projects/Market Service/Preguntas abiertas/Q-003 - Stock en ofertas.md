---
tipo: pregunta
estado: archivado
verificado_contra: DEC-002
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, stock]
---
# Q-003 - Stock en ofertas

> ¿Las ofertas tienen stock opcional o nunca hay stock? **Resuelta**: stock opcional, ver [[DEC-002 - Stock opcional por oferta]].

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Stock opcional | Decisión del 19/09 (la número 6, revisada); las historias de publicar, editar y comprar lo incluyen | Épicas e historias de Taiga |
| Nunca stock | "Sin stock" | Documentos anteriores, hoy alineados con el stock opcional |

## Decisión previa del equipo
La decisión #6, revisada el 19/09, fija el **stock opcional por oferta**. El código la implementa y toda la documentación actual está alineada. Confirmada el 2026-10-01 en [[DEC-002 - Stock opcional por oferta]].

## Qué hace hoy el código
Implementa stock opcional: `availableStock` nulo significa ilimitado; hay decremento atómico y liberación ante fallos (`services/impl/OfferStockServiceImpl.java`, `entities/CourseCatalogOfferEntity.java`). Hay pruebas de concurrencia (`OfferStockConcurrencyTest`). Dos defectos asociados (`unitsSold` no se incrementa, sobreventa al editar el stock) se resolvieron en [[DEC-013 - Reglas de la tienda]] (origen [[Q-015 - Reglas de la tienda]]).

## Opciones
1. **Stock opcional (código).** Coherente con el código y las historias.
2. **Sin stock.** Obliga a quitar código y pruebas.

## Recomendación
Opción 1, adoptada: mantener el código. Ver [[Oferta de catálogo]].

## Quién decide / con qué equipo hay que hablar
El propio equipo de Mercado.

## Resolución
Cerrada el 2026-10-01: el líder del equipo de Mercado confirmó el stock opcional. Ver [[DEC-002 - Stock opcional por oferta]]. Pregunta archivada.
