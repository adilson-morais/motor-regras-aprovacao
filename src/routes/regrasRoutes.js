const express = require('express');
const { criarRegra, listarRegrasAtivas } = require('../db/regrasRepositorio');
const {
  criarSolicitacao,
  registrarDecisao,
  buscarDecisaoPorSolicitacao,
} = require('../db/solicitacoesRepositorio');
const { avaliarSolicitacao } = require('../services/motorRegras');

// Função fábrica, não um router pronto: recebe "db" de fora, pelo
// mesmo motivo de sempre — permite testar as rotas com um banco em
// memória, sem depender do arquivo real.
function criarRotas(db) {
  const router = express.Router();

  router.post('/regras', (req, res) => {
    const { nome, campo, operador, valor_comparado, acao, prioridade, ativa } = req.body;

    if (!nome || !campo || !operador || valor_comparado === undefined || !acao) {
      return res.status(400).json({
        erro: 'Campos obrigatorios: nome, campo, operador, valor_comparado, acao',
      });
    }

    const id = criarRegra(db, { nome, campo, operador, valor_comparado, acao, prioridade, ativa });
    res.status(201).json({ id });
  });

  router.get('/regras', (req, res) => {
    res.json(listarRegrasAtivas(db));
  });

  router.post('/solicitacoes', (req, res) => {
    const dadosSolicitacao = req.body;

    const solicitacaoId = criarSolicitacao(db, dadosSolicitacao);
    const regras = listarRegrasAtivas(db);
    const { acao, regraId } = avaliarSolicitacao(dadosSolicitacao, regras);

    registrarDecisao(db, { solicitacaoId, resultado: acao, regraId });

    res.status(201).json({ solicitacaoId, acao, regraId });
  });

  router.get('/solicitacoes/:id/decisao', (req, res) => {
    const decisao = buscarDecisaoPorSolicitacao(db, req.params.id);

    if (!decisao) {
      return res.status(404).json({ erro: 'Solicitacao nao encontrada ou ainda sem decisao' });
    }

    res.json(decisao);
  });

  return router;
}

module.exports = criarRotas;