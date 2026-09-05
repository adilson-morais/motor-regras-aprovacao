const Database = require('better-sqlite3');
const path = require('path');

const CAMINHO_PADRAO = path.join(__dirname, '..', '..', 'motor-regras.db');

function criarConexao(caminhoDoBanco) {
  const db = new Database(caminhoDoBanco);

  // WAL melhora concorrência de leitura/escrita 
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS regras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      campo TEXT NOT NULL,
      operador TEXT NOT NULL,
      valor_comparado TEXT NOT NULL,
      acao TEXT NOT NULL,
      prioridade INTEGER NOT NULL DEFAULT 0,
      ativa INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS solicitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dados TEXT NOT NULL,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS decisoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solicitacao_id INTEGER NOT NULL,
      resultado TEXT NOT NULL,
      regra_id INTEGER,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes(id),
      FOREIGN KEY (regra_id) REFERENCES regras(id)
    );
  `);

  return db;
}

module.exports = { criarConexao, CAMINHO_PADRAO };