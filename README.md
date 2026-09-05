# Motor de Regras de Aprovação Configurável

API que avalia solicitações contra regras de aprovação configuráveis (valor, categoria, alçada), decidindo automaticamente aprovar, rejeitar ou encaminhar para revisão humana — sem precisar reescrever código a cada mudança de política.

## Problema

Sistemas de aprovação (financeiro, RH, etc.) têm regras que mudam com frequência: valor de alçada, quem aprova o quê, quando precisa de segunda aprovação. Hardcodar essas regras direto no código força reescrever e reimplantar o sistema a cada mudança de política de negócio.

## Solução

Uma API que separa regra de negócio e código: as regras ficam armazenadas como dados configuráveis (nome, campo, operador, valor de comparação, ação), e um motor as avalia dinamicamente contra cada solicitação recebida — decidindo aprovar, rejeitar ou encaminhar para revisão, com o motivo (qual regra decidiu) registrado para auditoria.

## Funcionalidades

- `POST /regras` — cadastra uma nova regra de aprovação
- `GET /regras` — lista as regras ativas
- `POST /solicitacoes` — submete uma solicitação para avaliação; ela é salva, avaliada contra as regras ativas, e a decisão é registrada
- `GET /solicitacoes/:id/decisao` — consulta a decisão de uma solicitação específica, junto com os dados originais dela

## Arquitetura
