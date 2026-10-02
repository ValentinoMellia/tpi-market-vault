---
tipo: pregunta
estado: archivado
verificado_contra: DEC-014
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, subastas]
---
# Q-012 - Alcance de subastas

> Antes de implementar subastas hay que fijar qué se subasta y cómo se evita el sniping. Decidido: cierre por tiempo o por profesor ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]) y las reglas de [[DEC-014 - Reglas de subastas]]. **Archivada el 2026-10-01**: el anti-sniping se decidió en [[DEC-014 - Reglas de subastas]] (fase final ciega) y "ítem único" pasó a ser la propuesta [[Ítems únicos]]. La dependencia sobre qué se subasta se resolvió en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] (origen: [[Q-017 - Qué se subasta mientras no existan ítems únicos]], archivada). Las subastas deben especificarse el 2026-10-01 porque el Sprint 2 y el Sprint 3 se están planificando ([[Roadmap de trabajo]]).

## Ya decidido
- **Quién y cuándo cierra** ([[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]]): una subasta termina cuando vence su tiempo o cuando un profesor la cancela. Los estudiantes no pueden cancelar.
- **Reglas de subastas** ([[DEC-014 - Reglas de subastas]], 2026-10-01):
  - Cancelación por profesor: un `HOLD_RELEASE_REQUESTED` por postor (S1). No se adopta el release por `orderId` de Accounting.
  - Los postores superados recuperan sus monedas recién al cierre (S3).
  - Incremento mínimo configurable por subasta (S6).
  - Duración máxima de 14 días (reemplaza a S10).
  - En subasta abierta, una oferta debe superar estrictamente a la mejor: no hay empates.
  - Subasta ciega (sealed-bid) planificada como modo; el empate se resuelve con una tirada de dado animada, decidida por el servidor y auditable.
  - Curso archivado: se cancelan las subastas abiertas del curso y se liberan los holds. Baja de un estudiante: se retiran sus ofertas, se liberan sus holds y la subasta continúa (S5).
  - No se extiende el tiempo de la subasta como defensa contra el sniping.
- **Garantía**: escrow completo, cada oferta retiene el monto total (decisión previa del equipo, referenciada en [[Hold y escrow]] e [[Ideas descartadas]]). Sigue sin `DEC` propia.

## Cómo se resolvieron los dos temas abiertos
| Tema | Resolución |
|---|---|
| Qué es un "ítem único" | No es una decisión: es la propuesta [[Ítems únicos]] (borrador). Qué se subasta mientras no exista se decidió en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] |
| Mecanismo anti-sniping | **Fase final ciega** (2026-10-01), en la sección "Actualización 2026-10-01: anti-sniping" de [[DEC-014 - Reglas de subastas]] |

### Candidatos de anti-sniping (histórico)
El objetivo era evitar que todos oferten en el último momento sin habilitar peleas interminables (por eso no se extiende el tiempo). Se eligió la opción 2.
1. **Cierre aleatorio dentro de una ventana final** ("subasta de vela"): el momento exacto de cierre se sortea dentro de los últimos minutos.
2. **Cambio a ofertas selladas en los últimos minutos**: al entrar en la ventana final la subasta pasa a modo ciego ([[DEC-014 - Reglas de subastas]]).
3. **Enfriamiento por estudiante** (cooldown entre ofertas del mismo estudiante).
4. **Cantidad limitada de ofertas por estudiante**.

Se adoptó la opción 2 (fase final ciega, con duración X y regla de la oferta sellada pendientes de detalle). Las demás quedaron descartadas.

## Pendientes menores sin tema propio
- Referencia del ítem subastado (`itemTemplateId` o `catalogOfferId`): se resuelve al diseñar la historia de lanzar subasta ([[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]).
- Nombre del estado de subasta sin ofertas (`MARKED_DESERTED` y similares).
- S2, S4, S7, S8 y S9 del [[Taller de decisiones]] siguen sin decidir.

## Recomendaciones del taller del equipo (S1 a S10)
Estado después de [[DEC-014 - Reglas de subastas]] ([[Taller de decisiones]]):

| ID | Recomendación | Estado |
|---|---|---|
| S1 | Un release por postor | Confirmada |
| S2 | Alinear los contratos de subasta al vocabulario de Accounting | Sin decidir |
| S3 | No liberar antes a los superados | Confirmada |
| S4 | Subastar solo equipamiento, sin vidas | Sin decidir |
| S5 | Mercado consume eventos de Cursos y libera sus holds | Confirmada |
| S6 | Incremento mínimo configurable | Confirmada |
| S7 | Generalizar outbox y correlación a un agregado genérico | Sin decidir |
| S8 | Pedir a Accounting bajar el relay a ~1 s | Sin decidir |
| S9 | Snapshot del item desde la plantilla al lanzar la subasta | Sin decidir |
| S10 | Duración máxima de 7 días | Reemplazada por 14 días |

## Evidencia
Accounting ya soporta el tipo `AUCTION_BID`, `HOLD_INCREASE_REQUESTED` y el release con `AUCTION_LOST` y `AUCTION_CANCELLED`; `ttlSeconds` es obligatorio. Limitaciones: un hold por `orderId` para siempre y sin liberación en lote ([[Integración con Accounting]]).

## Mensaje de accounting del 2026-10-01
- `HOLD_INCREASE_REQUESTED` envía el **total nuevo**, no la diferencia. Mercado no lo implementa: las subastas son Fase 3.
- Accounting propuso cancelar una subasta con un único `HOLD_RELEASE_REQUESTED` por `orderId`, sin `holdId`. **No se adopta** ([[DEC-014 - Reglas de subastas]]): se envía un release por postor y hay que comunicárselo a Accounting.
- `HOLD_INCREASED` no tiene manejador en Mercado.

## Qué hace hoy el código
Nada. Ver [[Subasta]].

## Recomendación
No aplica: la pregunta está archivada. Ver [[Épica 577 - Subastas]].

## Quién decide / con qué equipo hay que hablar
Equipo de Mercado; Accounting para lo que afecte holds e ítems.

## Resolución
Archivada el 2026-10-01. Todos sus puntos están decididos en [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] (cierre) y [[DEC-014 - Reglas de subastas]] (reglas y anti-sniping), o pasaron a la propuesta [[Ítems únicos]]. Dependencia sobre qué se subasta resuelta en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]].
