---
tipo: decision
estado: vigente
verificado_contra: equipo-mercado@2026-10-21
actualizado: 2026-10-21
tags: [mercado, decision, subastas, apertura-programada]
---
# DEC-038 - Apertura programada de subastas

> Una subasta `SCHEDULED` se abre sola al llegar su fecha de inicio: el guardado se congela tal como está, se revalida que la cohorte esté habilitada, la plantilla activa y la ventana vigente, el fin se cuenta desde la apertura real, y si no se puede abrir queda `SCHEDULED` y se reintenta. La apertura es idempotente. La decisión es del equipo de Mercado, no una ratificación del PO.

## Contexto
La US #8394 (borradores de subasta, Task-8410 "T03: apertura programada") dejó como "pendiente de ratificación" cuándo se toma el snapshot del ítem, qué se revalida al abrir y qué estado tiene una subasta que no se puede abrir. [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]] fija que el snapshot se congela al lanzar, pero no dice qué pasa cuando el lanzamiento se programa. [[DEC-014 - Reglas de subastas]] define la duración (1 hora a 14 días) y no habla de la apertura diferida.

La decisión la tomó el equipo de Mercado (G11) con el usuario de la tarea el 2026-10-21, durante la Task-8410. **El motivo es la decisión del equipo, no una ratificación del PO.** Las respuestas textuales fueron: "Congelar el guardado", "Cohorte/mercado habilitado, Plantilla activa, Ventana vencida", "Fin desde la apertura real" y "Queda SCHEDULED". La frecuencia del proceso se eligió como "30 s (Recomendado)".

## Decisión
- **Snapshot:** el snapshot del ítem que guardó el borrador o la programación se congela tal cual al abrir. No se vuelve a resolver desde la plantilla.
- **Revalidación al abrir:** antes de pasar a `OPEN` se comprueba que (a) la cohorte y el mercado estén habilitados (regla de [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]]), (b) la plantilla base del lote siga activa y (c) la ventana no esté vencida. El corte de la cohorte no se revalida más allá de lo que necesita (c).
- **Ventana y fin:** `starts_at` es el instante real de la apertura y `ends_at = starts_at + duración` (la duración completa). La ventana está vencida cuando ese `ends_at` cae después del corte vigente de la cohorte; en ese caso no se abre.
- **Programación no abrible:** si falla la revalidación o no se puede completar la comprobación, la subasta **queda `SCHEDULED`**: no cambia de estado ni de versión, se registra el motivo y se reintenta en cada ejecución (cada 30 s). El profesor puede editarla o cancelarla mientras tanto.
- **Idempotencia:** la apertura produce una sola transición `SCHEDULED` → `OPEN` por subasta, aunque la ejecución se repita o corra en simultáneo (varios hilos o instancias). La ejecución que pierde no falla ni modifica la fila. Abrir no admite ofertas ni pide holds.
- **Alcance:** esta decisión no cubre el cierre ni la liquidación, las ofertas y holds, la duración de una subasta ya `OPEN` ([[DEC-014 - Reglas de subastas]]), ni estados nuevos o la transición `SCHEDULED` → `DRAFT`.

## Alternativas descartadas
- **Re-resolver el snapshot desde la plantilla al abrir:** haría que lo que ve el profesor al programar difiera de lo que se abre. Se eligió congelar el guardado.
- **Cancelar o marcar como fallida la programación que no se puede abrir:** el equipo eligió que quede `SCHEDULED` y se reintente, para no perder la programación por una falla transitoria (por ejemplo, Cursos no disponible).
- **Mantener el fin original de la programación:** se eligió contar el fin desde la apertura real, para no acortar la subasta si la apertura se demora.

## Consecuencias
- La implementación vive en `tpi-market` (Task-8410): un proceso programado cada 30 s que abre de a una las subastas `SCHEDULED` con `scheduled_start_at` vencido, sin que una falla bloquee a las demás. La propiedad de intervalo es configurable.
- Una programación con la plantilla desactivada o la cohorte deshabilitada puede quedar `SCHEDULED` indefinidamente hasta que el profesor la edite o cancele; no hay aviso automático en esta decisión.
- Los demás puntos de [[Subasta]] marcados como pendientes (desempate, retiro, liquidación, cursos) **siguen abiertos**: esta decisión solo resuelve la apertura programada.

## Notas afectadas
[[Subasta]], [[DEC-014 - Reglas de subastas]], [[DEC-016 - Subastas con ítems del catálogo mientras no existan ítems únicos]], [[DEC-020 - Mercado habilitado solo con la cohorte ACTIVE]], [[Decisiones - Índice]].
