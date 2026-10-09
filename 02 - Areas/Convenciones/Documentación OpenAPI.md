---
tipo: guia
estado: vigente
verificado_contra: codigo@44292e6c
actualizado: 2026-10-08
tags: [mercado, convenciones, openapi, swagger, documentacion]
---
# Documentación OpenAPI (Swagger)

> Reglas para el mantenimiento del contrato de API de `tpi-market` mediante Springdoc.

## 1. Ejemplos obligatorios en DTOs

Todos los DTOs expuestos en la API deben tener la anotación `@Schema` con descripciones explícitas y la propiedad `example` completada con datos de negocio realistas.
**Motivo:** Evitar que Swagger renderice valores primitivos por defecto (como `"string"`, `0` o `true`).

Ejemplo correcto (`dtos/storefront/OfferConfigurationDto.java`):
```java
@Schema(example = "Multiplica XP x2.0 (Por 2 horas)")
@JsonProperty("effect_summary")
private String effectSummary;
```

El `example` es solo el valor. El nombre de la propiedad en el cable lo da el `@JsonProperty` en `snake_case`, como en el resto de los DTOs ([[Errores de la API]] explica el formato de cable).

## 2. Endpoints Dinámicos (Map/Object)

Los endpoints que devuelvan estructuras dinámicas (`Map<String, Object>`), como los endpoints de diagnóstico (`/ping`, `/whoami`, etc.), deben decorar el método con un `@Operation` y un `@ApiResponse` que contenga un `@ExampleObject` en crudo (`value = "{...}"`) para mostrar el formato esperado (`controllers/GatewayDiagnosticsController.java`).

En ese JSON escrito a mano, las claves van en `snake_case`, igual que en las respuestas reales: nada lo convierte solo.

## 3. Ejemplos de Errores Específicos

Las respuestas de error HTTP deben apuntar a los ejemplos registrados como componentes en `configs/SpringDocConfig.java`. Los nombres y las referencias están en `configs/OpenApiExamples.java`: los controladores usan esas constantes, nunca el texto escrito a mano, para que un error de tipeo no deje un ejemplo roto.

```java
@ExampleObject(name = OpenApiExamples.FORBIDDEN_403, ref = OpenApiExamples.FORBIDDEN_403_REF)
```

Ejemplos registrados hoy:

| Estado | Constante | Componente |
|---|---|---|
| 400 | `BAD_REQUEST_400` | `BadRequest400Example` |
| 401 | `UNAUTHORIZED_401` | `Unauthorized401Example` |
| 403 | `FORBIDDEN_403` | `Forbidden403Example` |
| 404 | `NOT_FOUND_404` | `NotFound404Example` |
| 409 | `CONFLICT_409` | `Conflict409Example` |
| 422 | `UNPROCESSABLE_ENTITY_422` | `UnprocessableEntity422Example` |
| 500 | `INTERNAL_ERROR_500` | `InternalError500Example` |
| 503 | `SERVICE_UNAVAILABLE_503` | `ServiceUnavailable503Example` |

Cada constante tiene su par `..._REF` (`#/components/examples/<Componente>`). Para un ejemplo nuevo: agregar el nombre y su referencia en `OpenApiExamples` y registrarlo con `addExamples` en `SpringDocConfig`.

## 4. Mantenimiento y Evolución

Esta documentación estática **está sujeta a cambios y no se auto-valida**. Toda modificación a un endpoint existente o creación de uno nuevo DEBE ir acompañada de la revisión y actualización manual de sus correspondientes `@Schema` o `@ExampleObject`.
