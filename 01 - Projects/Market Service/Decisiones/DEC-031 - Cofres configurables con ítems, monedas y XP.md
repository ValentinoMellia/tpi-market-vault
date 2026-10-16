---
tipo: decision
estado: vigente
verificado_contra: equipo-po@2026-10-12
actualizado: 2026-10-16
tags: [mercado, decision, cofres, prd, monedas, xp]
---
# DEC-031 - Cofres configurables con ítems, monedas y XP

> Un cofre se compra a precio fijo y entrega un premio al azar. El profesor lo arma con total libertad: los premios pueden ser ítems del curso, monedas o XP. Para los cofres, esto deja sin efecto la restricción de RF-INT-01 de que nunca se obtienen monedas por intercambio.

## Contexto
La propuesta [[Cofres y nuevos ítems]] chocaba con el PRD: RF-INT-01 dice que las monedas solo se canjean por vidas o equipamiento y que nunca se obtienen por intercambio, y RF-INT-03 solo admite compra directa y subasta. Pregunta de origen: [[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]]. Esa pregunta recomendaba mantener RF-INT-01 y aceptar solo cofres con vidas o equipamiento.

El PO (Santoro) aprobó en persona que los cofres puedan dar monedas y XP. Fue en una clase de MSI II el lunes 12 de octubre de 2026, en una charla con Kimmel, del equipo de Mercado, que lo transmitió al resto del equipo. Después, el 2026-10-16, el equipo de Mercado (Patricio Fernandez) definió cómo se configura.

## Decisión
- **El cofre es una oferta de la tienda a precio fijo.** El alumno paga el precio y recibe un solo premio, sorteado entre los que el profesor configuró. Para el PRD, se trata como compra directa con resultado al azar.
- **Tres clases de premio:**
  - **Ítem:** una oferta del curso (vida o equipamiento).
  - **Monedas:** una cantidad que elige el profesor.
  - **XP:** una cantidad que elige el profesor.
- **Rareza y probabilidades:**
  - Cuatro rarezas: Común, Raro, Épico y Legendario.
  - Primero se sortea la rareza, según los pesos. Después se sortea un premio dentro de esa rareza.
- **Quién asigna la rareza:**
  - En los ítems y las monedas, Mercado sugiere la rareza comparando el valor del premio con el precio del cofre, y el profesor la puede cambiar.
  - En el XP no hay sugerencia: la rareza la elige el profesor.
- **Libertad del profesor.** La responsabilidad sobre la economía de su mercado es del profesor. El sistema avisa, por ejemplo cuando un premio en monedas vale más que el cofre o cuando el cofre devuelve en promedio más monedas de las que cobra, pero no bloquea la configuración.
- **RF-INT-01 en los cofres.** La restricción de no obtener monedas por intercambio, y la de gastar monedas solo en vidas o equipamiento, no se aplica a los cofres. Fuera de los cofres sigue vigente.

### Lo que esta decisión no cierra
Estos puntos siguen abiertos. Son propuestas del diseño, no reglas:
- Si el profesor puede cambiar los pesos o se usan siempre los de la plataforma (60 / 25 / 12 / 3).
- El máximo de premios por cofre (el diseño propone 8).
- Si las probabilidades se muestran siempre al alumno antes de comprar (el diseño lo recomienda).
- Las once decisiones abiertas de la propuesta (D-1 a D-11).
- Quién sortea, el catálogo de premios y cómo se acredita cada clase de premio. Eso corresponde a la task T02 #8427 de la US-8400.

## Alternativas descartadas
- **Solo ítems (vidas y equipamiento) en el cofre comprado:** era la recomendación de [[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]]. El PO prefirió permitir monedas y XP.
- **Separar un cofre de tienda (solo ítems) de un cofre de recompensa ganado en desafíos (con monedas y XP):** se planteó para no tocar RF-INT-01. Se descartó a favor de un único cofre totalmente configurable.
- **Equivalencia fija entre XP y monedas para sugerir la rareza del XP:** una equivalencia inventada terminaría tomándose como regla de la plataforma. El profesor la define a mano.

## Consecuencias
- **Integraciones.** Cada clase de premio se acredita por otro camino, y dos de ellos no existen hoy:
  - **Ítems:** los acredita Accounting, como en la compra directa ([[Integración con Accounting]]).
  - **Monedas:** hoy Banco solo reserva y cobra. Falta un contrato para que Mercado pida acreditar monedas a un alumno, con idempotencia por orden.
  - **XP:** no está identificado qué servicio es dueño del XP. Hay que averiguarlo y acordar cómo se acredita.

  Esto amplía la task T02 #8427, que solo nombra a Accounting.
- **Saga.** El cobro no cambia: un hold por el precio del cofre. Cambia la entrega, que depende de la clase de premio que salió. El sorteo tiene que guardarse en la orden, para que un reintento no vuelva a sortear.
- **Código.** Nada cambia hasta que la task T03 #8428 decida avanzar. Hoy no existe ningún tipo `CHEST` en `models/enums/ItemType.java`.
- **Frontend.** La pantalla del profesor suma premios de monedas y de XP junto a las ofertas. La vista del alumno muestra cada premio con su probabilidad.

## Notas afectadas
[[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]], [[Cofres y nuevos ítems]], [[Decisiones - Índice]], [[Market Service - Overview]], [[Roadmap de trabajo]].
