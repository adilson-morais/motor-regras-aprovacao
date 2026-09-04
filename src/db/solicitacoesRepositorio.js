function criarSolicitacao(db, dados) {
  const resultado = db
    .prepare('INSERT INTO solicitacoes (dados) VALUES (?)')
    .run(JSON.stringify(dados));

  return resultado.lastInsertRowid;
}

function registrarDecisao(db, { solicitacaoId, resultado, regraId }) {
  db.prepare(
    'INSERT INTO decisoes (solicitacao_id, resultado, regra_id) VALUES (?, ?, ?)'
  ).run(solicitacaoId, resultado, regraId);
}

function buscarDecisaoPorSolicitacao(db, solicitacaoId) {
  const linha = db
    .prepare(
      `SELECT decisoes.resultado, decisoes.regra_id, decisoes.criado_em,
              solicitacoes.dados AS solicitacao_dados
       FROM decisoes
       JOIN solicitacoes ON solicitacoes.id = decisoes.solicitacao_id
       WHERE decisoes.solicitacao_id = ?`
    )
    .get(solicitacaoId);

  if (!linha) return null;

  return {
    resultado: linha.resultado,
    regraId: linha.regra_id,
    criadoEm: linha.criado_em,
    solicitacao: JSON.parse(linha.solicitacao_dados),
  };
}

module.exports = { criarSolicitacao, registrarDecisao, buscarDecisaoPorSolicitacao };