## [2026-10-07] query | Plazo atado al TTL en la propuesta C
- [[Propuesta C de la saga de compra]]: el plazo de Mercado pasa a ser `holdExpiresAt` menos un margen (antes, 120 s fijos), con dos funciones: corte para confirmar y disparador del rollback.
- Se aclara que el plazo previene y el rollback completo garantiza: una confirmación demorada más allá del margen cae en el caso 5 y se deshace. Se agrega el tradeoff del margen y la pregunta para la reunión pasa a ser el margen.
