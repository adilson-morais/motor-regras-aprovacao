const {
  avaliarRegra,
  avaliarSolicitacao,
  normalizarValor,
} = require('../src/services/motorRegras');

describe('normalizarValor', () => {
  it('converte texto numérico em número', () => {
    expect(normalizarValor('5000')).toBe(5000);
  });

  it('mantém texto não numérico como texto', () => {
    expect(normalizarValor('viagem')).toBe('viagem');
  });
});

describe('avaliarRegra', () => {
  it('avalia o operador > corretamente', () => {
    const regra = { campo: 'valor', operador: '>', valor_comparado: '5000' };
    expect(avaliarRegra(regra, { valor: 6000 })).toBe(true);
    expect(avaliarRegra(regra, { valor: 4000 })).toBe(false);
  });

  it('compara número da solicitação com texto vindo do banco', () => {
    // valor_comparado sempre chega como texto do SQLite, mesmo em
    // comparações numéricas — sem normalizarValor, isso quebraria.
    const regra = { campo: 'valor', operador: '==', valor_comparado: '5000' };
    expect(avaliarRegra(regra, { valor: 5000 })).toBe(true);
  });

  it('compara texto normalmente', () => {
    const regra = { campo: 'categoria', operador: '==', valor_comparado: 'viagem' };
    expect(avaliarRegra(regra, { categoria: 'viagem' })).toBe(true);
    expect(avaliarRegra(regra, { categoria: 'material' })).toBe(false);
  });

  it('lança erro para operador desconhecido', () => {
    const regra = { campo: 'valor', operador: '~=', valor_comparado: '5000' };
    expect(() => avaliarRegra(regra, { valor: 6000 })).toThrow('Operador desconhecido');
  });
});

describe('avaliarSolicitacao', () => {
  it('usa a primeira regra que bater, em ordem de prioridade', () => {
    const regras = [
      { id: 1, campo: 'valor', operador: '>', valor_comparado: '1000', acao: 'encaminhar_para_revisao', prioridade: 2, ativa: 1 },
      { id: 2, campo: 'valor', operador: '>', valor_comparado: '5000', acao: 'rejeitar', prioridade: 1, ativa: 1 },
    ];

    const resultado = avaliarSolicitacao({ valor: 6000 }, regras);

    expect(resultado).toEqual({ acao: 'rejeitar', regraId: 2 });
  });

  it('ignora regras inativas', () => {
    const regras = [
      { id: 1, campo: 'valor', operador: '>', valor_comparado: '1000', acao: 'rejeitar', prioridade: 1, ativa: 0 },
    ];

    const resultado = avaliarSolicitacao({ valor: 6000 }, regras);

    expect(resultado).toEqual({ acao: 'aprovar', regraId: null });
  });

  it('aprova por padrão quando nenhuma regra bate', () => {
    const regras = [
      { id: 1, campo: 'valor', operador: '>', valor_comparado: '9999999', acao: 'rejeitar', prioridade: 1, ativa: 1 },
    ];

    const resultado = avaliarSolicitacao({ valor: 100 }, regras);

    expect(resultado).toEqual({ acao: 'aprovar', regraId: null });
  });
});