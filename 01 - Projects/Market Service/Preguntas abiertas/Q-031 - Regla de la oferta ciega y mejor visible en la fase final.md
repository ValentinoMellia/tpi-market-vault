---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@1c75fd75c
actualizado: 2026-10-21
tags: [mercado, pregunta-abierta, subastas]
---
# Q-031 - Regla de la oferta ciega y mejor visible en la fase final

> [[DEC-014 - Reglas de subastas]] decidió la fase final ciega, pero dejó sin decidir cuánto debe ofrecer un estudiante en esa fase. De esa regla dependen qué se muestra como mejor oferta durante la fase final, quién puede ofertar y qué datos hay que guardar. Esta pregunta reúne esos puntos para que el equipo los confirme; no decide ninguno.

## Contexto
[[DEC-014 - Reglas de subastas]] (actualización del 2026-10-01, anti-sniping) decidió que en los últimos X minutos de una subasta de puja visible las ofertas pasan a ser ciegas: se puede seguir ofertando, los estudiantes dejan de ver las ofertas de los demás, el tiempo no se extiende, gana la más alta y el empate se resuelve con el dado del servidor, auditable. En "Pendiente de detalle (no decidido)" quedó la **regla de la oferta ciega**.

La US #8396 de Taiga ("Aplicar el modo ciego y la fase final ciega", Task #8416) ya cubre lo decidido: la fase se deriva del reloj del servidor (CA2 y CA4), las respuestas omiten lo no visible (CA3) y el listado, el detalle y cualquier canal de actualización no revelan montos, identidades ni revisiones ajenas de la fase ciega (CA5). La primera parte (S1, `tpi-market` rama `feature/us-8396-t01-s1-auction-phase-policy`, commit `1c75fd75c`, PR pendiente) implementa esa derivación y esa confidencialidad. Lo que sigue abierto son las reglas de negocio de esta nota.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[DEC-014 - Reglas de subastas]] | La regla de la oferta ciega no está decidida | "Pendiente de detalle (no decidido)" |
| Spike de diseño ([[S2-09c - SPIKE Diseño técnico de subastas]]) | En la fase final, la oferta debe ser al menos la mejor visible más el incremento; solo oferta quien ya ofertó en la fase visible, y solo para subir | [[Subasta]], "Reglas de las ofertas" (propuesta sin confirmar) |
| [[Carga en Taiga - Sprints 2 y 3]] | Presentaba "solo ofertan quienes ya ofertaron" como parte del alcance, sin aclarar que es propuesta | Sección 3, fila del modo ciega (corregida el 2026-10-21) |
| Código de S1 (`1c75fd75c`) | Durante la fase final envía `best_bid` presente y vacío, igual que en la fase visible sin ofertas | `services/impl/AuctionQueryService.java` |
| US #8396 (Taiga) | Mostrar o no la última mejor visible congelada durante la fase final está pendiente de ratificación | Descripción de la historia, alineación del 2026-10-17 |
| [[DEC-014 - Reglas de subastas]] frente a US #8396 CA5 | El dado es una tirada animada mostrada a los estudiantes empatados; CA5 pide no revelar identidades de la fase ciega | Ver punto 6 |

## Qué hace hoy el código
Verificado contra `tpi-market` `1c75fd75c` (rama `feature/us-8396-t01-s1-auction-phase-policy`, sin mergear). Rutas relativas a `src/main/java/ar/edu/utn/frc/tup/p4/` salvo las de Flyway.

