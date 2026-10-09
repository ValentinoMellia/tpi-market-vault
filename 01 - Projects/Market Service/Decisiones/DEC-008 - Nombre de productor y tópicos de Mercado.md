---
tipo: decision
estado: vigente
verificado_contra: codigo@2485d8cf
actualizado: 2026-10-09
tags: [mercado, decision, kafka, topicos, convenciones]
---
# DEC-008 - Nombre de productor y tópicos de Mercado

> El productor es `market-service` en todos los mensajes. Mercado publica en `market.events` y habla con Accounting por `accounting.events`: un dominio, un tópico. Los nombres de evento siguen en inglés `SNAKE_CASE`.

## Contexto
Circulaban varias convenciones: productor `market-service`, `tema-09-mercado` y `team-09-market`; tópicos `accounting.holds.*`, `inventory.items.*` y `market.orders.events` que la plataforma nunca aprovisionó; estilo `SNAKE_CASE` contra `HYPHEN-CASE`; eventos en español contra inglés. Pregunta de origen: [[Q-006 - Naming de eventos y topics]].

## Decisión
Decidida por el líder del equipo de Mercado el 2026-10-01:

| Tema | Decisión |
|---|---|
| Productor | `market-service` en **todos** los mensajes |
| Tópico de Mercado | `market.events` (reemplaza a `market.orders.events`) |
| Tópico hacia y desde Accounting | `accounting.events` (reemplaza a `accounting.holds.commands` y `accounting.holds.events`) |
| Regla | Un dominio = un tópico `<dominio>.events`, con su `.DLT` ([[Eventos y Kafka]]) |
| Nombres de evento | Inglés `SNAKE_CASE`, como en el contrato de Accounting |

## Alternativas descartadas
- **Mantener los nombres del código**: imposible, los tópicos no están aprovisionados.
- **`HYPHEN-CASE` del estándar de Notificaciones**: Accounting ya usa `SNAKE_CASE` y el contrato con Accounting es el que condiciona a Mercado.
- **Eventos en español** (`CURSO_ARCHIVADO`, `OFERTA_SUPERADA`, `SUBASTA_ADJUDICADA`): se usan nombres en inglés.

## Consecuencias
- **Tarea de código (nombre del productor)**: reemplazar `tema-09-mercado`, usado en `PURCHASE_CONFIRMED`, por `market-service` (`configs/MessagingProperties.java`).
- **Tarea de código (tópicos)**: apuntar los tópicos con las variables de entorno `MARKET_MESSAGING_TOPIC_ACCOUNTING_HOLDS_COMMANDS` y `_EVENTS` a `accounting.events`, y publicar en `market.events`. Con un tópico compartido, verificar antes que el listener ignora los comandos propios sin enviarlos a DLT.
- Los eventos de `inventory.items.*` desaparecen: el inventario es de Accounting ([[DEC-001 - Accounting es dueño del inventario]]).
- Notificaciones publica su estándar en `HYPHEN-CASE`; hay que informarles de esta decisión para los eventos de Mercado ([[Integración con Notificaciones]]).
- Resuelve la recomendación D7 del taller ([[Taller de decisiones]]).

## Estado de implementación (2026-10-09)
Nota de seguimiento, verificada contra `develop` en `2485d8cf`; no cambia la decisión.

- **Tópicos, hecho como valores por defecto** (PR #88, US-5193): `accounting-holds-commands` y `accounting-holds-events` valen `accounting.events`, `market-events` vale `market.events` y `order-events` toma por defecto el de `market-events` (`src/main/resources/application.properties:46-51`, `configs/MessagingProperties.java`). Las variables `MARKET_MESSAGING_TOPIC_*` siguen permitiendo cambiarlos y el compose las pasa (`.compose/docker-compose.yml`, `.compose/.env.example`). Los tópicos `inventory.items.*` siguen configurados.
- **Verificación del tópico compartido, cerrada** (PR #102, US-5193 T03, `a4e6ac76`): tras el PR #88 los comandos propios `HOLD_CREATE_REQUESTED` y `HOLD_RELEASE_REQUESTED` iban a `accounting.events.DLT`. Desde `a4e6ac76` el listener descarta por `producer` antes de parsear, con 0 mensajes en DLT y 0 excepciones ([[Eventos y Kafka]]).
- **Productor, resuelto** (PR #102, US-5193 T04, `1e458bb0`, merge `2485d8cf`): `MessagingProperties.java` fija `producer = "market-service"` por defecto, configurable mediante `market.messaging.producer` (`MARKET_MESSAGING_PRODUCER` en `.compose/.env.example` y `docker-compose.yml`). `OrderConfirmationServiceImpl.java` usa `resolveProducer()`, eliminando `tema-09-mercado` en `PURCHASE_CONFIRMED` e `ITEM_CONFIRMED`. No queda ninguna aparición de `tema-09-mercado` en el código.

## Notas afectadas
[[Eventos y Kafka]], [[Mapa de servicios]], [[Integración con Accounting]], [[Integración con Notificaciones]], [[Estado actual del código]], [[Integración con Backoffice]], [[Integración con Cursos]], [[Roadmap de trabajo]], [[Taller de decisiones]], [[Decisiones - Índice]].
