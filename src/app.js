const express = require('express');
const { criarConexao, CAMINHO_PADRAO } = require('./db/conexao');
const criarRotas = require('./routes/regrasRoutes');

const db = criarConexao(CAMINHO_PADRAO);
const app = express();


app.use(express.json());

app.use(criarRotas(db));

// Porta diferente do primeiro projeto (3000)
const PORTA = process.env.PORTA || 3001;

if (require.main === module) {
  app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

module.exports = app;