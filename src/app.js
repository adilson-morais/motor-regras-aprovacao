const express = require('express');
const { criarConexao, CAMINHO_PADRAO } = require('./db/conexao');
const criarRotas = require('./routes/regrasRoutes');

const db = criarConexao(CAMINHO_PADRAO);
const app = express();

// Sem isso, req.body vem undefined em qualquer POST — diferente do
// projeto anterior, que não recebia corpo nenhum, só parâmetro de URL.
app.use(express.json());

app.use(criarRotas(db));

// Porta diferente do primeiro projeto (3000), pra dar pra rodar os
// dois servidores ao mesmo tempo se precisar.
const PORTA = process.env.PORTA || 3001;

if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

module.exports = app;