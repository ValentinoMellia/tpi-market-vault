---
tipo: pregunta
estado: en-disputa
verificado_contra: codigo@276af52
actualizado: 2026-10-03
tags: [mercado, pregunta-abierta, seguridad, roles]
---
# Q-020 - Roles desconocidos y prefijo ROLE_ en la identidad

> ¿Mercado debe convertir en autoridad cualquier texto que llegue en `X-User-Roles`, o solo los cinco roles de [[DEC-006 - Roles y permisos según el código y los headers del gateway]]? ¿Y un rol que ya trae `ROLE_` debe quedar como `ROLE_ROLE_<rol>`? El PR #86 de `tpi-market` (T01 de [[S2-04 - Seguridad]]) propone "solo los cinco" y "sacar un `ROLE_` y después prefijar"; falta la confirmación del equipo.

## Qué se contradice
| Postura | Qué dice | Dónde aparecía |
|---|---|---|
| Código actual (`develop@276af52`) | `GatewayIdentityFilter.rolesOf()` convierte cada parte de `X-User-Roles` en `"ROLE_" + parte`, sin condiciones: `FOO` da `ROLE_FOO` y `ROLE_PROFESSOR` da `ROLE_ROLE_PROFESSOR`, que `hasAnyRole('PROFESSOR')` rechaza con 403 | `src/main/java/ar/edu/utn/frc/tup/p4/configs/filters/GatewayIdentityFilter.java` |
| Spec del change `gateway-mesh-integration` | Prefijo `ROLE_` incondicional (decisión de ese change, no registrada como `DEC`) | `openspec/changes/gateway-mesh-integration/` en `tpi-market` |
| Services y Taiga | Los services aceptaban el rol "con y sin prefijo `ROLE_`"; la tarea #5215 lo pide así y el escenario 4 de [[S2-04 - Seguridad]] espera 200 con `ROLE_PROFESSOR` | Tarea #5215, US-5214 |
| PR #86 de `tpi-market` (en revisión) | Un único parser, `UserRole.fromHeader`, para el filtro y los services: saca **un** `ROLE_` inicial, compara exacto y con mayúsculas, y descarta lo que no sea uno de los cinco roles | `models/enums/UserRole.java` en la rama `feature/us-5214-t01-strict-role-parsing` |

## Qué hace hoy el código
En `develop` conviven dos lecturas de la misma cabecera: el filtro prefija todo sin condiciones y los services comparaban por subcadena con `contains()` (el gap 12 de [[Estado actual del código]]). Por eso las dos capas de [[Gateway e identidad]] podían decidir distinto: `ROLE_PROFESSOR` pasaba el service pero no `@PreAuthorize`, y `PROFESSOR, SYSTEMS` pasaba `@PreAuthorize` y el service lo trataba como `MS`.

## Opciones
1. **Solo los cinco roles y un `ROLE_` opcional (lo que hace el PR #86).** Ventajas: las dos capas leen igual; un rol inventado no llega a ser autoridad; cumple la tarea #5215 y el escenario 4. Desventajas: `/whoami` deja de mostrar roles desconocidos (sirve menos para diagnosticar qué mandó el gateway); un rol nuevo de la plataforma exige tocar el enum.
2. **Cualquier texto es autoridad, pero se normaliza el prefijo.** Ventajas: `/whoami` muestra todo. Desventajas: una autoridad como `ROLE_NOT_ADMIN` existe aunque nadie la use; el parser de los services y el del filtro vuelven a ser distintos.
3. **Dejar el prefijo incondicional.** Ventajas: no cambia nada. Desventajas: `ROLE_PROFESSOR` sigue cortado con 403 y contradice la tarea #5215.

## Recomendación
Opción 1. Valentino Mellia la revisó en el PR #86 (2026-10-03, sin bloqueantes) y pidió registrarla junto a [[DEC-006 - Roles y permisos según el código y los headers del gateway]].

## Quién decide / con qué equipo hay que hablar
El equipo de Mercado. Si se confirma, se agrega una sección de enmienda a DEC-006 en lugar de crear una decisión nueva. No hace falta hablar con el gateway: sigue enviando los roles sin prefijo.

## Resolución
Pendiente.
