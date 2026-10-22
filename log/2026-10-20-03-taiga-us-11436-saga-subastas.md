## [2026-10-20] taiga | La integración del saga de subastas pasa a tener US propia (#11436)

- El usuario buscaba en el backlog del Sprint 3 "la historia de la integración del saga para subastas" y no la encontraba: hasta ahora ese trabajo vivía como una task (#11421) colgada de la US #9472, que es una historia de **meta colectiva**, no del bloque de subastas.
- Se creó la **US #11436** `[G11] — Subastas: integrar la saga de holds y el outbox al agregado de subasta` (New, Sprint 03, Épica 577, tags `g11`/`sprint-3`/`subastas`/`backend`/`accounting`) con la plantilla de historia completa: historia de usuario, alcance con los tres puntos de extensión, CA1–CA4, BDD de 3 escenarios y dependencias.
- La **task #11421** se movió de #9472 a #11436 y se corrigió su anclaje en la descripción. La **US #9472 volvió a `Done`** (ya no cuelga trabajo abierto) y la **US #8397 se desbloqueó**.
- Con esto el bloque de subastas queda: #8394 borradores, **#11436 saga/outbox**, #8395 ofertar, #8396 modo ciego, #8397 cerrar y liquidar, #8398 cancelar, #8399 frontend.
- Nota operativa: el listado de historias de Taiga por defecto no incluye las creadas más recientemente (tampoco #9479/#9480); la US nueva sí figura al ordenar por última modificación y su `sprint_order` está asignado al final del sprint.
- Notas tocadas: [[Subasta]] ("Abierto") y [[Carga en Taiga - Sprints 2 y 3]] (fila nueva de la integración del saga en el alcance del Sprint 3).
