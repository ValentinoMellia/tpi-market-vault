---
tipo: integracion
estado: en-disputa
verificado_contra: equipo-plataforma@2026-10-01
actualizado: 2026-10-03
tags: [plataforma, gateway, seguridad]
---
# Gateway e identidad

> Cómo llegan las peticiones a Mercado: el gateway valida el JWT y entrega la identidad como cabeceras; Mercado confía en ellas porque su puerto no está publicado. Cómo se leen los roles está en disputa en [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]]; qué puede hacer un servicio con `MS` en las rutas de estado de oferta lo fija [[DEC-017 - Servicios con MS en las rutas de estado de oferta]].

## Camino de una petición

Verificado contra el gateway y el compose de la plataforma:

```mermaid
flowchart LR
    B[Navegador] --> N["nginx :3000"]
    N --> G["Gateway :8080"]
    G -->|"lb:// vía Eureka"| M[Mercado]
```

1. nginx (`:3000`, timeout de 30 s) recibe la petición y la pasa al gateway.
2. El gateway (`:8080`, timeout de 25 s) valida el JWT con JWKS y consulta la sesión en Redis.
3. Elimina las cabeceras `X-*` reservadas y reinyecta `X-User-Id`, `X-User-Roles` y `X-Principal-Type` (y las de servicio).
4. Enruta con `lb://` vía Eureka al microservicio.

Las llamadas **de microservicio a microservicio también pasan por el gateway**, con un token de servicio (`aud` y rol `MS`). Cada microservicio tiene su propia red; no existe una red compartida entre ellos. Una ruta fuera de `GATEWAY_ALLOWLIST` responde 404.

## Cómo funciona el gateway

`tpi-api-gateway` es un Spring Cloud Gateway (WebFlux) en el puerto 8080 (gestión 8081), alcanzable solo desde nginx por la red `tpi-edge`.

- Valida el JWT contra `JWKS_URI=http://users-service:8082/.well-known/jwks.json` con emisor `users-service`.
- `AllowlistRouteLocator` crea la ruta `Path=/api/{name}/**` por cada servicio permitido (`name` es el id del servicio sin `-service`), con `lb://` vía Eureka. Para Mercado resulta `/api/market/**`, coherente con el código ([[DEC-005 - Endpoints y prefijos según el código]]); para Accounting, `/api/accounting/**`.
- `GATEWAY_ALLOWLIST` vale por defecto `users-service`; el compose lo sobrescribe y, según el `platform.env` generado upstream, incluye a `market-service` ([[Q-016 - Puerto y registro de Mercado en la plataforma]]).
- `IdentityPropagationFilter` elimina las cinco cabeceras reservadas y las reinyecta desde el JWT.
- Extras: circuit breaker por ruta, bulkhead de 64, reintento solo para GET, invalidación de sesión con Redis y limitación de tasa. La lista de Swagger del gateway omite a Mercado.

## Las cinco cabeceras de identidad

| Cabecera | Contenido |
|---|---|
| `X-Principal-Type` | `user` o `service` |
| `X-User-Id` | Identificador del usuario |
| `X-User-Roles` | Roles del usuario |
| `X-Service-Id` | Identificador del servicio llamador |
| `X-Service-Scopes` | Ámbitos (scopes) del servicio |

El token de la persona viaja en la cookie `fu_at`; el token de servicio, en `Authorization`, y el micro no lo valida.

## Cómo las recibe Mercado

`GatewayIdentityFilter` (`src/main/java/ar/edu/utn/frc/tup/p4/configs/filters/GatewayIdentityFilter.java`) arma la autenticación solo con esas cabeceras, sin validar JWT. Para usuarios: `X-Principal-Type=user`, `X-User-Id` y cada rol de `X-User-Roles` como `ROLE_<rol>`. Para servicios: `X-Service-Id` y `X-Service-Scopes`; el ámbito `MS` se convierte en `ROLE_MS` y el resto queda como autoridad simple. Se vuelve a ejecutar en el despacho asíncrono (necesario para [[SSE]]). Roles: STUDENT, PROFESSOR, ADMIN, GESTOR, MS.

