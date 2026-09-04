function criarRegra(db, regra) {
  const resultado = db
    .prepare(
      `INSERT INTO regras (nome, campo, operador, valor_comparado, acao, prioridade, ativa)
       VALUES (@nome, @campo, @operador, @valor_comparado, @acao, @prioridade, @ativa)`
    )
    .run({
      prioridade: 0,
      ativa: 1,
      ...regra,
    });

  return resultado.lastInsertRowid;
}

function listarRegrasAtivas(db) {
  return db.prepare('SELECT * FROM regras WHERE ativa = 1').all();
}

module.exports = { criarRegra, listarRegrasAtivas };