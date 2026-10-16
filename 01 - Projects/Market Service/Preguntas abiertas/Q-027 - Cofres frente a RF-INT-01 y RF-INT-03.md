---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@ac05a77f
actualizado: 2026-10-16
tags: [mercado, pregunta-abierta, cofres, prd]
---
# Q-026 - Cofres frente a RF-INT-01 y RF-INT-03

> La propuesta de [[Cofres y nuevos ítems]] choca con dos requisitos del PRD sobre el uso de las monedas. El PO tiene que decir si RF-INT-01 sigue igual y si un cofre que solo da vidas o equipamiento cuenta como compra directa. Hasta que responda, rige el PRD y los cofres no avanzan.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| PRD, RF-INT-01 | Las monedas solo se canjean por vidas o equipamiento, nunca al revés, y nunca se obtienen monedas por intercambio | PRD, sección 10 |
| PRD, RF-INT-02 | Solo las monedas son intercambiables; XP, insignias y vidas no se canjean directamente | PRD, sección 10 |
| PRD, RF-INT-03 | Hay dos modalidades: compra directa (precio fijo en monedas) y subasta | PRD, sección 10 |
| Propuesta de cofres | Una plantilla `CHEST` que, al crear la orden, sortea un premio de un conjunto ponderado, con recompensas opcionales de monedas o XP | [[Cofres y nuevos ítems]] (propuestas del equipo, 2026-09-30) |

Por la jerarquía de verdad el PRD está por encima de una propuesta, así que la propuesta no puede avanzar sin una decisión explícita del PO.

La propuesta en realidad mezcla tres variantes, y cada una se lleva distinto con el PRD:

| Variante | Premios posibles | Frente al PRD tal como está |
|---|---|---|
| A | Incluye **monedas** | Viola RF-INT-01: se obtienen monedas por intercambio |
| B | Incluye **XP** | Viola RF-INT-01, porque las monedas se gastan en algo que no es vida ni equipamiento, y además RF-INT-02 |
| C | **Solo vidas o equipamiento** | Cumple RF-INT-01. Lo que queda abierto es RF-INT-03: ¿un precio fijo por un ítem al azar sigue siendo compra directa? |

## Qué hace hoy el código
No existen los cofres. `ItemType` tiene solo cuatro tipos (`SHIELD`, `BOOST_XP`, `BOOST_COINS`, `LIFE`) en `src/main/java/ar/edu/utn/frc/tup/p4/models/enums/ItemType.java` ([[Tipos de item]]). Cada oferta vende un único ítem configurado, y la compra pide un hold en Banco y una acreditación en Accounting para ese ítem ([[DEC-025 - Saga de compra de ítems según la Propuesta C]]). Ninguna parte de la saga sortea ni elige entre varios ítems.

## Preguntas para el PO
1. **¿RF-INT-01 sigue tal como está escrito?** Si la respuesta es sí, se descartan las variantes A y B. Si el PO lo cambia, el cambio tiene que quedar explícito, porque afecta también a Banco y Accounting.
2. **¿La variante C entra en RF-INT-03?** Respuestas posibles:
   - Sí: es una compra directa con resultado al azar.
   - No: es una tercera modalidad que el PRD no permite.
   - Sí, pero como modalidad nueva que el PO agrega al PRD.

## Opciones
1. **Mantener RF-INT-01 y descartar los cofres**: no hay que construir nada ni hablar con Accounting. Se pierde la idea entera, incluida la variante C, que podría caber.
2. **Mantener RF-INT-01 y aceptar solo la variante C como compra directa**: no hay que tocar el PRD ni la forma de la saga (un hold, un ítem acreditado). Falta acordar con Accounting quién sortea y cómo acredita.
3. **Cambiar el PRD para permitir monedas o XP como premio (variantes A y B)**: es la propuesta completa. Rompe la regla de que las monedas no se generan por intercambio, cambia la economía del curso y obliga a acordarlo con Banco y Accounting.

## Recomendación
Opción 2. Mantener RF-INT-01, descartar A y B, y aceptar la variante C como compra directa solo si se cumplen dos cosas:

- el precio es fijo y se conoce antes de comprar;
- cada premio posible es un ítem del catálogo (vida o equipamiento) que el estudiante también podría comprar por separado.

Así se conserva la forma actual de la saga. Lo que quede abierto (quién sortea, catálogo de premios, cómo acredita Accounting) se resuelve en la task T02 #8427 de la US-8400.

## Quién decide / con qué equipo hay que hablar
El PO. Patricio le lleva la pregunta en persona (task T01 #8426 de la US-8400). No hace falta Accounting para esta pregunta. Sí hace falta en T02 #8427, solo si el PO aprueba alguna variante.

Fuera de esta pregunta: los catorce tipos de ítem nuevos de la propuesta, los ítems `COSMETIC` (US-8401) y la posible tensión entre `BOOST_COINS` y RF-INT-01.

## Resolución
Pendiente.
