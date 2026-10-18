---
tipo: estado
estado: vigente
verificado_contra: equipo-accounting@2026-10-17, equipo-mercado@2026-10-17
actualizado: 2026-10-17
tags: [mercado, accounting, subastas, seguimiento]
---
# Seguimiento con Accounting - Subastas y holds

> Respuesta aprobada y publicada a Accounting: retiro definitivo sin cobro, sin re-oferta, TTL configurable de 16 días y confirmaciones vencidas rechazadas. [[DEC-032 - Retiro definitivo y contrato de holds de subastas]] resuelve el requisito; incorporar AUCTION_BID_WITHDRAWN sigue pendiente de Accounting.

## Contrato contrastado y pendientes actuales (2026-10-17)

Fuentes remotas de Accounting develop: AsyncAPI `docs/contracts/accounting-service.asyncapi.yaml` versión 2.1.0, blob b439677c035efdef435012d215fb52632ab1c61a; HoldIncreasedPayload.java blob 52ef843f304809d463bde94c29aa514678f5b5de. Verificación de fuentes, no certificación de despliegue.

- HOLD_INCREASED required: correlation_id, hold_id, student_id, course_id, order_id, order_type, amount, status. Opcionales: expires_at, updated_at. amount es total; estado PENDING; vencimiento sin cambios.
- Diez rechazos comunes confirmados: ACCOUNT_NOT_FOUND, ACCOUNT_INACTIVE, HOLD_ALREADY_EXISTS, HOLD_NOT_FOUND, INVALID_HOLD_STATE, INSUFFICIENT_BALANCE, INVALID_AMOUNT, INVALID_ORDER_TYPE, INVALID_TTL, MALFORMED_COMMAND.
- Extensión ya documentada e implementada según verificación comunicada: HOLD_EXPIRY_EXTEND_REQUESTED(order_id, course_id, new_expires_at); HOLDS_EXPIRY_EXTENDED(correlation_id, order_id, extended_hold_ids). IDs ordenados; lista vacía válida. Solo PENDING no vencidos; nunca acorta. INVALID_TTL deja todo sin cambios por plazo inválido o fuera del tope configurable de 16 días; MALFORMED_COMMAND por campos inválidos. Key de respuesta order_id. No revive expirados ni extiende endsAt.
- Confirmación vencida rechaza INVALID_HOLD_STATE antes del job; aceptado por el usuario.
- HoldReleaseReason todavía no incluye AUCTION_BID_WITHDRAWN: pendiente de Accounting.
- Accounting informó ITEM_CREDIT_FAILED en issue #200 vía tpi-accounting#246; payload student_id, course_id, source_reference_id, reason, message; motivos ACCOUNT_NOT_FOUND, ACCOUNT_INACTIVE, INVALID_ITEM. Implementación informada por el equipo, sin verificación aquí del código productor. Distinguir del consumidor de Mercado ya implementado.

Pendientes: incorporar AUCTION_BID_WITHDRAWN; implementar retiro definitivo en Mercado, consumo idempotente y manejo de respuestas tardías; definir protección y margen de liquidación. Los acuerdos de meta colectiva los responde el compañero responsable. Las listas posteriores de pendientes pertenecen al intercambio anterior y están superadas en los puntos confirmados arriba.

## Estado vigente: retiro definitivo y acuerdo publicado (2026-10-17)

[[DEC-032 - Retiro definitivo y contrato de holds de subastas]] sustituye la discusión anterior: el alumno retira, recupera el disponible sin cobro y no puede volver a pujar. Mercado bloquea antes de otro create; HOLD_ALREADY_EXISTS es defensa adicional. HOLD_RELEASE_REQUESTED usa AUCTION_BID_WITHDRAWN, todavía pendiente de incorporación al enum de Accounting. El hold queda RELEASED definitivamente; las mejoras de una oferta activa reutilizan PENDING. Los límites de fase no aprobados del spike siguen siendo propuesta.

