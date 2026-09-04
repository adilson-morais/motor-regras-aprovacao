const { criarConexao } = require('../src/db/conexao');

describe('conexao', () => {
  it('cria as tabelas regras, solicitacoes e decisoes', () => {
    const db = criarConexao(':memory:');

    const tabelas = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all()
      .map((linha) => linha.name);

    expect(tabelas).toEqual(
      expect.arrayContaining(['regras', 'solicitacoes', 'decisoes'])
    );

    db.close();
  });
});