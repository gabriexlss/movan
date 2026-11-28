Demonstration Queries 

-- 1. Resumo dos contratos

SELECT
    contrato_id,
    status,
    nome_aluno,
    nome_responsavel,
    data_inicio,
    data_fim
FROM vw_resumo_contrato
ORDER BY data_inicio DESC;


-- 2. Detalhamento dos contratos

SELECT
    contrato_id,
    nome_aluno,
    nome_escola,
    nome_responsavel,
    valor_mensal,
    status
FROM vw_detalhes_contrato
ORDER BY nome_aluno;


-- 3. Quantidade de contratos por status

SELECT
    status,
    COUNT(*) AS quantidade
FROM contrato
GROUP BY status
ORDER BY quantidade DESC;


-- 4. Mensalidades agrupadas por situação

SELECT
    status,
    COUNT(*) AS quantidade,
    SUM(valor_cobrado) AS valor_total
FROM mensalidade
GROUP BY status
ORDER BY status;


-- 5. Movimentações financeiras por mês

SELECT
    DATE_TRUNC('month', data_lancamento)::date AS mes,
    tipo,
    SUM(valor) AS valor_total
FROM financeiro
GROUP BY
    DATE_TRUNC('month', data_lancamento)::date,
    tipo
ORDER BY mes, tipo;


-- 6. Alunos vinculados aos motoristas

SELECT
    a.nome AS aluno,
    m.nome AS motorista,
    a.ano_escolar
FROM aluno a
INNER JOIN motorista m
    ON m.id = a.motorista_id
WHERE a.excluido_em IS NULL
ORDER BY m.nome, a.nome;