**La cabecera `X-Roles`.** Verificado contra `codigo@276af52`: el filtro **ya no** la lee (la sacó el change `gateway-mesh-integration`), pero cuatro controladores todavía la usan como respaldo cuando falta `X-User-Roles` (`CourseCatalogManageController`, `CatalogOfferController`, `StorefrontCatalogController` y `CourseCatalogSummaryController`, dos de ellos con valor por defecto `ROLE_STUDENT`). Ningún cliente la envía: el gateway la elimina y el frontend no la usa.

**Cambio en revisión: PR #86 de `tpi-market`** (T01 de [[S2-04 - Seguridad]], todavía sin mergear). Introduce `models/enums/UserRole` como único lector de `X-User-Roles` para el filtro y para los services: compara cada rol exacto y con mayúsculas, saca un solo `ROLE_` inicial y descarta lo que no sea uno de los cinco roles. También quita `X-Roles` de los controladores. Hoy el código prefija sin condiciones (`ROLE_PROFESSOR` da `ROLE_ROLE_PROFESSOR`) y convierte cualquier texto en autoridad; si eso debe cambiar es lo que pregunta [[Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad]].

## Autorización en dos capas

1. `@PreAuthorize` por endpoint (por ejemplo `hasRole('MS') and hasAuthority('market.catalog.read')`).
2. Regla de negocio: inscripción del estudiante o asignación del profesor, con los clientes de [[Integración con Cursos]].

Las dos capas no leen igual la identidad: la primera usa las autoridades del filtro y la segunda la cadena de `X-User-Roles`. Por eso un servicio con ámbito `MS` pasa la primera y la segunda lo trata como si no tuviera roles: en `develop` (`codigo@276af52`), `PATCH /offers/{id}/status` lo rechaza y la ruta de estado del curso lo deja pasar sin chequeo.

**Cambio en revisión: PR #92 de `tpi-market`** (T02 de [[S2-04 - Seguridad]], apilado sobre el PR #86). Las dos rutas de estado de oferta pasan a leer el principal autenticado (`Authentication`, roles con `UserRole.fromAuthorities`) en lugar de las cabeceras, así que un servicio con `MS` es administrativo en ambas, y ningún chequeo de rol se saltea con la cabecera vacía. Lo registra [[DEC-017 - Servicios con MS en las rutas de estado de oferta]]; las demás rutas siguen leyendo `X-User-Roles`.

## Puntos débiles

- Si el puerto de Mercado se publicara, cualquiera podría falsificar cabeceras.
- Algunos servicios leen el rol con `contains()`, así que un valor como `PROFESSOR, SYSTEMS` cuenta como `MS`; el chequeo de profesor se omite con cabecera vacía; hay usuario por defecto `usr-student-001` ([[DEC-006 - Roles y permisos según el código y los headers del gateway]] fija el modelo de roles; estos defectos siguen pendientes en `develop`, [[Estado actual del código]]). El PR #86 corrige el primero y el PR #92 el segundo (los dos en revisión); el usuario por defecto es la T03 de [[S2-04 - Seguridad]].
- Un servicio cuyo `X-Service-Scopes` traiga un valor con forma de rol (`ROLE_ADMIN`) recibe esa autoridad tal cual. Depende de que el gateway solo emita ámbitos válidos; queda para la T04 de [[S2-04 - Seguridad]].
- `JwksRefreshJob` consulta el JWKS cada 5 minutos solo como canario (`/jwks-status`).
- El timeout del gateway (25 s) es menor que el de nginx (30 s); las peticiones largas se cortan primero en el gateway.

Ver [[Mapa de servicios]], [[Integración con Users]] e [[Integración con Accounting]].
