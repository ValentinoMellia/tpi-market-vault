---
tipo: pregunta
estado: en-disputa
verificado_contra: ninguno
actualizado: 2026-10-09
tags: [mercado, pregunta-abierta, subastas]
---
# Q-025 - Desempate de las subastas

> Cuando dos o más estudiantes ofrecen el mismo monto más alto, [[DEC-014 - Reglas de subastas]] decidió una tirada de dado, pero el spike de diseño propone otra cosa. Hay que elegir cómo se desempata; mientras tanto rige el dado de DEC-014.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| [[DEC-014 - Reglas de subastas]] | El empate se resuelve con una tirada de dado decidida por el servidor, auditable; la animación es solo presentación | Decisión del 2026-10-01 |
| Spike de diseño ([[S2-09c - SPIKE Diseño técnico de subastas]]) | No debería ser un sorteo aleatorio; por ahora gana la oferta más antigua con ese monto | Sesión del 2026-10-09, [[Subasta]] |
| Spike de diseño | A futuro, desempatar por la posición en el ranking del curso y cohorte, con la oferta más antigua como respaldo | Sesión del 2026-10-09, [[Subasta]] |

## Qué hace hoy el código
No existe código de subastas ([[Subasta]]).

El ranking de la cohorte vive en `tpi-roadmap` (grupo G10), rama `develop`. Solo admite los roles `STUDENT`, `ADMIN` y `PROFESSOR`, no una identidad de servicio, y las filas iguales comparten puesto (`controllers/RankingController.java`, `services/RankingRules.java`, verificado el 2026-10-09). Mercado hoy no puede consultarlo.

## Opciones
1. **Dado del servidor (DEC-014)**: ya decidido. Desventaja: es azar, y en el spike se pidió algo que no lo fuera.
2. **Oferta más antigua**: gana quien hizo antes esa oferta con ese monto. Es determinista, auditable por el `placedAt` y solo usa datos de Mercado. Desventaja: premia ofertar temprano aunque en la fase ciega nadie vea las ofertas de los demás.
3. **Ranking del curso y cohorte**: gana quien esté más alto. Premia a quien va mejor en el curso. Desventajas: necesita que G10 agregue una consulta para servicios, el cierre es automático (no se puede consultar como el profesor), las posiciones pueden repetirse y el dato de vidas perdidas hoy no es confiable.
4. **Ronda final entre empatados**: solo los empatados vuelven a ofertar una vez, a ciegas, durante un plazo corto. Sin azar ni dependencias, pero extiende el cierre y puede volver a empatar.
5. **Menos compras en la tienda del curso**: criterio de equidad con datos de Mercado. Hay que definir qué cuenta y si es deseable.

## Recomendación
Sin decidir. El diseño de [[Subasta]] usa la opción 2 como propuesta provisional para el Sprint 3 y deja la opción 3 como mejora prevista para el siguiente sprint, a conversar con G10. Hasta que se decida, rige el dado de [[DEC-014 - Reglas de subastas]]; si se elige otra opción, se enmienda esa decisión.

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado. Para la opción 3, además G10 (`tpi-roadmap`).

## Resolución
Pendiente.
