---
tipo: decision
estado: vigente
verificado_contra: codigo@b5c2ee30
actualizado: 2026-10-17
tags: [mercado, decision, cofres, alcance, sprint-3]
---
# DEC-035 - Cofres en dos fases

> Los cofres se construyen en dos fases. La primera solo con premios de ítem (equipamiento y vidas), que no necesita nada nuevo de otros equipos. La segunda suma monedas y XP cuando Accounting y Roadmap tengan su parte construida. En el Sprint 3 no se construye nada: las historias quedan listadas acá y se cargan en Taiga en la próxima planning.

## Contexto
La US-8400 cierra con su criterio CA3: decidir si los cofres avanzan, se acotan o se difieren, con historias técnicas solo para el alcance aprobado. Es la task T03 #8428.

Las decisiones anteriores ya no dejan nada abierto:

- [[DEC-031 - Cofres configurables con ítems, monedas y XP]] define qué es un cofre, con la aprobación del PO.
- [[DEC-032 - Sorteo y reglas de configuración de los cofres]] define quién sortea y las reglas de configuración.
- [[DEC-033 - Acreditación de XP de cofre en Roadmap]] y [[DEC-034 - Acreditación de premios de cofre en Accounting]] acuerdan cómo llega cada clase de premio.

Lo que falta es construcción. Los premios de equipamiento y de vidas usan mensajes que ya existen (`ITEM_CONFIRMED` y `LIFE_PURCHASE_CONFIRMED`). Los de monedas y XP necesitan que Accounting construya el movimiento de crédito y que Roadmap agregue la fuente de XP `MARKET_CHEST`.

En el código de `tpi-market` no hay nada de cofres: `models/enums/ItemType.java` tiene solo `SHIELD`, `BOOST_XP`, `BOOST_COINS` y `LIFE`, y `entities/OrderEntity.java` guarda una sola oferta. Como referencia de tamaño, la [[Meta colectiva]] es la funcionalidad más parecida y llevó 19 changes de OpenSpec y unas 16 PRs en el Sprint 3. El Sprint 3 termina el 2026-10-25 y en Taiga todavía no hay Sprint 4 para G11.

El equipo de Mercado (Patricio Fernandez) lo decidió el 2026-10-17, a partir del change `us-8400-t03-chest-go-decision` de `tpi-market`. No pasa por el PO: lo que tocaba el PRD ya lo aprobó en DEC-031, y esto es alcance propio de Mercado.

## Decisión
- **Se acota en dos fases.**
  - **Fase 1, premios de ítem:** equipamiento y vidas, tomados de las ofertas del curso. Abarca el cofre completo: modelo, configuración del profesor, vista del alumno, compra con sorteo y entrega.
  - **Fase 2, premios de monedas y XP:** arranca cuando Accounting tenga construido el crédito de monedas por cofre (DEC-034) y Roadmap la fuente `MARKET_CHEST` (DEC-033). Hasta entonces el profesor no puede cargar premios de monedas ni de XP.
- **DEC-031 sigue vigente.** Las excepciones a RF-INT-01 y RF-INT-02 están aprobadas, pero no se usan hasta la fase 2.
- **Nada se construye en el Sprint 3.** Las historias se cargan en Taiga en la próxima planning de G11, con sus puntos y responsables.
- **El interruptor «mostrar probabilidades» viene encendido por defecto.** Para un premio al azar que se paga, mostrar las chances es lo justo. Además, la pantalla del alumno de la task #10426 ya muestra «Qué puede tocar» con probabilidades. Cierra el punto que DEC-032 dejó abierto.
- **La pantalla del profesor admite cualquier cantidad de premios sin scroll de página en escritorio.** El patrón (lista paginada, panel con scroll propio u otro) lo elige la historia de frontend H4.
- **El frontend no sortea.** El premio que muestra la ruleta es el que guardó la orden (DEC-032). La maqueta de la #10426 sortea en el navegador con datos de prueba; eso se reemplaza al conectarla al backend (H5).

### Historias técnicas
Son títulos de trabajo. Los criterios de aceptación, el BDD, los puntos y la prioridad se escriben al cargarlas, con la plantilla `Taiga - Historia de usuario`.

**Fase 1, premios de ítem**

