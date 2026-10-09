---
tipo: historia
estado: borrador
verificado_contra: codigo@e456c55f
actualizado: 2026-10-09
tags: [mercado, backlog, sprint-2, opcional]
sprint: 2
taiga: "#5261"
puntos: 8
prioridad: Could
horas: 20
---
# S2-OPC1 - Reconciliación de compras

> Objetivo opcional: implementar el `BankHoldQueryClient` real, encender la reconciliación y resolver las órdenes que quedan en `CREATED`. Depende de que Accounting publique `GET /api/accounting/holds/{holdId}` este sprint. Absorbe la historia #143 de Taiga. 4 tareas, 20 h, 8 puntos, Could (opcional).

## [G11] — Reconciliación de compras

---

## Descripción (Como / Quiero / Para)

- **Como**: administrador de la plataforma
- **Quiero**: que Mercado reconcilie las compras cuyo estado no coincide con el de su hold en Accounting
- **Para**: que no queden órdenes trabadas ni stock retenido y que la aplicación arranque con el transporte `kafka`

---

## Notas / Observaciones

- [ ] Reglas de negocio: ante INVALID_HOLD_STATE al confirmar, reconcileHoldStatus consulta el estado del hold: COMMITTED confirma la orden y RELEASED la cancela con HOLD_NOT_SETTLED ([[Orden de compra]]). Las órdenes que quedan en CREATED porque falló requestHold deben reconciliarse (gap 20, reportado sin verificar).
- [ ] Validaciones: el cliente real consulta GET /api/accounting/holds/{holdId} y debe interpretar los estados de hold de Accounting; los estados exactos se confirman con su documentación al integrarlo.
- [ ] Datos obligatorios: holdId de la orden; URL base de Accounting por variable de entorno.
- [ ] Performance (tiempos, volumen, límites): el job corre con la periodicidad actual (BankHoldReconciliationJob, a revisar) y procesa lotes acotados para no saturar a Accounting.
- [ ] Seguridad (roles, permisos, datos sensibles): llamada servicio a servicio con el token que acuerde Accounting.
- [ ] Accesibilidad (WCAG/teclado/lectores): No aplica.
- [ ] Otros: hoy, con transporte kafka, OrderConfirmationServiceImpl y BankHoldReconciliationServiceImpl fallan al arrancar porque no hay bean BankHoldQueryClient (gap 1, no verificado ejecutando). La propiedad bank-hold.reconciliation.enabled está en false. Solo se ejecuta si Accounting avisa que integró la consulta.

---

## Criterios de Aceptación (CA)

- [x] **CA1**: con market.messaging.transport=kafka la aplicación arranca sin errores de bean BankHoldQueryClient.
- [x] **CA2**: con bank-hold.reconciliation.enabled=true, una orden con hold COMMITTED en Accounting pasa a CONFIRMED y una con hold RELEASED pasa a CANCELLED con HOLD_NOT_SETTLED y retiene la unidad, sin devolverla al stock ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]]).
- [ ] **CA3**: una orden en CREATED sin holdId por más del umbral configurado se reintenta o se cancela, y no queda trabada.
- [x] **CA4**: el cliente responde de forma controlada (sin romper el job) ante 404, 5xx y timeout de Accounting.

---

## BDD (mínimo 3 escenarios)

**Característica:** Reconciliación de compras con el estado del hold

**Escenario 1**  

- **Dado**: una orden en `ITEM_PROVISIONED` cuya confirmación fue rechazada con `INVALID_HOLD_STATE` y un hold `COMMITTED` en Accounting
- **Cuando**: el job de reconciliación consulta `GET /api/accounting/holds/{holdId}`
- **Entonces**: la orden pasa a `CONFIRMED`

**Escenario 2**  

- **Dado**: una orden en `ITEM_PROVISIONED` con un hold `RELEASED` en Accounting
- **Cuando**: corre la reconciliación
- **Entonces**: la orden queda `CANCELLED` con `cancellationReason` `HOLD_NOT_SETTLED` y la unidad queda retenida ([[DEC-019 - La unidad de una compra HOLD_NOT_SETTLED queda retenida]])

**Escenario 3**  

