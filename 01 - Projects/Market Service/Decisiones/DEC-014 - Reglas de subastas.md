---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, subastas, fase-3]
---
# DEC-014 - Reglas de subastas

> Se fijan las reglas de liberación de holds, incremento mínimo, duración máxima, empates, subasta ciega, anti-sniping (fase final ciega) y comportamiento ante curso archivado o baja. Con la actualización del 2026-10-01 queda decidido todo lo que mantenía abierta [[Q-012 - Alcance de subastas]] (archivada); qué se subasta quedó decidido en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] (la pregunta [[Q-017 - Qué se subasta mientras no existan ítems únicos]] está archivada).

## Contexto
Las subastas deben quedar especificadas el 2026-10-01 porque se están planificando el Sprint 2 y el Sprint 3 ([[DEC-015 - Política del backlog de Taiga]], [[Roadmap de trabajo]]). [[DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo]] fijó quién cierra la subasta, pero dejó los casos límite en [[Q-012 - Alcance de subastas]]. Pregunta de origen: [[Q-012 - Alcance de subastas]].

## Decisión
Confirmada por el equipo de Mercado el 2026-10-01.

**Cancelación y liberación de holds**
- Cuando un profesor cancela una subasta, Mercado envía **un `HOLD_RELEASE_REQUESTED` por postor** (S1 del [[Taller de decisiones]], confirmada), con `releaseReason` `AUCTION_CANCELLED`. **No se adopta** la propuesta de Accounting de un único release por `orderId`; hay que comunicárselo ([[Integración con Accounting]]).
- Los postores superados **no recuperan sus monedas hasta que la subasta cierra** (S3, confirmada). Al cierre, los perdedores se liberan con `AUCTION_LOST`.

**Ofertas**
- El **incremento mínimo es configurable por subasta** (S6, confirmada).
- En una subasta abierta, una oferta **nunca puede igualar** a la mejor vigente: debe ser estrictamente mayor. Por eso no hay empates en subastas abiertas.

**Duración**
- La duración máxima es de **14 días**. Reemplaza a la recomendación S10 (7 días).

**Subasta ciega**
- Se planifica como **modo de subasta**, además de la abierta.
- En una subasta ciega, un **empate se resuelve con una tirada de dado animada**, mostrada a los estudiantes empatados.

**Curso archivado y baja de estudiante** (S5, confirmada)
- Si el curso se archiva, las **subastas abiertas de ese curso se cancelan** y se liberan sus holds.
- Si un estudiante se da de baja, **sus ofertas se retiran**, se liberan sus holds y la **subasta continúa**.
- Mercado consume los eventos de Cursos (`COURSE_ARCHIVED`, `STUDENT_UNENROLLED`) y libera sus propios holds ([[Integración con Cursos]]).

**Anti-sniping**
- **No se extiende el tiempo** de la subasta. El mecanismo que evita que todos ofrezcan en el último momento se decidió el 2026-10-01: ver "Actualización 2026-10-01: anti-sniping" más abajo.

## Alternativas descartadas
- **Un solo release por `orderId` (propuesta de Accounting)**: simplificaba la cancelación, pero Accounting guarda un hold por `orderId` para siempre y sin liberación en lote; se mantiene un release por postor.
- **Liberar al postor apenas es superado** (contrario a S3): descartado; las monedas quedan retenidas hasta el cierre.
- **Duración máxima de 7 días (S10)**: reemplazada por 14 días.
- **Extender el tiempo ante ofertas de último momento**: descartado como mecanismo anti-sniping.
- **Permitir empates en subastas abiertas**: descartado; la oferta debe superar estrictamente a la mejor.

## Consecuencias
- **Contrato**: un `HOLD_RELEASE_REQUESTED` por postor al cancelar o cerrar; comunicar a Accounting que no se usa el release por `orderId` ([[Integración con Accounting]]).
- **Modelo**: el estado de la subasta suma el modo (abierta o ciega) y el desempate por dado; ver [[Subasta]].
- **Desempate con dado**: el resultado **lo decide el servidor** y debe ser **auditable** (se registra el resultado y su origen). La animación es solo presentación: el cliente no decide ni influye en el resultado. Esta es una nota de ingeniería, no una regla de negocio adicional.
- **Consumo de eventos de Cursos**: hay que implementar `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` en Mercado antes de cerrar la Fase 3.
- [[Q-012 - Alcance de subastas]] quedó **archivada** el 2026-10-01: el anti-sniping se decidió (abajo) y "ítem único" pasó a ser la propuesta [[Ítems únicos]]. Lo que se subasta se resolvió en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] (origen: [[Q-017 - Qué se subasta mientras no existan ítems únicos]], archivada).
- Las subastas deben especificarse el 2026-10-01 porque los Sprint 2 y Sprint 3 están en planificación ([[Roadmap de trabajo]]).

## Actualización 2026-10-01: anti-sniping
Confirmado por el equipo de Mercado el 2026-10-01. Este apartado enmienda esta decisión; no crea una `DEC` nueva.

**Mecanismo: fase final ciega.** Durante los últimos X minutos de la subasta, las ofertas pasan a ser ciegas:
- Los estudiantes **pueden seguir ofertando**, pero **dejan de ver las ofertas de los demás**.
- El tiempo **no se extiende**.
- Al cierre gana la **oferta más alta**. Si hay empate en la fase ciega, se resuelve con la **tirada de dado** del servidor, auditable, ya decidida arriba.
- Reutiliza el modo de subasta ciega ya planificado: la fase final es una transición de abierta a ciega.

**Consecuencias**
- En la **fase abierta** sigue rigiendo que una oferta debe superar estrictamente a la mejor vigente.
- En la **fase ciega** puede haber empates, por lo que el desempate por dado aplica también a subastas abiertas que llegan a su fase final.
- La fase (abierta o ciega) se deriva del tiempo restante de la subasta; ver [[Subasta]].

**Duración de la fase final (X)**: es **configurable por subasta** y la define el profesor que la lanza (confirmado el 2026-10-01).

**Pendiente de detalle (no decidido)**
- **Regla de la oferta ciega**: si una oferta ciega debe superar a la última mejor oferta visible (el "estrictamente mayor" de la fase abierta) o solo cumplir el incremento mínimo y el mínimo de la subasta.

**Alternativas descartadas para el anti-sniping**: cierre aleatorio en una ventana final ("subasta de vela"), enfriamiento por estudiante y límite de ofertas por estudiante.

## Notas afectadas
[[Q-012 - Alcance de subastas]], [[Q-017 - Qué se subasta mientras no existan ítems únicos]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[Ítems únicos]], [[Subasta]], [[Taller de decisiones]], [[Integración con Accounting]], [[Integración con Cursos]], [[Épica 577 - Subastas]], [[Roadmap de trabajo]], [[Decisiones - Índice]].
