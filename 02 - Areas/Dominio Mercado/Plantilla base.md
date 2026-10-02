---
tipo: entidad
estado: vigente
verificado_contra: codigo@7528610
actualizado: 2026-10-01
tags: [mercado, dominio, plantilla]
---
# Plantilla base

> Molde predefinido de un item (escudo, boost, vida) con valores por defecto. El profesor parte de una plantilla para armar una [[Oferta de catálogo]].

## Qué representa
Un conjunto cerrado de cuatro tipos ([[Tipos de item]]). La plantilla no se vende: sirve para guiar la configuración y fijar valores iniciales y límites.

## Datos principales
| Campo | Significado |
|---|---|
| `templateId` | Identificador (por ejemplo `tpl-shield-base`) |
| `itemType` | Tipo de item |
| `name`, `description`, `icon` | Presentación |
| `defaultCoinPrice` | Precio sugerido |
| `defaultCharges`, `defaultApplicableChallenges` | Cargas y desafíos a los que aplica el escudo |
| `defaultMultiplier` | Multiplicador del boost (mínimo 1.10) |
| `defaultBoostMode`, `defaultDurationMinutes`, `defaultAttempts`, `defaultConsumptionRule` | Modo del boost |
| `defaultLivesGranted` | Vidas que otorga la poción |
| `active`, `deleted` | Disponibilidad |

## Ciclo de vida / estados
Se cargan al arrancar desde `seed/base-templates.json`: `tpl-shield-base`, `tpl-boost-xp`, `tpl-boost-coins` y `tpl-life-potion`. Solo se listan las activas.

## Reglas de negocio
- Conjunto cerrado de tipos; `STREAK_FREEZE` apareció en algunos documentos pero no existe en el código ([[Ideas descartadas]]).
- Los profesores, administradores y gestores pueden listarlas (`GET /api/market/templates`).
- Las plantillas `tpl-*` son de Mercado; el catálogo de accounting solo reconoce `ITEM-PLACEHOLDER-1` a `3` ([[Integración con Accounting]]). Un cofre sería una plantilla nueva ([[Cofres y nuevos ítems]]).

## Dónde vive en el código
`entities/BaseTemplateEntity.java` (tabla `item_base_templates`), `configs/BaseTemplateDataLoader.java`, `controllers/BaseTemplateController.java`, `src/main/resources/seed/base-templates.json`.

## Relacionado
[[Oferta de catálogo]], [[Tipos de item]], [[Épica 090 - Catálogo por plantillas]].
