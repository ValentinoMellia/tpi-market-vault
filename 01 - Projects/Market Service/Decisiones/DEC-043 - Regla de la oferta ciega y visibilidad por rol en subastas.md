---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-22, codigo@5e9edc94f
actualizado: 2026-10-23
tags: [mercado, decision, subastas, fase-3]
---
# DEC-043 - Regla de la oferta ciega y visibilidad por rol en subastas

> En la fase final ciega de una subasta de puja visible, una oferta debe ser al menos la última mejor oferta visible más el incremento mínimo; esa mejor visible queda congelada y es la que ve el estudiante. En esa fase solo ofertan quienes ya ofertaron en la fase visible, y solo para subir. En una subasta `BLIND` la oferta se puede subir y retirar. Durante la fase ciega el staff ve el monto real de la mejor oferta. El desempate sigue siendo el dado del servidor, interno y sin mostrarse a nadie.

## Contexto
[[DEC-014 - Reglas de subastas]] decidió la fase final ciega como mecanismo anti-sniping y dejó pendiente la regla de la oferta ciega. De esa regla dependían qué se muestra como mejor oferta durante la fase final, quién puede ofertar, el retiro en el modo `BLIND`, qué ve el staff y cómo se presenta el desempate. Pregunta de origen: [[Q-031 - Regla de la oferta ciega y mejor visible en la fase final]], creada para la Task #8416 de la US #8396 ("Aplicar el modo ciego y la fase final ciega").

El equipo de Mercado confirmó las respuestas el 2026-10-22; las transmitió Martín Lozano. Las precisiones de implementación se definieron después, en el refinamiento de la US #8396, y se registran aparte.

## Decisión
Respuestas del equipo de Mercado (2026-10-22):

