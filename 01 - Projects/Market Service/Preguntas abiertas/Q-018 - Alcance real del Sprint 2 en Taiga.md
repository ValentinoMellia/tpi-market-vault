---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, pregunta-abierta, backlog, sprint-2, taiga]
---
# Q-018 - Alcance real del Sprint 2 en Taiga

> El sprint "G11 - Sprint 2" de Taiga tiene 25 historias y 92 puntos, mientras que el [[Plan del Sprint 2]] prevé 13 historias y 73 puntos. Hay que decidir qué pasa con las nueve historias anteriores, si #1037 y #1038 entran con mock y cómo se reparte el frontend entre #5236, #5288, #5289 y #5290.

## Qué se contradice

| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Plan | 13 historias, 73 puntos, unas 255 h de las ~250 h que quedan | [[Plan del Sprint 2]], [[Sprint 2 - Índice]] |
| Taiga | 25 historias: las 13 del plan, 9 anteriores (22 puntos) y 3 de frontend sin puntos cargados (8 y 5 según su descripción) | Sprint "G11 - Sprint 2"; detalle en [[Revisión del Sprint 2 en Taiga]] |
| Roadmap | El consumo de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED` y los eventos para Notificaciones son P2 (alcance futuro) | [[Roadmap de trabajo]] |
| Taiga | #1037 (Must/1), #1038, #1051 y #1052 están dentro del Sprint 2 | Sprint "G11 - Sprint 2" |

Las contradicciones con decisiones registradas (formato de los avisos, "Banco", prefijo de #1053, pestañas de #5289) no forman parte de esta pregunta. Las resuelve la jerarquía de verdad y están listadas en [[Revisión del Sprint 2 en Taiga]].

## Qué hace hoy el código

- #1010, #1012 y #1013 están hechas en su mayor parte, y #1011 está cubierta por #5214 y #5202 ([[Revisión del Sprint 2 en Taiga]], sección "Duplicados y solapamientos").
- No hay consumo de `courses.events`: la matrícula y la asignación se consultan contra clientes simulados ([[Integración con Cursos]], [[S2-02 - Clientes reales de Cursos]]).
- El frontend de #5288 y #5289 ya está implementado. #5288 usa `GET /api/market/courses/{courseId}/summary`, que no existe en `develop`.

## Opciones

### 1. Las nueve historias anteriores

1. **(a) Sanear según [[DEC-015 - Política del backlog de Taiga]]:**
   - #1010 se mantiene con sus tareas reescritas ([[US-1010 - Contrato de la API publicado]]);
   - #1011, #1012 y #1013 se cierran como duplicadas u obsoletas;
   - #1051, #1052 y #1053 vuelven al backlog;
   - #1037 y #1038 se tratan en el punto 2.
   - A favor: el sprint queda en unos 75 puntos (los 73 del plan más los 2 de #1010; #1037 y #1038 se deciden en el punto 2), cerca de la capacidad.
   - En contra: hay que avisar al autor y reescribir las historias que vuelven al backlog.
2. **(b) Dejarlas todas en el sprint.**
   - A favor: no hay que tocar nada.
   - En contra: 92 puntos o más contra los 73 del plan; hay historias ya hechas o duplicadas, y otras que contradicen decisiones.
3. **(c) Sanear solo las duplicadas y obsoletas, y dejar las demás en el sprint como Could.**
   - A favor: término medio.
   - En contra: el sprint sigue por encima de la capacidad.

### 2. #1037 y #1038: ¿entran ahora, con mock?

1. **(a) Sprint 2, con mock** detrás de una interfaz, igual que los demás clientes (`market.messaging.transport`).
   - A favor: adelanta lo que las subastas del Sprint 3 necesitan (cancelar ante `COURSE_ARCHIVED` y `STUDENT_UNENROLLED`, [[DEC-014 - Reglas de subastas]]).
   - En contra: suma 6 puntos a un sprint sobrecargado; el contrato de los eventos no está confirmado con Cursos; #1038 espera una definición del PO.
2. **(b) Sprint 3, junto con las subastas.**
   - A favor: respeta el [[Roadmap de trabajo]] y da tiempo para acordar el contrato con Cursos.
   - En contra: el bloqueo por curso cerrado no llega en este sprint.
3. **(c) Sprint 2 por consulta y no por evento:** al comprar o publicar se consulta el estado de la cohorte en Cursos, como hace [[S2-02 - Clientes reales de Cursos]] con la matrícula. El evento queda para el Sprint 3.
   - A favor: barato, reutiliza el cliente de Cursos y cubre los CA1 y CA2 de #1037. El CA1 de #1038 ya lo cubre #5202.
   - En contra: no cumple los criterios de idempotencia del evento (CA3 de ambas).

### 3. Reparto del frontend

1. **(a) Repartir el alcance:**
   - #5288 y #5289 quedan como están, con correcciones;
   - #5290 se queda con la vitrina y las tarjetas (alumno y profesor);
   - #5236 se reduce a compra con idempotencia, estado por [[SSE]], mis compras y errores `problem+json`.

   Las correcciones de #5288 y #5289:
   - cargar los puntos;
   - Subastas y Metas colaborativas como "próximamente";
   - Inventario leído de Accounting o quitado;
   - resolver el endpoint `summary`.
   - A favor: refleja el trabajo hecho sin contarlo dos veces.
   - En contra: hay que reestimar #5236.
2. **(b) Absorber #5290 dentro de #5236** y cerrar #5290 como duplicada.
   - A favor: una historia menos.
   - En contra: #5290 describe trabajo concreto, con ramas propias, y se pierde trazabilidad.

## Recomendación

- Punto 1: opción (a).
- Punto 2: opción (c) si sobra capacidad; si no, (b).
- Punto 3: opción (a).

Para el endpoint `summary` de #5288 conviene empezar por calcular el conteo desde la vitrina y no abrir trabajo de backend nuevo en este sprint.

## Quién decide / con qué equipo hay que hablar

- Equipo de Mercado: líder y Product Owner.
- Autores de las historias: #1010 a #1053, #5288, #5289 y #5290.
- Cursos: el contrato de `COURSE_ARCHIVED` y `STUDENT_UNENROLLED`, si se elige 2(a).
- PO: el destino de las monedas y los ítems de quien deja la cursada (#1038).

## Resolución

Pendiente. Al decidir se registra una `DEC-NNN`, se archiva esta pregunta y se actualizan [[Sprint 2 - Índice]], [[Plan del Sprint 2]] y [[Revisión del Sprint 2 en Taiga]].
