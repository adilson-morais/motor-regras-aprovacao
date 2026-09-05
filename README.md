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

src/
├── db/
│ ├── conexao.js # conexão SQLite e criação das tabelas
│ ├── regrasRepositorio.js # CRUD de regras
│ └── solicitacoesRepositorio.js # solicitações e decisões
├── services/
│ └── motorRegras.js # avaliação de regras — lógica pura,
│ sem banco, sem HTTP
├── routes/
│ └── regrasRoutes.js # endpoints REST
└── app.js # monta o Express e sobe o servidor


O motor de avaliação é uma função pura — recebe uma solicitação e uma lista de regras (objetos JavaScript simples) e devolve uma decisão. Isso permite testar toda a lógica de decisão sem precisar de banco de dados rodando durante os testes.

### Regras avaliadas por prioridade

Cada regra tem uma `prioridade`; as regras ativas são avaliadas em ordem, e a **primeira que bater** decide o resultado. Se nenhuma regra bater, o padrão é aprovar — uma decisão de design explícita, não um acidente.

### Sem eval() para interpretar operadores

Os operadores de comparação (`>`, `<`, `>=`, `<=`, `==`, `!=`) são resolvidos por um mapa fixo de funções, não por interpretação dinâmica de string — evitando que uma entrada externa possa executar código arbitrário.

### Um bug real encontrado durante o desenvolvimento

Ao testar a criação de uma regra sem informar `ativa` no corpo da requisição, o banco rejeitava com `NOT NULL constraint failed`. A causa: usar `{ ativa: 1, ...regra }` para aplicar um valor padrão não funciona quando `regra.ativa` existe como `undefined` (em vez de simplesmente ausente) — o espalhamento sobrescreve o padrão com `undefined`. A correção foi usar `regra.ativa ?? 1` campo a campo, que trata `undefined`/`null` como "sem valor" independentemente de a chave existir ou não.

## Tecnologias

Node.js · Express · better-sqlite3 · Jest

## Instalação

```bash
git clone https://github.com/adilson-morais/motor-regras-aprovacao.git
cd motor-regras-aprovacao
npm install
```

## Execução

```bash
npm start
```
Servidor sobe em `http://localhost:3001`.

## Exemplos

POST /solicitacoes
{ "valor": 6000, "categoria": "viagem" }

```json
{ "solicitacaoId": 1, "acao": "rejeitar", "regraId": 1 }
```

GET /solicitacoes/1/decisao

```json
{
  "resultado": "rejeitar",
  "regraId": 1,
  "criadoEm": "2026-09-05 04:44:18",
  "solicitacao": { "valor": 6000, "categoria": "viagem" }
}
```

## Testes

```bash
npm test
```
15 testes cobrindo normalização de tipo entre banco e solicitação, os 6 operadores de comparação, prioridade entre regras conflitantes, regras inativas sendo ignoradas, o padrão de aprovação, e os repositórios de regras/solicitações/decisões com banco em memória.

## Próximos passos

- Suporte a regras com múltiplas condições (E/OU entre elas)
- Versionamento de regras (histórico de mudanças de política)
- Autenticação e controle de acesso para quem pode cadastrar regras