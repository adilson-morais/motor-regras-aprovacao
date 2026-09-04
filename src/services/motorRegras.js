const OPERADORES = {
  '>': (a, b) => a > b,
  '<': (a, b) => a < b,
  '>=': (a, b) => a >= b,
  '<=': (a, b) => a <= b,
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
};

// O valor que vem do banco é sempre texto (coluna TEXT), mas o campo
// da solicitação pode ser um número de verdade (ex: valor: 5000).
// Sem essa normalização, "5000" === 5000 seria falso em JavaScript,
// mesmo sendo logicamente a mesma coisa.
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

  // Nenhuma regra bateu: padrão é aprovar. É uma decisão de design
  // (poderia ser "encaminhar_para_revisao" por padrão, sendo mais
  // conservador) — fica registrado aqui como escolha explícita.
  return { acao: 'aprovar', regraId: null };
}

module.exports = { avaliarRegra, avaliarSolicitacao, normalizarValor };