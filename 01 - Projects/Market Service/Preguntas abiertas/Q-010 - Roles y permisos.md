---
tipo: pregunta
estado: archivado
verificado_contra: DEC-006
actualizado: 2026-10-01
tags: [mercado, pregunta-abierta, seguridad]
---
# Q-010 - Roles y permisos

> ¿Quién puede activar o desactivar una oferta y qué cabecera de roles es la oficial? La documentación actual ya coincide con el código. **Resuelta**: ver [[DEC-006 - Roles y permisos según el código y los headers del gateway]]. El parseo laxo de roles sigue como defecto a corregir.

## Qué se contradice
| Tema | Posturas | Dónde aparecía |
|---|---|---|
| Activar/desactivar | Admin (historia de activar/desactivar) contra profesor | Historia #96 |
| Cabecera de roles | `X-Roles` contra `X-User-Roles` | Documentos anteriores y contrato de plataforma |
| Roles | `GESTOR` y `MS` no figuraban en los documentos | Código |

## Evidencia nueva
- El gateway elimina las cabeceras reservadas `X-*` y reinyecta `X-User-Id`, `X-User-Roles` y las de tipo de principal ([[Gateway e identidad]]); `X-User-Roles` es la oficial.
- El flujo SSE de órdenes permite al dueño de la orden y a los roles ADMIN, GESTOR y MS (`controllers/PurchaseOrderController.java`).
- La documentación actualizada del equipo coincide con el código.

## Qué hace hoy el código
El profesor cambia estado solo por la ruta del curso (`.../catalog/manage/offers/{itemId}/status`); `PATCH /offers/{id}/status` es para ADMIN, GESTOR y MS. Usa `X-User-Roles` con `X-Roles` como respaldo en `configs/filters/GatewayIdentityFilter.java`.

## Opciones
1. **Código y contrato del gateway.** Menos cambios.
2. **Permitir al profesor también por `/offers/{id}/status`.**

## Recomendación
**Adoptar el código** (opción 1, adoptada); quitar el respaldo `X-Roles` y endurecer el parseo (gap 12 en [[Estado actual del código]], sigue abierto como tarea).

## Quién decide / con qué equipo hay que hablar
Mercado y el equipo de Users.

## Resolución
Cerrada el 2026-10-01 por decisión del líder del equipo de Mercado: roles y permisos según el código y las cabeceras del gateway (`X-User-Roles`). Consecuencia: se mantiene como brecha corregir el parseo con `contains()` y el bypass por cabecera vacía. Ver [[DEC-006 - Roles y permisos según el código y los headers del gateway]]. Pregunta archivada.
