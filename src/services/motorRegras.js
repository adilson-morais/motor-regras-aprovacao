const OPERADORES = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
};

function normalizarValor(valor) {
  const comoNumero = Number(valor);
  return valor !== '' && !Number.isNaN(comoNumero) ? comoNumero : valor;
}

function avaliarRegra(regra, solicitacao) {
  const comparar = OPERADORES[regra.operador];
  if (!comparar) {
    throw new Error(`Operador desconhecido: ${regra.operador}`);
  }

  const valorDoCampo = normalizarValor(solicitacao[regra.campo]);
  const valorComparado = normalizarValor(regra.valor_comparado);

  return comparar(valorDoCampo, valorComparado);
}

function avaliarSolicitacao(solicitacao, regras) {
  const regrasAtivas = regras
    .filter((regra) => regra.ativa)
    .sort((a, b) => a.prioridade - b.prioridade);

  for (const regra of regrasAtivas) {
    if (avaliarRegra(regra, solicitacao)) {
      return { acao: regra.acao, regraId: regra.id };
    }
  }

  // Nenhuma regra bateu: padrão é aprovar.
  return { acao: 'aprovar', regraId: null };
}

module.exports = { avaliarRegra, avaliarSolicitacao, normalizarValor };