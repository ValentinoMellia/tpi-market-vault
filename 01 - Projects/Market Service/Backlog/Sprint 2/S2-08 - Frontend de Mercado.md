---
tipo: historia
estado: borrador
verificado_contra: codigo@7528610
actualizado: 2026-10-02
tags: [mercado, backlog, sprint-2]
sprint: 2
taiga: "#5236"
puntos: 13
prioridad: Should
horas: 36
---
# S2-08 - Frontend de Mercado

> Pantallas del estudiante para la tienda: vitrina del curso, detalle de oferta, compra con idempotencia, estado de la compra en vivo por SSE, mis compras y manejo de errores `problem+json`. Lo desarrolla el equipo de Mercado. 6 tareas, 36 h, 13 puntos, Should.

## [G11] — Frontend de Mercado

---

## Descripción (Como / Quiero / Para)

- **Como**: estudiante inscripto en un curso
- **Quiero**: ver la tienda de mi curso, comprar un ítem y seguir el estado de mi compra
- **Para**: gastar mis monedas en ítems y saber enseguida si la compra se concretó

---

## Notas / Observaciones

- [ ] Reglas de negocio: la tienda es la de la cohorte (courseId); solo se muestran ofertas activas y no vencidas. El precio se congela al comprar (appliedPrice). Cada intento de compra lleva una idempotencyKey nueva generada por el cliente y se reutiliza en los reintentos del mismo intento ([[Idempotencia]]).
- [ ] Validaciones: el botón de compra se deshabilita mientras la orden está en proceso; se bloquea el doble clic. Se muestran los mensajes del campo detail de problem+json y la lista errors[] de validación ([[Errores de la API]]).
- [ ] Datos obligatorios: courseId, offerId, idempotencyKey, X-User-Id y X-User-Roles (los inyecta el gateway).
- [ ] Performance (tiempos, volumen, límites): vitrina paginada o con carga inicial menor a 2 s con unas 50 ofertas (a medir); lista "mis compras" paginada (page, size).
- [ ] Seguridad (roles, permisos, datos sensibles): el frontend no decide permisos; solo muestra lo que devuelve la API. No se muestran órdenes ajenas (la API responde 404).
- [ ] Accesibilidad (WCAG/teclado/lectores): navegación por teclado en tarjetas y botones, estados de compra anunciados con aria-live, contraste AA y no depender solo del color para los estados.
- [ ] Otros: hoy GET /api/market/orders/stream/{orderId} envía un único evento con el estado actual y cierra ([[SSE]]); el seguimiento "en vivo" real puede requerir que el backend emita los cambios de estado hasta un estado terminal (historia #140 parcial, [[Épica 137 - Compra directa]]). El spike [[S2-09d - SPIKE SSE en el frontend]] confirma el alcance; si hace falta trabajo de backend, se carga como historia aparte. Mientras tanto, el frontend vuelve a consultar GET /api/market/orders/{orderId} si la conexión cierra sin estado terminal.

---

## Criterios de Aceptación (CA)

- [ ] **CA1**: la vitrina lista las ofertas de GET /api/market/courses/{courseId}/catalog con nombre, descripción, precio y stock disponible, y permite filtrar por itemType.
- [ ] **CA2**: al comprar se envía POST /api/market/courses/{courseId}/orders con {offerId, idempotencyKey} una sola vez por intento; un doble clic no genera dos órdenes.
- [ ] **CA3**: tras el 202, la pantalla muestra el estado PROCESSING y se actualiza hasta un estado terminal (CONFIRMED, REJECTED_INSUFFICIENT_FUNDS, CANCELLED o EXPIRED) sin recargar la página.
- [ ] **CA4**: "Mis compras" muestra las órdenes propias paginadas de GET /api/market/orders?courseId&page&size con su estado.
- [ ] **CA5**: cada error problem+json (403 student-not-enrolled, 409 catalog-offer-out-of-stock, 409 catalog-offer-expired, 409 idempotency-key-conflict, 503 course-service-unavailable) muestra un mensaje comprensible y no una pantalla en blanco.
- [ ] **Extras (opcional)**: pruebas de componentes con Storybook para los estados de la tarjeta de oferta.

---

## BDD (mínimo 3 escenarios)

**Característica:** Comprar un ítem en la tienda del curso

**Escenario 1**  

- **Dado**: un estudiante inscripto que abre la tienda de `COURSE_PROG4_2026`
- **Cuando**: la pantalla llama a `GET /api/market/courses/COURSE_PROG4_2026/catalog`
- **Entonces**: ve las ofertas activas y no vencidas con su precio y stock

**Escenario 2**  

- **Dado**: una oferta con stock y un estudiante con saldo
- **Cuando**: pulsa "Comprar"
- **Entonces**: el cliente envía `POST /api/market/courses/{courseId}/orders`, recibe 202 con `sseStreamUrl`, muestra "Procesando" y al llegar el estado `CONFIRMED` muestra "Compra confirmada"

**Escenario 3**  

- **Dado**: una oferta que se quedó sin stock
- **Cuando**: el estudiante intenta comprar
- **Entonces**: la API responde 409 `catalog-offer-out-of-stock` y la pantalla muestra "Sin stock" sin perder la lista

**Escenario 4**  

- **Dado**: un estudiante con compras previas
- **Cuando**: abre "Mis compras" y cambia a la segunda página
- **Entonces**: el cliente llama a `GET /api/market/orders?courseId={courseId}&page=1&size=10` y muestra las órdenes con su estado

---

## Prototipo

- **Capturas**: [PEGAR AQUÍ] (a definir)
- **URL Figma**: a definir
- **Storybook**: a definir
- **Mock API / Swagger**: `GET /api/market/courses/{courseId}/catalog`, `GET /api/market/courses/{courseId}/catalog/{itemId}`, `POST /api/market/courses/{courseId}/orders`, `GET /api/market/orders/stream/{orderId}`, `GET /api/market/orders?courseId&page&size`, `GET /api/market/orders/{orderId}`; Swagger en `/swagger-ui.html` del servicio

---

## Estimación / Prioridad

**Formato rápido**

- **Puntos (Fibonacci)**: 13
- **Prioridad (MoSCoW / Numérica)**: Should

**Formato tabla (opcional)**

|Puntos (Fibonacci)|Prioridad (MoSCoW / Numérica)|
|---|---|
|13|Should|

---

## Dependencias / Impactos

- Servicios involucrados: Mercado (API), gateway, frontend de la plataforma.
- Módulos afectados: módulo de Mercado del frontend (rutas, servicios HTTP, componentes de vitrina, detalle, compra y mis compras).
- Otros equipos / aprobaciones: Frontend debe confirmar el contrato HTTP y que `courseId` es la cohorte ([[DEC-005 - Endpoints y prefijos según el código]], [[Q-009 - Endpoints y prefijos]]).
- Impacto en datos / migraciones: ninguno.
- Riesgos y mitigación (opcional): el SSE actual no sigue el progreso; ver Notas. La pantalla de compra depende de [[S2-02 - Clientes reales de Cursos]] y [[S2-04 - Seguridad]] para funcionar sin identidad simulada, pero se puede desarrollar contra el servicio con cabeceras de desarrollo.

Relación: [[Orden de compra]], [[Oferta de catálogo]], [[Gateway e identidad]], [[Roadmap de trabajo]].

---

## Tareas

### T01 - Maquetar la vitrina con filtros por tipo y tarjeta de oferta

**Objetivo:** Mostrar las ofertas activas del curso con un filtro por tipo.

- Lista de ofertas de `GET /api/market/courses/{courseId}/catalog` con filtro por tipo
- Estados de carga y de lista vacía
- Navegación por teclado en tarjetas
- Hecho cuando: el estudiante ve solo ofertas activas, puede filtrar por tipo y ve los estados de carga y vacío

Estimación: 8 h

### T02 - Construir el detalle de la oferta

**Objetivo:** Mostrar la información necesaria para decidir la compra.

- Pantalla con precio, stock y configuración del ítem
- Acceso desde la tarjeta de la vitrina
- Hecho cuando: el detalle muestra precio, stock y configuración de la oferta elegida

Estimación: 4 h

### T03 - Implementar la compra con idempotencia

**Objetivo:** Permitir comprar sin duplicar órdenes.

- Botón de compra con `idempotencyKey` nueva por intento, reutilizada en los reintentos del mismo intento
- Bloquear el doble clic y deshabilitar el botón mientras la orden está en proceso
- Manejar la respuesta 202 de `POST /api/market/courses/{courseId}/orders`
- Hecho cuando: un doble clic crea una sola orden y la interfaz pasa a seguir su estado

Estimación: 6 h

### T04 - Mostrar el estado de la compra en vivo por SSE

**Objetivo:** Informar al estudiante el resultado de su compra sin recargar.

- Consumir `sseStreamUrl` (`GET /api/market/orders/stream/{orderId}`) con el patrón definido en el spike
- Respaldo por `GET /api/market/orders/{orderId}` si la conexión cierra sin estado terminal
- Estados terminales anunciados con `aria-live`
- Hecho cuando: la pantalla muestra el estado final de la compra aunque se corte la conexión

Estimación: 8 h

### T05 - Listar Mis compras

**Objetivo:** Permitir consultar el historial de órdenes propias.

- Lista paginada (`page`, `size`) con estado de cada orden
- Detalle de cada orden
- Hecho cuando: el estudiante ve solo sus órdenes, paginadas, con su estado

Estimación: 5 h

### T06 - Mostrar los errores problem+json

**Objetivo:** Traducir los errores de la API en mensajes comprensibles.

- Interceptor HTTP que lee `type`, `detail` y `errors[]`
- Mensajes para los casos 403, 404, 409 y 503
- Hecho cuando: cada uno de los cuatro casos muestra su mensaje y los errores de validación aparecen por campo

Estimación: 5 h
