---
tipo: integracion
estado: vigente
verificado_contra: equipo-users@2026-10-01
actualizado: 2026-10-01
tags: [mercado, integracion, users]
---
# Integración con Users

> Users emite el JWT con el que se identifica a quien llama a Mercado; Mercado no lo consume directamente, solo recibe cabeceras del gateway.

## Equipo y responsabilidad
`users-service` (Tema 01): identidad y autenticación, MySQL con Flyway, Redis y Kafka. Puerto 8082 (8083). Rutas `/api/users/public` y `/api/users`. Roles ADMIN, GESTOR, PROFESSOR, STUDENT. El catálogo de ámbitos incluye `market.catalog.read:market-service`.

## Cómo nos comunicamos
| Dirección | Mecanismo | Mensaje / endpoint | Para qué |
|---|---|---|---|
| Users a gateway | HTTP | `/.well-known/jwks.json` | Claves para validar JWT |
| Gateway a Mercado | Cabeceras | `X-User-Id`, `X-User-Roles`, etc. | Identidad ([[Gateway e identidad]]) |
| Users a todos | Kafka `users.events` (clave `userId`) | `STUDENT_REGISTERED`, `ACCOUNT_DEACTIVATED` | Hechos de cuenta |

El envelope de Users usa `eventId`, `eventType`, `eventVersion`, `timestamp`, `producer`, `payload`.

## Estado actual en el código
Mercado no es consumidor listado de `users.events`. `JwksRefreshJob` consulta `app.jwks-url` como canario. No hay validación de JWT.

## Acuerdos pendientes
Roles `MS` y `GESTOR`, cabecera oficial `X-User-Roles` ([[DEC-006 - Roles y permisos según el código y los headers del gateway]]); si Mercado debería reaccionar a `ACCOUNT_DEACTIVATED`.

## Relacionado
[[Mapa de servicios]].