- **Fase**: `services/impl/AuctionPhasePolicy.java` calcula la fase con el instante que le pasa quien la llama, sin leer el reloj ni modificar la subasta. `models/enums/AuctionPhase.java` tiene `VISIBLE`, `FINAL_BLIND` y `BLIND`; `hidesOtherBids()` es `false` solo en `VISIBLE`. En modo `VISIBLE` la fase final empieza en `endsAt - finalPhaseMinutes`, con el límite incluido. Si la fase final no se puede calcular, la fase es `BLIND`.
- **Listado y detalle**: `services/impl/AuctionQueryService.java` (`listOpen` y `getById`) lee el reloj una sola vez por consulta. `best_bid` queda **ausente** en `BLIND` y **presente y vacío** en `VISIBLE` y en `FINAL_BLIND`; `in_final_phase` es `null` en `BLIND`, `false` en `VISIBLE` y `true` en `FINAL_BLIND`. El detalle de una subasta que ya no está `OPEN` no lleva `best_bid` ni `in_final_phase`. Mantener `best_bid` vacío en la fase final **no es una decisión**: es el comportamiento heredado del listado de la US-5347 ([[S3-01 - Subastas, lanzar y ver las abiertas]], CA5).
- **Staff**: profesores, gestores y ADMIN reciben el mismo `best_bid` e `in_final_phase` que un estudiante; el rol solo cambia qué subastas pueden ver (un estudiante no ve las que nunca se abrieron).
- **Oferta**: `entities/AuctionBidEntity.java` y `src/main/resources/db/migration/V15__auction_bids.sql` guardan **una fila por subasta y estudiante** (`uk_auction_bid_auction_student`). `amount` es el total retenido y solo sube. No hay tabla de revisiones ni columna de fase. `createdAt` y `updatedAt` se completan con `LocalDateTime.now()`, no con el `Clock` inyectado que juzga la fase. La migración cita DEC-038 (PR #57 del vault, sin mergear) como origen de este modelo mínimo; colocar y subir ofertas corresponde a la task #8412.
- **Flyway**: `V15` y `V16__chests_schema.sql` ya existen en `develop`, así que cualquier tabla o columna nueva para esta pregunta sería `V17` o posterior.

## Opciones

### 1. Regla de la oferta ciega (pendiente de DEC-014)
1. **Opción A, propuesta del spike** ([[Subasta]], "Reglas de las ofertas"): en la fase final, la oferta debe ser al menos la mejor oferta visible más el incremento mínimo (con 100 visible e incremento de 10, el mínimo es 110). Si la subasta no tiene incremento, debe superar estrictamente a la mejor visible. Las ofertas ciegas no se comparan entre sí, por eso puede haber empates.
   - Ventajas: continúa la regla de la fase visible y evita que la fase final sirva para ofertar por debajo de lo que ya se vio.
   - Desventajas: hay que conocer la mejor visible congelada al empezar la fase final (punto 2), lo que exige guardar datos que hoy no existen.
2. **Opción B**: en la fase final solo se exige la base y el incremento mínimo de la subasta, sin comparar con la última mejor visible.
   - Ventajas: no necesita datos nuevos; la validación es la misma en toda la fase final y en el modo `BLIND`.
   - Desventajas: admite ofertas por debajo de la mejor visible, que nunca pueden ganar porque esa oferta no baja; la regla puede confundir al estudiante.

### 2. Mejor oferta visible durante la fase final (atado al punto 1)
- **Con la opción A**: el estudiante necesita conocer la mejor visible congelada para saber su mínimo, así que el listado y el detalle deberían mostrarla durante la fase final. El modelo actual (`V15`) no puede reconstruirla una vez que alguien sube su oferta en la fase ciega, porque la fila guarda solo el último `amount`. Haría falta una tabla de revisiones (la "Revisión de la oferta" del diseño de [[Subasta]]) o un valor congelado de la mejor visible, con una migración nueva (`V17` o posterior) que escriba la task #8412 al colocar o subir una oferta.
- **Con la opción B**: `best_bid` se puede omitir en la fase final igual que en `BLIND`. No requiere datos nuevos y es la variante más privada.
- En ambos casos, **nunca se expone la mejor actual de las ofertas ciegas**: eso ya está decidido ([[DEC-014 - Reglas de subastas]], US #8396 CA5).
- Hoy el código envía `best_bid` presente y vacío en la fase final (ver "Qué hace hoy el código"). Cualquiera de las dos opciones cambia ese comportamiento.

### 3. Quién puede ofertar en la fase final
1. **Propuesta del spike**: solo quien ya ofertó al menos una vez en la fase visible, y solo para subir su oferta. Reduce el sniping de quien entra al final. Requiere saber si la primera oferta de cada estudiante fue anterior al inicio de la fase final; con `V15` sirve `createdAt`, pero no usa el `Clock` que juzga la fase.
2. **Cualquier estudiante inscripto** en el curso y cohorte. Más simple y abierto, pero permite entrar recién en la fase ciega.

[[Carga en Taiga - Sprints 2 y 3]] lo presentaba como decidido; se corrigió el 2026-10-21 para dejar claro que es una propuesta pendiente de esta pregunta.

### 4. Modo `BLIND`: subir y retirar
- **Interpretación del spike** ([[Subasta]], "Abierto"): en modo `BLIND` se puede subir la oferta (Accounting solo permite subir un hold) y no se puede retirar.
- Una rama sin mergear y sin PR (`feature/accounting-subastas-conversacion`) propone permitir el retiro sin límite de fase. Si se adopta, choca con la propuesta del spike de que la oferta sea firme en toda fase ciega.

### 5. Qué ve el staff durante la fase ciega
La US #8396 CA5 habla de las respuestas en general y no dice qué ven el profesor, el gestor y el ADMIN en el detalle y en los listados del staff mientras la fase es ciega. Hoy reciben lo mismo que un estudiante. Opciones: mantener la misma vista que el estudiante (más simple y sin filtraciones por pantallas compartidas) o mostrar al staff las ofertas reales (útil para supervisar y para que un ADMIN intervenga), con el riesgo de que se filtren a los estudiantes.

### 6. Desempate
- [[Q-025 - Desempate de las subastas]] sigue abierta. Mientras no se resuelva, rige el **dado del servidor, auditable**, de [[DEC-014 - Reglas de subastas]].
- La resolución corresponde al cierre (US #8397) y **no bloquea** la US #8396.
- Para tener en cuenta en la US #8397: DEC-014 dice que la tirada de dado animada se muestra a los estudiantes empatados, y la US #8396 CA5 pide no revelar identidades ni montos ajenos de la fase ciega. Mostrar la tirada revela, al menos, que hubo empate y con qué monto. Hay que definir qué se muestra.

## Qué destraba
- **US #8396, segunda parte (S2)**: el `best_bid` real en el listado y el detalle, en cada fase.
- **Task #8411**: las validaciones de la oferta por fase.
- **Task #8412**: colocar y subir ofertas y, si se elige la opción A, guardar las revisiones o la mejor visible congelada.

## Recomendación
Sin recomendación: el equipo debe elegir. Mientras tanto, el código no implementa ninguna regla de la oferta en la fase final y mantiene la confidencialidad ya decidida.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado. Para el retiro en el modo `BLIND`, además Accounting (no hay `releaseReason` para un retiro voluntario).

## Resolución
**Pendiente de confirmación del equipo.** Nadie cierra esta pregunta sin una confirmación explícita del equipo de Mercado. Cuando se decida, se enmienda [[DEC-014 - Reglas de subastas]] y se actualizan [[Subasta]] y [[Carga en Taiga - Sprints 2 y 3]].
