---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5231"
puntos: 8
prioridad: Must
horas: 25
---
# S2-07 - Pruebas integradas con Accounting

> Demostrar que el contrato funciona: `KafkaSagaIntegrationTest` en verde, pruebas de contrato con los mensajes reales de Accounting y una prueba de compra punta a punta contra su servicio. Hoy esos 13 casos nunca se vieron en verde. 4 tareas, 25 h, 8 puntos, Must. Depende de [[S2-01 - Contrato con Accounting]].

## [G11] — Pruebas integradas con Accounting

---

## Descripción (Como / Quiero / Para)

- **Como**: integrante del equipo de Mercado
- **Quiero**: pruebas automáticas y una prueba real de la compra contra Accounting
- **Para**: asegurar que el contrato de holds e ítems funciona antes de entregar y detectar roturas futuras

---

## Notas / Observaciones

- [ ] Reglas de negocio: se prueba el contrato adoptado en [[DEC-009 - Contrato de holds e ítems según Accounting]]: HOLD_CREATE_REQUESTED, HOLD_CREATED, HOLD_REJECTED, HOLD_CONFIRM_REQUESTED, HOLD_CONFIRMED, HOLD_RELEASE_REQUESTED, HOLD_RELEASED, ITEM_CONFIRMED e ITEM_CREDITED.
- [ ] Validaciones: los mensajes de las pruebas de contrato se construyen a partir de los ejemplos reales de Accounting (envelope de 6 campos, eventVersion entero, eventId UUID canónico), no de los tipos de Mercado.
- [ ] Datos obligatorios: Docker disponible para Testcontainers; entorno con Accounting y Kafka accesible; un estudiante con saldo y un catalogItemId válido (ITEM-PLACEHOLDER-1 a ITEM-PLACEHOLDER-3).
- [ ] Performance (tiempos, volumen, límites): KafkaSagaIntegrationTest usa Testcontainers y se omite sin Docker; en CI debe correr o quedar marcado explícitamente como omitido.
- [ ] Seguridad (roles, permisos, datos sensibles): usar cuentas de prueba, nunca datos reales de estudiantes.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica.
- [ ] Otros: el listener de comandos de Accounting está apagado por defecto (app.holds.commands.enabled=false y accounting.messaging.consumers-enabled=false); la prueba punta a punta exige que lo enciendan. El orden de la compra sigue abierto ([[Q-008 - Orden de la saga de compra]]): las pruebas cubren el orden vigente al cierre del spike [[S2-09b - SPIKE Orden de la compra con Accounting]].

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: los 13 casos de KafkaSagaIntegrationTest pasan en una máquina con Docker y el resultado se adjunta a la historia.
- [ ] **CA2**: existe al menos una prueba de contrato por cada mensaje del listado de Notas, con el JSON de ejemplo de Accounting versionado en src/test/resources.
- [ ] **CA3**: una compra real de una oferta de precio conocido (POST /api/market/courses/{courseId}/orders) termina en CONFIRMED, el saldo del estudiante en Accounting baja exactamente coinPrice y el ítem figura en GET /api/accounting/courses/{courseId}/accounts/me/items.
- [ ] **CA4**: una compra con saldo insuficiente termina en REJECTED_INSUFFICIENT_FUNDS sin saldo debitado ni ítem acreditado.
- [ ] **Extras (opcional)**: el CI de develop ejecuta las pruebas de contrato sin Docker.

---

## BDD (mínimo 3 escenarios)

**Característica:** Compra integrada de punta a punta con Accounting

**Escenario 1**  

- **Dado**: Mercado y Accounting conectados al mismo Kafka con el tópico `accounting.events`, y un estudiante con saldo suficiente
- **Cuando**: compra una oferta con `POST /api/market/courses/{courseId}/orders`
- **Entonces**: recibe 202, ve el estado `CONFIRMED` en `GET /api/market/orders/{orderId}` y su inventario muestra el ítem con `sourceReferenceId` igual al `orderRef`

**Escenario 2**  

