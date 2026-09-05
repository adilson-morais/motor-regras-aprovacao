function criarRegra(db, regra) {
  const resultado = db
    .prepare(
      `INSERT INTO regras (nome, campo, operador, valor_comparado, acao, prioridade, ativa)
       VALUES (@nome, @campo, @operador, @valor_comparado, @acao, @prioridade, @ativa)`
    )
    .run({
      nome: regra.nome,
      campo: regra.campo,
      operador: regra.operador,
      valor_comparado: regra.valor_comparado,
      acao: regra.acao,
      prioridade: regra.prioridade ?? 0,
      ativa: regra.ativa ?? 1,
    });

  return resultado.lastInsertRowid;
}

function listarRegrasAtivas(db) {
  return db.prepare('SELECT * FROM regras WHERE ativa = 1').all();
}

module.exports = { criarRegra, listarRegrasAtivas };