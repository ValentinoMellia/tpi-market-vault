---
tipo: pregunta
estado: archivado
verificado_contra: DEC-012
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, vencimiento]
---
# Q-014 - Vencimiento de items

> ¿Hay vencimiento de items y, si lo hay, quién lo aplica? Ningún servicio lo implementa y el taller recomendaba descartarlo. **Resuelta**: los ítems no vencen; la oferta sí, ver [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]].

## Qué se contradice
| Tema | Posturas |
|---|---|
| Regla | Fecha fija, días desde la recepción, o ambas (1 a 180 días) |
| Dueño | Mercado o el dueño del inventario (Accounting) |
| Aviso | A 24 horas antes: quién notifica |
| Existencia | Recomendación T2 del taller: descartar el vencimiento de items |

## Recomendación del taller del equipo
T2: **descartar el vencimiento de items** ([[Taller de decisiones]]). No está decidido formalmente.

## Evidencia nueva
- No hay vencimiento de items en ningún servicio; accounting no lo modela ([[Integración con Accounting]]).
- La función de vencimiento de items se integró en el PR #44 de Mercado y se revirtió en el PR #60. `itemValidityDays` es un residuo: se guarda en la oferta pero **nunca se envía a accounting**.

## Qué hace hoy el código
Solo guarda `itemValidityDays` en la oferta (`entities/CourseCatalogOfferEntity.java`); `publicationExpiresAt` es otra cosa (vencimiento de la publicación, que puede extenderse según [[DEC-013 - Reglas de la tienda]]). Ver [[Vencimiento de items]].

## Opciones
1. **Descartar el vencimiento (T2).** Se retira `itemValidityDays` y la épica se reduce.
2. **Mercado solo configura**; el dueño del inventario aplica el vencimiento (exige trabajo en accounting).
3. **Mercado aplica** el vencimiento.

## Recomendación
Opción 1, alineada con T2 (adoptada). Coherente con [[DEC-001 - Accounting es dueño del inventario]]: si se retoma, lo aplicaría Accounting.

## Quién decide / con qué equipo hay que hablar
Mercado y Accounting. Ver [[Épica 770 - Vencimiento de items]].

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: los ítems del inventario nunca vencen; las ofertas conservan `publicationExpiresAt`. Se quita el residuo `itemValidityDays` del código y se cierran en Taiga las historias de la épica #770 sobre vencimiento de ítems. Ver [[DEC-012 - Sin vencimiento de ítems, la oferta sí vence]]. Pregunta archivada.