- **Dado**: una orden en `CREATED` porque el comando de hold nunca salió
- **Cuando**: pasa el umbral de espera
- **Entonces**: la reconciliación la reintenta o la cancela y el estudiante ve el estado final en `GET /api/market/orders/{orderId}`

---

## Prototipo

- **Capturas**: No aplica (historia de backend)
- **URL Figma**: No aplica
- **Storybook**: No aplica
- **Mock API / Swagger**: `GET /api/accounting/holds/{holdId}` (Accounting), `GET /api/market/orders/{orderId}`

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 8
- **Prioridad (MoSCoW / Numérica)**: Could

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|8|Could|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado y Accounting.
- Módulos afectados: `clients/impl/MockBankHoldQueryClient.java` (nuevo cliente real), `services/impl/BankHoldReconciliationServiceImpl.java`, `OrderConfirmationServiceImpl.java`, `job/BankHoldReconciliationJob.java`.
- Otros equipos / aprobaciones: Accounting debe publicar y avisar la integración de la consulta de hold ([[Integración con Accounting]], [[DEC-009 - Contrato de holds e ítems según Accounting]]).
- Impacto en datos / migraciones: ninguno previsto.
- Riesgos y mitigación (opcional): si Accounting no publica la consulta, la historia no entra en el sprint; el arranque con `kafka` puede resolverse aparte con un cliente que devuelva "desconocido". Se solapa con la tarea 1 de [[S2-05 - Robustez de la compra]].

Relación: [[Estado actual del código]] (gaps 1, 3 y 20), [[Roadmap de trabajo]] (P0 3), [[Épica 137 - Compra directa]].

---

## Tareas

### T01 - Implementar el BankHoldQueryClient real

**Objetivo:** Consultar a Accounting el estado de un hold.

- Cliente REST de `GET /api/accounting/holds/{holdId}`, activo con transporte `kafka`
- Corrige el error de arranque por bean ausente
- URL base por variable de entorno
- Hecho cuando: con `market.messaging.transport=kafka` la aplicación arranca y el cliente consulta el hold
- **Estado:** Resuelta en `develop` (PR #116, `e456c55f`, issue #114). Se implementó `HttpBankHoldQueryClient` con `@ConditionalOnProperty(name = "market.messaging.transport", havingValue = "kafka")`, consultando `GET /api/accounting/holds/{holdId}` mediante `gatewayRestClient` con token dinámico (`IdentityServiceTokenClient`), alias `camelCase` y `snake_case` (`@JsonAlias`), y timeouts configurables.

Estimación: 6 h

### T02 - Activar el job de reconciliación

**Objetivo:** Poner en marcha la reconciliación de holds.

- Habilitar `bank-hold.reconciliation.enabled`
- Revisar periodicidad y tamaño de lote en `BankHoldReconciliationJob`
- Configuración por entorno
- Hecho cuando: el job corre con la periodicidad configurada y procesa lotes acotados
- **Estado:** Resuelta en `develop` (PR #116, `e456c55f`, issue #114). Configurado `bank-hold.reconciliation.enabled=${BANK_HOLD_RECONCILIATION_ENABLED:false}` en `application.properties`, `application-docker.properties` y `application-prod.properties` para activarse por entorno en la plataforma.

Estimación: 4 h

### T03 - Resolver las órdenes trabadas en CREATED

**Objetivo:** Evitar que queden órdenes sin hold indefinidamente.

- Detectar órdenes sin `holdId` tras un umbral configurable
- Reintentarlas o cancelarlas
- Liberar el stock al cancelar
- Hecho cuando: una orden en `CREATED` sin hold pasado el umbral se reintenta o se cancela y no queda trabada

Estimación: 6 h

### T04 - Probar el cliente y la reconciliación

**Objetivo:** Cubrir con pruebas los resultados posibles de Accounting.

- Casos `COMMITTED` y `RELEASED`
- Casos 404, 5xx y timeout sin romper el job
- Hecho cuando: las pruebas de los cinco casos pasan en verde
- **Estado:** Resuelta en `develop` (PR #116, `e456c55f`, issue #114). Cobertura completa en `HttpBankHoldQueryClientTest`, `IdentityServiceTokenClientTest`, `BankHoldReconciliationServiceImplTest` y `AccountingContractTest`.

Estimación: 4 h
