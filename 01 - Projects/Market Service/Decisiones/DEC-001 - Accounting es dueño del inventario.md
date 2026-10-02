---
tipo: decision
estado: vigente
verificado_contra: accounting@develop-2026-10-01
actualizado: 2026-10-01
tags: [mercado, decision, inventario, accounting]
---
# DEC-001 - Accounting es dueño del inventario

> El inventario del estudiante (la mochila de items) pertenece a Accounting (ex Banco, Tema 08, grupo G12 en Taiga). No es de Mercado ni de un servicio de inventario aparte.

## Contexto
Los documentos anteriores daban cuatro respuestas distintas a quién guarda los items comprados: Mercado, un microservicio de inventario separado, un "Grupo 12" que sería el equipo de Banco, o el propio Banco. Pregunta de origen: [[Q-001 - Dueño del inventario]].

La lectura del repositorio de accounting (`2026-P4-BE/tpi-accounting`, rama `develop`) aporta evidencia directa: tiene la tabla `inventory_items` (una fila por unidad) y no existe ningún repositorio de inventario separado. Además ese servicio ya es dueño de las monedas y de las vidas.

## Decisión
Decidido por el usuario en la sesión del 2026-10-01:

- El inventario pertenece a **Accounting (ex Banco, Tema 08, grupo G12 en Taiga)**; "Banco" fue renombrado a accounting / `accounting-service`.
- No es de Mercado.
- No existe un servicio de inventario aparte. La mención a un microservicio separado o a un "Grupo 12" como dueño del inventario queda superada ([[Ideas descartadas]]).

Esta decisión corresponde a la recomendación D13 del taller del equipo ("Accounting es dueño de monedas e inventario"), ver [[Taller de decisiones]].

## Alternativas descartadas
- **Inventario dentro de Mercado**: amplía el alcance y contradice el código de Mercado y el de accounting.
- **Servicio de inventario independiente**: no existe repositorio ni equipo que lo implemente; accounting ya guarda `inventory_items`.
- **Grupo 12 como dueño**: confusión de numeración con el Tema 12 (Backoffice); sin evidencia.

## Consecuencias
- Mercado no guarda ni administra items del estudiante. La entrega se hace publicando `ITEM_CONFIRMED` hacia accounting; hoy el código de Mercado todavía usa los mensajes `ITEM_PROVISION_*` de un inventario inexistente ([[Integración con Accounting]], [[Roadmap de trabajo]]).
- La nota de integración con Inventario se fusionó en [[Integración con Accounting]].
- La épica #131 se transfiere a accounting ([[Épica 131 - Inventario (otro equipo)]]).
- Siguen abiertas, porque esta decisión no las cubre: el orden de la saga ([[Q-008 - Orden de la saga de compra]]), el contrato de holds ([[Q-007 - Contrato con Accounting]]), el tope de vidas ([[Q-002 - Vidas y tope de vidas]]), los efectos ([[Q-011 - Efectos y consumo de items]]) y el vencimiento ([[Q-014 - Vencimiento de items]]).

## Notas afectadas
[[Market Service - Overview]], [[Integración con Accounting]], [[Mapa de servicios]], [[Épica 131 - Inventario (otro equipo)]], [[Tipos de item]], [[Glosario]], [[Ideas descartadas]], [[Decisiones - Índice]].