| # | Historia | Repositorio | Contenido |
|---|---|---|---|
| H1 | El profesor crea y gestiona cofres | `tpi-market` | Entidades del cofre y sus premios, con el script SQL manual. Crear, editar, publicar y desactivar. Los premios de oferta copian su configuración sin consumir stock, como ya hace la meta colectiva en `services/impl/GoalRewardItemResolver.java`. Rareza sugerida por valor ÷ precio y editable. Pesos editables (60 / 25 / 12 / 3 por defecto). Interruptor de probabilidades encendido por defecto. Límite opcional por alumno con su período. Avisos que no bloquean, entre ellos el de las vidas para un alumno en el tope. |
| H2 | El alumno ve los cofres del curso | `tpi-market` | Listado y detalle de los cofres publicados. Muestra cada premio con su rareza y, si el interruptor está encendido, su probabilidad. Acceso como en la compra directa: alumno del curso y mercado habilitado. |
| H3 | El alumno compra un cofre | `tpi-market` | Al crear la orden se sortea la rareza y después el premio, y el resultado queda guardado en la orden. Antes, se controla el límite por alumno. El hold es por el precio del cofre. La entrega sigue el flujo actual de equipamiento o de vidas. Un reintento o una conciliación leen el resultado guardado y no vuelven a sortear. |
| H4 | Asistente «Armar cofre» del profesor | `2026-PIV-TPI-FE` | Parte de la maqueta «Armar cofre», rediseñada para cualquier cantidad de premios. Incluye pesos, interruptor, límite y avisos. |
| H5 | Conectar la pantalla de cofres del alumno al backend | `2026-PIV-TPI-FE` | Conecta la #10426 con H2 y H3. Se muestra el premio guardado en la orden. La apertura termina cuando la orden llega a `CONFIRMED` (SSE `GET /orders/stream/{orderId}`). |

**Fase 2, monedas y XP**

| # | Historia | Repositorio | Condición de inicio |
|---|---|---|---|
| H6 | Premios de monedas y XP en los cofres | `tpi-market` y `2026-PIV-TPI-FE` | Accounting tiene construido el crédito de monedas por cofre y Roadmap la fuente `MARKET_CHEST`. Suma las dos clases de premio al modelo y al asistente, con sus avisos (DEC-031). Agrega dos eventos del outbox, después del débito y sin esperar respuesta (DEC-033, DEC-034). Hay que vigilar `market.events.DLT`. La pantalla del alumno avisa que las monedas o el XP llegan en unos segundos. |

Lo que construyen Accounting (el movimiento de monedas en `tpi-accounting`) y Roadmap (la fuente de XP en `tpi-roadmap`) es de esos equipos y no es una historia de Mercado.

## Alternativas descartadas
- **Avanzar con las cuatro clases de premio a la vez:** la parte de monedas y XP quedaría bloqueada esperando a dos equipos. La fase 1 depende solo de Mercado.
- **Diferir:** los acuerdos de T01 y T02 se enfriarían, y la pantalla del alumno de la #10426 quedaría sin backend.
- **Interruptor de probabilidades apagado por defecto:** esconde las chances de un premio pago salvo que el profesor las active.
- **Fijar ahora el patrón de la pantalla del profesor:** es una decisión de diseño de frontend y se toma mejor en H4, con la maqueta a la vista.

## Consecuencias
- **US-8400.** Con esta decisión se cumple el CA3. La US se cierra cuando estén cerradas la T02 #8427 y la T03 #8428.
- **Código.** Nada cambia hasta que se carguen H1 a H3. `ItemType`, `OrderEntity` y la saga se tocan recién en esas historias.
- **Frontend.** La #10426 (US-10339) puede seguir con datos de prueba. Tiene que saber que el sorteo no es del frontend.
- **Si la fase 2 nunca arranca,** porque Accounting o Roadmap no construyen su parte, la fase 1 igual entrega un cofre que funciona.
- **Fuera de alcance:** tipos de ítem nuevos (`HINT`, `AI_ASSIST` y los demás de [[Cofres y nuevos ítems]]), que no están aprobados; los cosméticos, que son de la US-8401, y `BOOST_COINS` frente a RF-INT-01, que quedó afuera en la T01.

## Notas afectadas
[[DEC-031 - Cofres configurables con ítems, monedas y XP]], [[DEC-032 - Sorteo y reglas de configuración de los cofres]], [[Cofres y nuevos ítems]], [[Decisiones - Índice]], [[Roadmap de trabajo]].