1. **Oferta mínima en la fase final ciega**: al menos la última mejor oferta visible más el incremento mínimo. Con 100 visible e incremento de 10, el mínimo es 110. Es la propuesta del spike ([[S2-09c - SPIKE Diseño técnico de subastas]], opción A de la pregunta).
2. **Mejor oferta que ve el estudiante durante la fase final**: la última mejor oferta visible, congelada desde el inicio de la fase final. La mejor actual de las ofertas ciegas nunca se muestra a los estudiantes ([[DEC-014 - Reglas de subastas]], US #8396 CA5).
3. **Quién oferta en la fase final**: solo quien ya ofertó al menos una vez en la fase visible, y solo para subir su oferta.
4. **Modo `BLIND`**: la oferta se puede subir y también retirar.
5. **Staff durante la fase ciega**: el profesor, el gestor y el ADMIN ven las ofertas reales, para supervisar o para que un ADMIN intervenga. Implica una vista distinta por rol.
6. **Desempate**: sigue vigente el dado de [[DEC-014 - Reglas de subastas]], con posibilidad de cambios futuros ([[Q-025 - Desempate de las subastas]] sigue abierta). El dado es interno: no se muestra a nadie y determina un ganador, con una cara por cada oferta empatada. Ya está implementado en Mercado como `ServerDieTieBreakRule` (`services/impl/ServerDieTieBreakRule.java`, `develop` en `5e9edc94f`).

### Precisiones acordadas al implementar
Las decidió Martín Lozano en el refinamiento de la US #8396, el 2026-10-22 y el 2026-10-23. No son respuestas del equipo: precisan cómo se aplican las anteriores.

- **Retiro solo en `BLIND`** (sobre el punto 4). En las subastas `VISIBLE` el retiro voluntario se rechaza, tanto en la fase visible como en la fase final ciega. La mecánica del retiro es la de la Task #8413: la oferta queda excluida, el hold se libera con `AUCTION_BID_WITHDRAWN` y el estudiante no vuelve a entrar en esa subasta. Esa mecánica está registrada como DEC-032 en la rama `revision-subastas-taiga`, todavía fuera de `main`. La regla por modo va en una tarea nueva de la US #8395.
- **Qué ve el staff** (sobre el punto 5). "Ofertas reales" significa el monto real de la mejor oferta. No incluye una lista por estudiante ni las identidades de los oferentes.
- **Oferta congelada** (sobre el punto 2). Es histórica e inmutable: el máximo monto confirmado con `confirmed_at` anterior al inicio de la fase final (corte estricto). No cambia si esa oferta se libera después o si su oferente queda excluido. Si nadie ofertó antes del corte, se informa `null`.
- **Fase final sin incremento mínimo** (sobre el punto 1). `min_increment` es opcional al lanzar una subasta `VISIBLE` (`src/main/java/ar/edu/utn/frc/tup/p4/dtos/auction/AuctionLaunchDto.java`, `isMinIncrementValid`). Si la subasta no lo tiene, la oferta de la fase final debe superar estrictamente a la oferta congelada, como proponía el spike. Igualarla no alcanza.
- **Oferta "de la fase visible"** (sobre el punto 3). Qué instante define que una oferta pertenece a la fase visible, para la elegibilidad en la fase final, lo resuelve la Task #8411 (sugerencia: el `created_at` del intento). Para mostrar la oferta congelada se usa `confirmed_at`.
- **Contrato con el frontend**. `best_bid` ausente significa "oculto". `null` significa "sin ofertas confirmadas", solo cuando la clave está presente. Después del cierre, `best_bid` no se informa a nadie; el resultado corresponde a #11468.

### Lo que esta decisión no cierra
- **Desempate definitivo**: sigue en [[Q-025 - Desempate de las subastas]].

## Alternativas descartadas
- **Solo base e incremento mínimo, sin comparar con la mejor visible** (opción B de la pregunta): admitía ofertas por debajo de la mejor visible, que nunca pueden ganar, y la regla podía confundir al estudiante.
- **Omitir `best_bid` durante la fase final, como en `BLIND`**: era la variante más privada, pero con la regla elegida el estudiante necesita la mejor visible para conocer su mínimo.
- **Cualquier estudiante inscripto puede ofertar en la fase final**: permitía entrar recién en la fase ciega, que es lo que la fase final busca evitar.
- **Oferta firme en el modo `BLIND`** (interpretación del spike): el equipo prefirió permitir el retiro.
- **Retiro solo en la fase visible de una subasta de puja visible** (propuesta del spike): las precisiones dejan el retiro solo en `BLIND`.
- **Sin incremento mínimo, admitir una oferta igual a la congelada**: dejaba entrar ofertas que empatan con la mejor visible desde el primer intento, y el empate solo se resuelve con el dado al cierre.
- **Misma vista para el staff y para el estudiante**: más simple, pero impide supervisar y que un ADMIN intervenga.
- **Tirada de dado animada mostrada a los empatados** ([[DEC-014 - Reglas de subastas]]): revelaba, al menos, que hubo empate y con qué monto, contra la confidencialidad de la fase ciega (US #8396 CA5). El dado queda interno.

## Consecuencias
- **Implementación en Mercado (US #8396)**: la política de fase compartida es la S1 (PR #274 de `tpi-market`, mergeada); la visibilidad de `best_bid` por rol es la S2a (PR #287, abierta); la oferta congelada es la S2b (change `us-8396-t01-s2b-frozen-best-bid`, pendiente).
- **Reglas de admisión 1 y 3** (mínimo en la fase final, incluido el caso sin incremento, y quién puede ofertar): Task #8411.
- **Retiro en `BLIND`**: tarea nueva en la US #8395, sobre la mecánica de la Task #8413.
- **Desempate**: no cambia el código; `ServerDieTieBreakRule` ya lo aplica. El cierre (US #8397) y el frontend no muestran la tirada.
- **Frontend**: tiene que distinguir `best_bid` ausente (oculto) de `best_bid` en `null` (sin ofertas confirmadas), y la vista del staff muestra el monto real de la mejor oferta durante la fase ciega.
- **[[DEC-014 - Reglas de subastas]]**: la regla de la oferta ciega deja de estar pendiente, y la tirada de dado deja de mostrarse a los estudiantes empatados.

## Notas afectadas
[[Q-031 - Regla de la oferta ciega y mejor visible en la fase final]], [[DEC-014 - Reglas de subastas]], [[Subasta]], [[Carga en Taiga - Sprints 2 y 3]], [[Épica 577 - Subastas]], [[Roadmap de trabajo]], [[S3-01 - Subastas, lanzar y ver las abiertas]], [[Decisiones - Índice]].