- **Dado**: un estudiante con saldo menor al `coinPrice` de la oferta
- **Cuando**: intenta comprar
- **Entonces**: Accounting responde `HOLD_REJECTED` con `reason: "INSUFFICIENT_BALANCE"` y la orden termina en `REJECTED_INSUFFICIENT_FUNDS`

**Escenario 3**  

- **Dado**: un `HOLD_CREATED` duplicado (mismo `eventId`) por reenvío de Accounting
- **Cuando**: Mercado lo recibe dos veces
- **Entonces**: procesa solo el primero (`processed_events`) y la orden no retrocede ni se duplica

**Escenario 4**  

- **Dado**: un `HOLD_REJECTED` con `reason: "INVALID_ORDER_TYPE"`
- **Cuando**: Mercado lo procesa en la prueba de contrato
- **Entonces**: la orden no queda como `REJECTED_INSUFFICIENT_FUNDS` (depende de [[S2-01 - Contrato con Accounting]])

---

## Prototipo

- **Capturas**: No aplica (pruebas automatizadas); el resultado de la prueba real se adjunta como captura o log
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `POST /api/market/courses/{courseId}/orders`, `GET /api/market/orders/{orderId}`; de Accounting `GET /api/accounting/courses/{courseId}/accounts/me/items`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 8
- **Prioridad (MoSCoW / Numérica)**: Must

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|8|Must|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado, Accounting, Kafka.
- Módulos afectados: `src/test` (`KafkaSagaIntegrationTest`, nuevas pruebas de contrato), configuración de pruebas.
- Otros equipos / aprobaciones: Accounting debe encender sus listeners de comandos, dar cuentas de prueba y avisar cuando integre `GET /api/accounting/holds/{holdId}` ([[Integración con Accounting]]).
- Impacto en datos / migraciones: ninguno en Mercado; datos de prueba en Accounting.
- Riesgos y mitigación (opcional): si Accounting no está listo en el sprint, la tarea 4 (punta a punta) puede quedar fuera y las demás se mantienen; mitigación: coordinar fecha con Accounting al empezar el sprint y simular Accounting con los mensajes reales en las pruebas de contrato.

Relación: [[Estado actual del código]] (gap 21), [[Roadmap de trabajo]], [[Eventos y Kafka]], [[Entrega at-least-once y deduplicación]].

---

## Tareas

### T01 - Dejar KafkaSagaIntegrationTest en verde

**Objetivo:** Recuperar y adaptar la prueba de integración de la saga.

- Ejecutar los 13 casos con Docker y corregir los fallos
- Adaptarlos al contrato nuevo (`accounting.events`, `orderRef`)
- Hecho cuando: los 13 casos pasan en verde con Docker

Estimación: 8 h

### T02 - Escribir pruebas de contrato con mensajes reales de Accounting

**Objetivo:** Detectar roturas del contrato de holds e ítems.

- Construir los mensajes a partir de los ejemplos reales de Accounting (envelope de 6 campos, `eventVersion` entero, `eventId` UUID)
- Cubrir holds, `ITEM_CONFIRMED` e `ITEM_CREDITED`
- Hecho cuando: las pruebas de contrato pasan con los mensajes reales de Accounting

Estimación: 6 h

### T03 - Levantar el entorno con Accounting

**Objetivo:** Contar con un entorno donde Mercado y Accounting comparten Kafka.

- Compose con Mercado, Accounting y el mismo Kafka
- Cuentas e ítems de prueba (`ITEM-PLACEHOLDER-1` a `ITEM-PLACEHOLDER-3`)
- Accounting debe encender su listener de comandos
- Hecho cuando: ambos servicios intercambian mensajes por el mismo Kafka con datos de prueba

Estimación: 4 h

### T04 - Probar la compra punta a punta contra Accounting real

**Objetivo:** Comprobar el flujo completo con evidencia.

- Casos: compra exitosa, saldo insuficiente y reenvío duplicado
- Adjuntar la evidencia (logs o capturas)
- Hecho cuando: los tres casos se ejecutan contra Accounting real y la evidencia queda adjunta

Estimación: 7 h
