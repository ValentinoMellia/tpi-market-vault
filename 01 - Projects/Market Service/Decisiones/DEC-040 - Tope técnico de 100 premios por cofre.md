---
tipo: decision
estado: vigente
verificado_contra: codigo@e63dcb47
actualizado: 2026-10-23
tags: [mercado, decision, cofres, limites]
---
# DEC-040 - Tope técnico de 100 premios por cofre

> Un cofre admite como máximo 100 premios. Es un tope técnico contra el abuso, no una regla de negocio: enmienda solo en este punto el «no hay máximo de premios» de [[DEC-032 - Sorteo y reglas de configuración de los cofres]].

## Contexto
[[DEC-032 - Sorteo y reglas de configuración de los cofres]] decidió que no hay máximo de premios por cofre, para no limitar al profesor. La US-12002 ([[S3-02 - Cofres, el profesor crea y gestiona]]) también dice «sin máximo de cantidad».

En el QA de la T02 (#12006, DTO de gestión, PR 263 de `tpi-market`) apareció que una lista de premios sin tope deja que un solo pedido cargue miles de premios. Eso afecta a la base, a la evaluación de probabilidades y a la pantalla. El equipo de Mercado (Patricio Fernandez) decidió el 2026-10-22 poner un tope técnico, y el verify-report de la T02 pidió registrarlo en el vault junto a DEC-032.

Por la jerarquía de verdad, DEC-032 gana sobre el código. Sin esta decisión, el código contradiría una decisión vigente.

## Decisión
- **Tope de 100 premios por cofre.** Un cofre con más de 100 premios responde 400.
- **Es técnico, no de negocio.** Protege al servicio de pedidos abusivos. Ningún profesor razonable necesita más de 100 premios, y la libertad de configuración de [[DEC-031 - Cofres configurables con ítems, monedas y XP]] sigue igual en todo lo demás.
- **DEC-032 sigue vigente** en todo lo demás.

## Alternativas descartadas
- **Sin tope, como dice DEC-032:** cualquier cliente podía mandar un cofre con miles de premios en un solo pedido.
- **8 premios, como la maqueta original:** es un límite de pantalla y ya se había descartado en DEC-032.
- **Dejarlo solo como detalle del código:** el código contradecía una decisión registrada, y el vault no silencia contradicciones.

## Consecuencias
- **Código.** `ChestLimits.MAX_PRIZES = 100` (`src/main/java/ar/edu/utn/frc/tup/p4/models/ChestLimits.java`), aplicado con `@Size(max = ChestLimits.MAX_PRIZES)` en `prizes` de `dtos/chests/ChestRequestDto.java`. El error sale de Bean Validation, con el campo `prizes` ([[Errores de la API]]). La misma clase tiene `MAX_RARITY_WEIGHT = 1000`, otro tope técnico: con dos pesos de `2147483647`, la suma del sorteo desbordaba.
- **Frontend.** La pantalla del profesor (H4 de [[DEC-035 - Cofres en dos fases]]) tiene que admitir hasta 100 premios.
- **Taiga.** La descripción de la US-12002 todavía dice «sin máximo de cantidad»; se corrige con el OK del equipo.

## Notas afectadas
[[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[Cofre]], [[S3-02 - Cofres, el profesor crea y gestiona]], [[Decisiones - Índice]].
