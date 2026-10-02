---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, subastas, fase-3]
---
# DEC-011 - Subastas, ítems únicos, cierre por profesor o por tiempo

> Una subasta termina cuando vence su tiempo o cuando un profesor la cancela; los estudiantes no pueden cancelar. **Enmienda 2026-10-01**: la parte "se subastan ítems únicos" **deja de ser una decisión**: qué se puede subastar quedó decidido en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] (la propuesta [[Ítems únicos]] no está aprobada).

## Contexto
Antes de implementar subastas (Fase 3) había que fijar qué se subasta y quién y cuándo las termina. Pregunta de origen: [[Q-012 - Alcance de subastas]], que conserva los casos límite sin resolver.

## Decisión
Decidida por el líder del equipo de Mercado el 2026-10-01:

> Se subastan ítems únicos; una subasta termina cuando vence su tiempo o cuando un profesor la cancela.

**Enmienda del 2026-10-01**: el equipo aclaró que "ítem único" **no es una decisión sino una propuesta** (ítems con habilidades especiales, no implementados y sin certeza de que se vayan a implementar): [[Ítems únicos]]. Queda **vigente solo la parte de cierre**:

- Una subasta termina por **vencimiento de su tiempo** o por **cancelación de un profesor**.
- **Los estudiantes no pueden cancelar** una subasta.

La garantía de escrow completo (cada oferta retiene el monto total) es una decisión previa del equipo que sigue referenciada ([[Hold y escrow]], [[Ideas descartadas]]).

## Qué ya no está decidido
La frase "se subastan ítems únicos" **no se sostiene como decisión**. Qué se puede subastar se resolvió en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]]: ítems regulares del catálogo mientras no existan los de la propuesta [[Ítems únicos]], que no está aprobada (origen: [[Q-017 - Qué se subasta mientras no existan ítems únicos]], archivada). La referencia concreta del ítem (`itemTemplateId` o `catalogOfferId`) se define al diseñar la historia de lanzar subasta.

## Alternativas descartadas
- Cierre solo por tiempo, sin cancelación de profesor: no cubre curso archivado, errores de publicación ni abuso.
- Cancelación por estudiantes: descartada de forma explícita.

## Consecuencias
- [[Q-012 - Alcance de subastas]] quedó **archivada** el 2026-10-01: sus casos límite se resolvieron en [[DEC-014 - Reglas de subastas]] (incluido el anti-sniping) y lo que se subasta se resolvió en [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] (origen: [[Q-017 - Qué se subasta mientras no existan ítems únicos]]).
- La cancelación por profesor requiere definir un endpoint de Mercado y el release correspondiente en Accounting (`AUCTION_CANCELLED`, [[DEC-009 - Contrato de holds e ítems según Accounting]]).
- Las recomendaciones S1 a S10 del [[Taller de decisiones]] siguen sin decidir, salvo lo que esta decisión implica sobre el cierre.

## Notas afectadas
[[Ítems únicos]], [[Q-017 - Qué se subasta mientras no existan ítems únicos]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[Subasta]], [[Épica 577 - Subastas]], [[Q-012 - Alcance de subastas]], [[Taller de decisiones]], [[Decisiones - Índice]].
