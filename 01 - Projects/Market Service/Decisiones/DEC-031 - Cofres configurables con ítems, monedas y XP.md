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
Cuando se registró, esta decisión dejó abiertos el sorteo, la acreditación, varias reglas de configuración y las once decisiones de la propuesta original (D-1 a D-11). La task T02 #8427 los resolvió así:

- **Quién sortea, pesos, máximo de premios, visibilidad de las probabilidades y D-1 a D-11:** [[DEC-032 - Sorteo y reglas de configuración de los cofres]]. Sortea Mercado al crear la orden, los pesos son editables, no hay máximo de premios y el profesor elige si se ven las probabilidades.
- **Acreditación de ítems y monedas:** [[DEC-034 - Acreditación de premios de cofre en Accounting]], a partir de [[Q-028 - Acreditación de premios de cofre en Accounting]] (archivada).
- **Acreditación de XP:** [[DEC-033 - Acreditación de XP de cofre en Roadmap]], a partir de [[Q-029 - Acreditación de XP de cofre en Roadmap]] (archivada).

Sigue abierto, para la task T03 #8428:

- Si los cofres avanzan, se acotan o se difieren, y qué historias técnicas se cargan.
- El valor por defecto del interruptor «mostrar probabilidades» y cómo se arma la pantalla del profesor con cualquier cantidad de premios.
- Los nombres y la forma final de los eventos de acreditación de monedas y de XP, que se fijan al implementarlos.

## Alternativas descartadas
- **Solo ítems (vidas y equipamiento) en el cofre comprado:** era la recomendación de [[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]]. El PO prefirió permitir monedas y XP.
- **Separar un cofre de tienda (solo ítems) de un cofre de recompensa ganado en desafíos (con monedas y XP):** se planteó para no tocar RF-INT-01. Se descartó a favor de un único cofre totalmente configurable.
- **Equivalencia fija entre XP y monedas para sugerir la rareza del XP:** una equivalencia inventada terminaría tomándose como regla de la plataforma. El profesor la define a mano.

## Consecuencias
- **Integraciones.** Cada clase de premio se acredita por otro camino, y dos de ellos no existen hoy:
  - **Ítems:** los acredita Accounting, como en la compra directa ([[Integración con Accounting]]).
  - **Monedas:** hoy Banco solo reserva y cobra. Falta un contrato para que Mercado pida acreditar monedas a un alumno, con idempotencia por orden.
  - **XP:** no está identificado qué servicio es dueño del XP. Hay que averiguarlo y acordar cómo se acredita.

  Actualización (2026-10-16, task T02 #8427): «Banco» es Accounting, el ex Banco ([[Mapa de servicios]]), que hoy acredita monedas solo por desafíos. El dueño del XP es Roadmap ([[Integración con Roadmap]]).

  Por eso la task T02 #8427 se amplió el 2026-10-16: en Taiga recibió un comentario con este alcance y su título ahora suma a Banco y al dueño del XP.
- **Saga.** El cobro no cambia: un hold por el precio del cofre. Cambia la entrega, que depende de la clase de premio que salió. El sorteo tiene que guardarse en la orden, para que un reintento no vuelva a sortear.
- **Código.** Nada cambia hasta que la task T03 #8428 decida avanzar. Hoy no existe ningún tipo `CHEST` en `models/enums/ItemType.java`.
- **Frontend.** La pantalla del profesor suma premios de monedas y de XP junto a las ofertas. La vista del alumno muestra cada premio con su probabilidad.

## Notas afectadas
[[Q-027 - Cofres frente a RF-INT-01 y RF-INT-03]], [[Cofres y nuevos ítems]], [[Decisiones - Índice]], [[Market Service - Overview]], [[Roadmap de trabajo]].
