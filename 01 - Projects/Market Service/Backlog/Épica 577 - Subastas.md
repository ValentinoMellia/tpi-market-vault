---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, epica, subastas]
taiga: "#577"
epica: "Subastas"
---
# Épica 577 - Subastas

> Subastas entre estudiantes de un curso. Es de la Fase 3: no forma parte del Sprint 1 y no hay código.

## Objetivo
Ver [[Subasta]] para la intención del dominio y [[Q-012 - Alcance de subastas]] para las dudas previas a implementar.

## Historias
| Taiga # | Título | Estado en el código |
|---|---|---|
| #578 | Lanzar una subasta | no iniciada |
| #579 | Ver las subastas abiertas | no iniciada |
| #580 | Ofertar | no iniciada |
| #581 | Mejorar mi oferta | no iniciada |
| #582 | Enterarme si me superaron | no iniciada |
| #583 | No ofertar dos veces | no iniciada |
| #584 | Entregar el item al ganador | no iniciada |
| #585 | Devolver monedas a los perdedores | no iniciada |
| #586 | Cerrar sin ofertas | no iniciada |
| #587 | Cancelar una subasta | no iniciada |
| #588 | Cerrar si el curso se archiva o el alumno se da de baja | no iniciada |
| #589 | Terminar cierres a medias | no iniciada |

## Notas
Decidido ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]): una subasta termina cuando vence su tiempo o cuando un profesor la cancela; los estudiantes no pueden cancelar (afecta a #587). **Qué se subasta** ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]): una unidad de una oferta de catálogo, con snapshot al lanzar; "ítem único" es una propuesta no aprobada ([[Ítems únicos]]). Afecta a #578 y #584.

Reglas de [[DEC-014 - Reglas de subastas]] (2026-10-01) y su efecto en las historias:
- #587 Cancelar: un `HOLD_RELEASE_REQUESTED` por postor.
- #585 Devolver monedas: los superados se liberan recién al cierre.
- #580 y #581 Ofertar y mejorar: incremento mínimo configurable; una oferta abierta debe superar estrictamente a la mejor.
- #578 Lanzar: duración máxima de 14 días; modo abierta o ciega (la ciega con desempate por dado decidido en el servidor, auditable).
- #588 Curso archivado o baja: se cancelan las subastas del curso archivado; la baja retira las ofertas del estudiante y la subasta continúa.
- Sin extensión de tiempo; anti-sniping por fase final ciega (últimos X minutos selladas; X configurable por subasta por el profesor; la regla de la oferta sellada sigue pendiente de detalle): afecta a #580 y #581 ([[DEC-014 - Reglas de subastas]]).

Las subastas están previstas para el Sprint 3 (no bloqueadas por los ítems únicos, [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]), por lo que se especifican ahora ([[DEC-015 - Política del backlog de Taiga]], [[Roadmap de trabajo]]).

Las subastas retienen monedas con [[Hold de monedas]] (escrow completo, decisión previa del equipo) y usan [[Bloqueo optimista]] en las ofertas. El estado de S1 a S10 del taller está en [[Taller de decisiones]] ([[Q-012 - Alcance de subastas]] está archivada).
