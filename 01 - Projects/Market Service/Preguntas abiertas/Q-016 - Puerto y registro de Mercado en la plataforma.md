---
tipo: pregunta
estado: archivado
verificado_contra: equipo-plataforma@2026-10-01
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, plataforma, gateway]
---
# Q-016 - Puerto y registro de Mercado en la plataforma

> ¿En qué puerto corre Mercado y está realmente registrado en el gateway y en el compose de la plataforma? **Resuelta como hecho verificado** (sin decisión): puerto 8100, registrado en la plataforma. La discrepancia venía de un clon local desactualizado.

## Qué se contradecía
| Tema | Posturas | Dónde aparecía |
|---|---|---|
| Puerto | 8084 (aplicación, gestión 8085) / 8092 (registro de servicios del clon local de compose) / 8100 (documentación del equipo) | Código, `registry/services.yml` local, documentación del equipo |
| Compose de microservicios | `micros.yml` podía no incluir a Mercado | Repositorio de compose del sistema |
| Allowlist del gateway | `GATEWAY_ALLOWLIST` por defecto solo `users-service` | Gateway |
| Documentación de la API | La lista de Swagger del gateway omite a Mercado | Gateway |

## Resolución
Cerrada el 2026-10-01 como **hecho verificado**, sin `DEC`. Evidencia contra el repositorio upstream `tpi-system-compose` (rama `main`):

| Hecho | Evidencia |
|---|---|
| Puerto de `market-service` | **8100**, equipo `market`, base `postgres`, ofrece `market.catalog.read` (`registry/services.yml`) |
| Puerto de gestión | PUERTO + 1 = **8101** (`.tpi/platform/up.sh`: `MGMT_PORT=$((PORT + 1))`) |
| Allowlist del gateway | `market-service` **sí está** en `GATEWAY_ALLOWLIST` del `platform.env` generado |
| Red | El `micros.yml` generado incluye la red `tpi-market` |
| Clon local | `tpi-system-compose` local está **96 commits atrás** y todavía dice 8092 y equipo `g09`: está desactualizado; la documentación del equipo que dice 8100 es correcta |
| Puertos de `tpi-market` | `server.port=${SERVER_PORT:8084}` y gestión 8085 son solo valores por defecto de desarrollo local. En la plataforma, `.tpi/platform/docker-compose.yml` define `SERVER_PORT=${PORT}` desde `.env`, por lo que `.env` debe tener `PORT=8100` |

## Qué falta (tareas)
- Hacer `pull` de `tpi-system-compose`.
- Verificar que `.tpi/platform/.env` tenga `PORT=8100`.

Quedan registradas en [[Roadmap de trabajo]]. Detalle en [[Mapa de servicios]] y [[Estado actual del código]]; relación con el gateway en [[Gateway e identidad]].

## Pendiente menor
No se verificó en esta resolución la lista de Swagger del gateway, que según la fuente anterior omite a Mercado. No afecta el enrutamiento de `/api/market/**`.