[Respuesta aprobada y publicada](https://github.com/2026-P4-BE/tpi-market/issues/200#issuecomment-6244678432). El usuario aceptó TTL configurable de 16 días y rechazo de confirmaciones vencidas con INVALID_HOLD_STATE. [[Q-028 - Retiro y re-oferta frente al ciclo del hold]] quedó archivada por la decisión funcional, sin afirmar implementación del motivo pendiente.

La baja libera con ACCOUNT_DEACTIVATED, correlation_id nulo y sin doble release. Se confirman payload HOLD_INCREASED, diez rechazos comunes y studentId:courseId para operaciones por postor. La extensión por orden usa key order_id y no cambia endsAt ni recupera expirados. Detalle y fuentes en [[Seguimiento con Accounting - Subastas y holds]]. No cambian dado vigente, saga C ni acuerdos de meta colectiva.

Las secciones anteriores y siguientes que describen retiro con re-oferta o pendientes ya confirmados se conservan como historial superado por esta decisión.

## Estado de la conversación

El usuario indicó que las correcciones previas con Accounting ya se hicieron y que el contrato queda como está. El mensaje posterior contiene los últimos puntos específicos de subastas. Esto no acredita una versión nueva de AsyncAPI ni ratifica todas las reglas internas del spike.

El usuario confirmó el envío de un mensaje durante la conversación. No confirmó el envío de la posterior aclaración técnica que distingue aumento de un hold PENDING y re-oferta tras un hold RELEASED, ni de un adjunto. Esa corrección no se registra como acuerdo bilateral.

## Respuesta recibida de Accounting

| Tema | Lo que comunicó Accounting | Estado |
|---|---|---|
| Retiro | RF-INT-05 decía que no se puede retirar ni bajar; propone excluir AUCTION_BID_WITHDRAWN y S4 | Discrepa con el cambio reportado por Mercado |
| Re-oferta | Sin retiro no haría falta; propone ID de subasta como order_id, un hold por postor/subasta | Su premisa excluye el retiro; mecanismo abierto |
| Baja del alumno | Libera con ACCOUNT_DEACTIVATED, sin AUCTION_BIDDER_UNENROLLED | Actualiza el pedido de motivo específico |
| Extensión | Agregará HOLD_EXPIRY_EXTEND_REQUESTED / HOLDS_EXPIRY_EXTENDED | Payload final pendiente de AsyncAPI |
| Confirmar vencidos | Evalúa rechazar con HOLD_REJECTED / INVALID_HOLD_STATE si expires_at ya pasó, aun antes del job (ventana comunicada de hasta 45 s) | En evaluación, no cambio confirmado |

## Extensión anunciada

- `HOLD_EXPIRY_EXTEND_REQUESTED`: `order_id`, `course_id`, `new_expires_at`.
- `HOLDS_EXPIRY_EXTENDED`: `order_id`, `extended_hold_ids`.
- Extiende todos los holds `PENDING` de la orden; solo alarga, nunca acorta y respeta el tope de TTL. No anuncia recuperación de holds ya liberados o vencidos.
- Extender un hold no extiende el cierre. La mención de Accounting a una extensión por el profesor no cambia [[DEC-014 - Reglas de subastas]]: el anti-sniping mantiene el cierre fijo.

## Aclaración de Mercado y modelo propuesto

El usuario informó que habló con Hernán y que el PRD cambió: debe permitirse retirar y volver a ofertar. No equivale a permitir bajar una puja activa ni confirma límites de fase del spike.

[[Flujos de compra directa y subasta]] S1/S3 ya reutiliza el mismo hold PENDING con `HOLD_INCREASE_REQUESTED`, enviando `new_total_amount`, y espera `HOLD_INCREASED`. Si se rechaza la mejora, conserva el monto anterior. `HOLD_REQUEST_INCREASED` no es el identificador documentado.

S4 propone liberar al retirar. El aumento exige PENDING: no demuestra que pueda reabrirse RELEASED. No se adopta otro order_id ni un hold por cada mejora. El mecanismo de re-oferta sigue en [[Q-028 - Retiro y re-oferta frente al ciclo del hold]].

## Pendientes del intercambio anterior (histórico)

1. Conciliar retiro y re-oferta con Accounting y definir liberación, identificación y nueva retención.
2. Confirmar el TTL propuesto de 16 días: localmente 14 días más 24 horas suman 15 días y caben; no acredita aceptación bilateral enviada. Precisar desde cuándo cuenta el tope y cómo limita extensiones.
3. Confirmar motivos de rechazo y payload final de HOLD_INCREASED contra AsyncAPI.
4. Confirmar `studentId:courseId` para operaciones por postor y precisar clave de extensión por orden. No sustituye el acuerdo colectivo de [[Q-026 - Detalles del contrato de la meta colectiva con Accounting]].
5. Definir margen y recuperación de liquidación de subastas ante vencimiento. `holdExpiresAt - 90 s` de compra directa no garantiza esa protección en subastas. Extender solo PENDING no recupera un hold expirado.

## Alcance

Esta ingesta no modifica Taiga ni contratos. [[DEC-025 - Saga de compra de ítems según la Propuesta C]] adopta la saga C solo para compra directa; en subastas sigue siendo propuesta. [[Q-025 - Desempate de las subastas]] sigue abierta y rige el dado de [[DEC-014 - Reglas de subastas]].

## Relacionado

[[Subasta]], [[Integración con Accounting]], [[S2-09c - SPIKE Diseño técnico de subastas]], [[Flujos de compra directa y subasta]].
