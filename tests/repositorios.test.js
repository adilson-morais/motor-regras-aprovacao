const { criarConexao } = require('../src/db/conexao');
const { criarRegra, listarRegrasAtivas } = require('../src/db/regrasRepositorio');
const {
  criarSolicitacao,
  registrarDecisao,
  buscarDecisaoPorSolicitacao,
} = require('../src/db/solicitacoesRepositorio');

describe('regrasRepositorio', () => {
  let db;

  beforeEach(() => {
    db = criarConexao(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('cria uma regra e devolve o id gerado', () => {
    const id = criarRegra(db, {
      nome: 'Valor alto',
      campo: 'valor',
      operador: '>',
      valor_comparado: '5000',
      acao: 'encaminhar_para_revisao',
    });

    expect(id).toBe(1);
  });

  it('usa prioridade 0 e ativa 1 como padrão quando não informados', () => {
    criarRegra(db, {
      nome: 'Sem prioridade nem ativa definidas',
      campo: 'valor',
      operador: '>',
      valor_comparado: '1000',
      acao: 'rejeitar',
      // prioridade e ativa deliberadamente ausentes daqui
    });

    const [regra] = listarRegrasAtivas(db);

    expect(regra.prioridade).toBe(0);
    expect(regra.ativa).toBe(1);
  });

  it('lista só as regras ativas', () => {
    criarRegra(db, {
      nome: 'Ativa',
      campo: 'valor',
      operador: '>',
      valor_comparado: '1000',
      acao: 'rejeitar',
    });
    criarRegra(db, {
      nome: 'Inativa',
      campo: 'valor',
      operador: '>',
      valor_comparado: '1000',
      acao: 'rejeitar',
      ativa: 0,
    });

    const regras = listarRegrasAtivas(db);

    expect(regras).toHaveLength(1);
    expect(regras[0].nome).toBe('Ativa');
  });
});

describe('solicitacoesRepositorio', () => {
  let db;

  beforeEach(() => {
    db = criarConexao(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('cria uma solicitação, registra a decisão e consulta as duas juntas', () => {
    const regraId = criarRegra(db, {
      nome: 'Valor alto',
      campo: 'valor',
      operador: '>',
      valor_comparado: '5000',
      acao: 'rejeitar',
    });

    const solicitacaoId = criarSolicitacao(db, { valor: 6000, categoria: 'viagem' });

    registrarDecisao(db, { solicitacaoId, resultado: 'rejeitar', regraId });

    const decisao = buscarDecisaoPorSolicitacao(db, solicitacaoId);

    expect(decisao).toEqual({
      resultado: 'rejeitar',
      regraId,
      criadoEm: expect.any(String),
      solicitacao: { valor: 6000, categoria: 'viagem' },
    });
  });

  it('devolve null quando a solicitação não tem decisão registrada', () => {
    const decisao = buscarDecisaoPorSolicitacao(db, 999);
    expect(decisao).toBeNull();
  });
});