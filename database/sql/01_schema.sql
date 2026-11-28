--
-- PostgreSQL database dump
--

\restrict JJGpnxjYpM45KSYdJL0G7VVoVH0tyjo6da9iz7eFupWen0ppFs43v4iTReyP9Sa

-- Dumped from database version 18.6 (ac70818)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: frequencia_financeira; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.frequencia_financeira AS ENUM (
    'SEMANAL',
    'MENSAL'
);


--
-- Name: origem_clausula; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.origem_clausula AS ENUM (
    'PADRAO',
    'MOTORISTA',
    'PERSONALIZADO'
);


--
-- Name: origem_financeira; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.origem_financeira AS ENUM (
    'MANUAL',
    'MENSALIDADE',
    'RECORRENTE',
    'ESTORNO',
    'AJUSTE'
);


--
-- Name: sentido_rota; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sentido_rota AS ENUM (
    'IDA',
    'VOLTA'
);


--
-- Name: status_contrato; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_contrato AS ENUM (
    'RASCUNHO',
    'AGUARDANDO_ASSINATURA',
    'ATIVO',
    'FINALIZADO',
    'CANCELADO'
);


--
-- Name: status_documento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_documento AS ENUM (
    'ENVIADO',
    'ASSINADO',
    'SUBSTITUIDO'
);


--
-- Name: status_mensalidade; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.status_mensalidade AS ENUM (
    'PENDENTE',
    'PAGA',
    'CANCELADA'
);


--
-- Name: tipo_codigo_verificacao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_codigo_verificacao AS ENUM (
    'CRIACAO',
    'RECUPERACAO',
    'ALTERACAO'
);


--
-- Name: tipo_lancamento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_lancamento AS ENUM (
    'ENTRADA',
    'SAIDA'
);


--
-- Name: tipo_pessoa; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_pessoa AS ENUM (
    'PF',
    'PJ'
);


--
-- Name: tipo_ponto_rota; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_ponto_rota AS ENUM (
    'EMBARQUE',
    'DESEMBARQUE'
);


--
-- Name: tipo_signatario; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipo_signatario AS ENUM (
    'MOTORISTA',
    'RESPONSAVEL'
);


--
-- Name: turno_escolar; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.turno_escolar AS ENUM (
    'INTEGRAL',
    'MANHA',
    'TARDE',
    'NOITE',
    'INTEGRAL_MANHA',
    'INTEGRAL_TARDE'
);


--
-- Name: turno_rota; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.turno_rota AS ENUM (
    'INTEGRAL',
    'MANHA',
    'TARDE',
    'NOITE',
    'INTEGRAL_MANHA',
    'INTEGRAL_TARDE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aluno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aluno (
    id integer NOT NULL,
    nome character varying(200) NOT NULL,
    data_nasc date NOT NULL,
    ano_escolar character varying(10) NOT NULL,
    observacao text,
    endereco character varying(255),
    latitude numeric(9,6),
    longitude numeric(9,6),
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    excluido_em timestamp without time zone,
    responsavel_id integer NOT NULL,
    escola_id integer NOT NULL,
    motorista_id integer NOT NULL,
    escola_turno_id integer,
    CONSTRAINT ck_aluno_turno_requer_escola CHECK (((escola_turno_id IS NULL) OR (escola_id IS NOT NULL)))
);


--
-- Name: aluno_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.aluno ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.aluno_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assinatura_contrato; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assinatura_contrato (
    id integer NOT NULL,
    tipo_signatario public.tipo_signatario NOT NULL,
    assinatura_imagem text NOT NULL,
    assinado_em timestamp without time zone DEFAULT now() NOT NULL,
    contrato_documento_id integer NOT NULL,
    link_assinatura_id integer,
    CONSTRAINT ck_assinatura_tipo_link CHECK ((((tipo_signatario = 'MOTORISTA'::public.tipo_signatario) AND (link_assinatura_id IS NULL)) OR ((tipo_signatario = 'RESPONSAVEL'::public.tipo_signatario) AND (link_assinatura_id IS NOT NULL))))
);


--
-- Name: assinatura_contrato_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assinatura_contrato ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assinatura_contrato_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: assinatura_motorista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assinatura_motorista (
    id integer NOT NULL,
    caminho_arquivo text NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizado_em timestamp without time zone DEFAULT now() NOT NULL,
    motorista_id integer NOT NULL
);


--
-- Name: assinatura_motorista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.assinatura_motorista ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.assinatura_motorista_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clausula_motorista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clausula_motorista (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    conteudo text NOT NULL,
    criada_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizada_em timestamp without time zone DEFAULT now() NOT NULL,
    motorista_id integer NOT NULL,
    ordem integer NOT NULL,
    excluido boolean DEFAULT false NOT NULL
);


--
-- Name: clausula_motorista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.clausula_motorista ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.clausula_motorista_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clausula_padrao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clausula_padrao (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    conteudo text NOT NULL,
    ordem integer NOT NULL,
    criada_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizada_em timestamp without time zone DEFAULT now() NOT NULL,
    excluido boolean DEFAULT false NOT NULL
);


--
-- Name: clausula_padrao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.clausula_padrao ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.clausula_padrao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: cod_verificacao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cod_verificacao (
    id integer NOT NULL,
    codigo_hash character varying(255) NOT NULL,
    tipo public.tipo_codigo_verificacao NOT NULL,
    data_criacao timestamp without time zone DEFAULT now() NOT NULL,
    data_uso timestamp without time zone,
    motorista_id integer NOT NULL
);


--
-- Name: cod_verificacao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.cod_verificacao ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cod_verificacao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: contrato; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato (
    id integer NOT NULL,
    data_inicio date NOT NULL,
    data_fim date,
    dia_vencimento smallint NOT NULL,
    valor_mensal numeric(10,2) NOT NULL,
    status public.status_contrato DEFAULT 'RASCUNHO'::public.status_contrato NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    cancelado_em timestamp without time zone,
    motivo_cancelamento text,
    aluno_id integer NOT NULL,
    responsavel_id integer NOT NULL,
    motorista_id integer NOT NULL,
    contrato_origem_id integer,
    atualizado_em timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_contrato_motivo_cancelamento CHECK (((status = 'CANCELADO'::public.status_contrato) OR (motivo_cancelamento IS NULL))),
    CONSTRAINT ck_contrato_origem_diferente CHECK (((contrato_origem_id IS NULL) OR (contrato_origem_id <> id))),
    CONSTRAINT ck_contrato_periodo CHECK (((data_fim IS NULL) OR (data_fim >= data_inicio))),
    CONSTRAINT ck_contrato_vencimento CHECK (((dia_vencimento >= 1) AND (dia_vencimento <= 31)))
);


--
-- Name: contrato_clausula; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato_clausula (
    id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    conteudo text NOT NULL,
    ordem integer NOT NULL,
    editavel boolean DEFAULT true NOT NULL,
    origem public.origem_clausula NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    atualizada_em timestamp without time zone DEFAULT now() NOT NULL,
    contrato_id integer NOT NULL,
    clausula_padrao_id integer,
    clausula_motorista_id integer,
    CONSTRAINT ck_contrato_clausula_ordem CHECK ((ordem > 0)),
    CONSTRAINT ck_contrato_clausula_origem CHECK ((((origem = 'PADRAO'::public.origem_clausula) AND (clausula_padrao_id IS NOT NULL) AND (clausula_motorista_id IS NULL)) OR ((origem = 'MOTORISTA'::public.origem_clausula) AND (clausula_motorista_id IS NOT NULL) AND (clausula_padrao_id IS NULL)) OR ((origem = 'PERSONALIZADO'::public.origem_clausula) AND (clausula_padrao_id IS NULL) AND (clausula_motorista_id IS NULL))))
);


--
-- Name: contrato_clausula_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contrato_clausula ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contrato_clausula_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: contrato_documento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contrato_documento (
    id integer NOT NULL,
    hash_documento character varying(255) NOT NULL,
    versao integer NOT NULL,
    gerado_em timestamp with time zone DEFAULT now() NOT NULL,
    contrato_id integer NOT NULL,
    responsavel_id integer NOT NULL,
    status_documento public.status_documento DEFAULT 'ENVIADO'::public.status_documento,
    caminho_arquivo text,
    CONSTRAINT ck_documento_versao CHECK ((versao > 0))
);


--
-- Name: contrato_documento_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contrato_documento ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contrato_documento_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: contrato_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.contrato ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.contrato_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: escola; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escola (
    id integer NOT NULL,
    nome character varying(200) NOT NULL,
    endereco character varying(255),
    telefone character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    excluido_em timestamp without time zone,
    motorista_id integer NOT NULL
);


--
-- Name: escola_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.escola ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.escola_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: escola_turno; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.escola_turno (
    id integer NOT NULL,
    turno public.turno_escolar NOT NULL,
    hora_entrada time without time zone NOT NULL,
    hora_saida time without time zone NOT NULL,
    escola_id integer NOT NULL,
    CONSTRAINT ck_escola_turno_horario CHECK ((hora_saida > hora_entrada))
);


--
-- Name: escola_turno_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.escola_turno ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.escola_turno_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: financeiro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financeiro (
    id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    valor numeric(10,2) NOT NULL,
    descricao text,
    tipo public.tipo_lancamento NOT NULL,
    data_lancamento date NOT NULL,
    data_referencia date,
    origem public.origem_financeira NOT NULL,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    motorista_id integer NOT NULL,
    mensalidade_id integer,
    regra_financeira_id integer,
    lancamento_origem_id integer,
    CONSTRAINT check_financeiro_nao_estorna_si_mesmo CHECK (((lancamento_origem_id IS NULL) OR (lancamento_origem_id <> id))),
    CONSTRAINT check_financeiro_origem CHECK ((((origem = 'MENSALIDADE'::public.origem_financeira) AND (mensalidade_id IS NOT NULL) AND (regra_financeira_id IS NULL) AND (lancamento_origem_id IS NULL)) OR ((origem = 'RECORRENTE'::public.origem_financeira) AND (mensalidade_id IS NULL) AND (regra_financeira_id IS NOT NULL) AND (lancamento_origem_id IS NULL)) OR ((origem = ANY (ARRAY['MANUAL'::public.origem_financeira, 'AJUSTE'::public.origem_financeira])) AND (mensalidade_id IS NULL) AND (regra_financeira_id IS NULL) AND (lancamento_origem_id IS NULL)) OR ((origem = 'ESTORNO'::public.origem_financeira) AND (mensalidade_id IS NULL) AND (regra_financeira_id IS NULL) AND (lancamento_origem_id IS NOT NULL)))),
    CONSTRAINT check_financeiro_valor CHECK ((valor > (0)::numeric))
);


--
-- Name: financeiro_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.financeiro ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.financeiro_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: fotocopia_contrato; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fotocopia_contrato (
    contrato_documento_id integer NOT NULL,
    responsavel_id integer NOT NULL,
    nome character varying(200) NOT NULL,
    cpf character varying(11) NOT NULL,
    endereco character varying(255),
    telefone character varying(20),
    email character varying(150),
    capturado_em timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: link_assinatura; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.link_assinatura (
    id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expira_em timestamp without time zone NOT NULL,
    utilizado_em timestamp without time zone,
    revogado_em timestamp without time zone,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    agente_usuario text,
    endereco_ip inet,
    contrato_documento_id integer NOT NULL,
    responsavel_id integer NOT NULL
);


--
-- Name: link_assinatura_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.link_assinatura ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.link_assinatura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mensalidade; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensalidade (
    id integer NOT NULL,
    competencia date NOT NULL,
    valor_cobrado numeric(10,2) NOT NULL,
    data_vencimento date NOT NULL,
    status public.status_mensalidade DEFAULT 'PENDENTE'::public.status_mensalidade NOT NULL,
    cancelada_em timestamp without time zone,
    motivo_cancelamento text,
    contrato_id integer NOT NULL,
    motorista_id integer NOT NULL
);


--
-- Name: mensalidade_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.mensalidade ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.mensalidade_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: motorista; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.motorista (
    id integer NOT NULL,
    nome character varying(200) NOT NULL,
    tipo_pessoa public.tipo_pessoa NOT NULL,
    cpf character varying(11),
    cnpj character varying(14),
    email character varying(150) NOT NULL,
    senha character varying(255) CONSTRAINT motorista_senha_hash_not_null NOT NULL,
    google_id character varying(255),
    capacidade_van integer DEFAULT 20 NOT NULL,
    email_verificado boolean DEFAULT false NOT NULL,
    excluido_em timestamp without time zone,
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT check_motorista_documento CHECK ((((tipo_pessoa = 'PF'::public.tipo_pessoa) AND (cpf IS NOT NULL) AND (cnpj IS NULL)) OR ((tipo_pessoa = 'PJ'::public.tipo_pessoa) AND (cnpj IS NOT NULL) AND (cpf IS NULL))))
);


--
-- Name: motorista_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.motorista ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.motorista_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notificacao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificacao (
    id integer NOT NULL,
    titulo character varying(50) NOT NULL,
    mensagem character varying(100) NOT NULL,
    enviada_em timestamp without time zone DEFAULT now() NOT NULL,
    lida_em timestamp without time zone,
    motorista_id integer NOT NULL
);


--
-- Name: notificacao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.notificacao ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notificacao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ponto_rota; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ponto_rota (
    id integer NOT NULL,
    ordem smallint NOT NULL,
    tipo_ponto public.tipo_ponto_rota NOT NULL,
    rota_id integer NOT NULL,
    motorista_id integer NOT NULL,
    aluno_id integer,
    escola_id integer,
    escola_turno_id integer,
    CONSTRAINT check_ponto_rota_destino CHECK (((aluno_id IS NOT NULL) <> (escola_id IS NOT NULL))),
    CONSTRAINT check_ponto_rota_ordem CHECK ((ordem > 0)),
    CONSTRAINT ck_ponto_rota_turno_requer_escola CHECK (((escola_turno_id IS NULL) OR (escola_id IS NOT NULL)))
);


--
-- Name: ponto_rota_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ponto_rota ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ponto_rota_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: regra_financeira; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regra_financeira (
    id integer NOT NULL,
    titulo character varying(100) NOT NULL,
    descricao text,
    tipo public.tipo_lancamento NOT NULL,
    valor numeric(10,2) NOT NULL,
    frequencia public.frequencia_financeira NOT NULL,
    dia_semana smallint,
    dia_mes smallint,
    inicio_em date NOT NULL,
    fim_em date,
    ativa boolean DEFAULT true NOT NULL,
    motorista_id integer NOT NULL,
    CONSTRAINT check_regra_frequencia CHECK ((((frequencia = 'SEMANAL'::public.frequencia_financeira) AND ((dia_semana >= 1) AND (dia_semana <= 7)) AND (dia_mes IS NULL)) OR ((frequencia = 'MENSAL'::public.frequencia_financeira) AND ((dia_mes >= 1) AND (dia_mes <= 31)) AND (dia_semana IS NULL)))),
    CONSTRAINT check_regra_periodo CHECK (((fim_em IS NULL) OR (fim_em >= inicio_em))),
    CONSTRAINT check_regra_valor CHECK ((valor > (0)::numeric))
);


--
-- Name: regra_financeira_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.regra_financeira ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.regra_financeira_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: responsavel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.responsavel (
    id integer NOT NULL,
    cpf character varying(11) NOT NULL,
    nome character varying(200) NOT NULL,
    endereco character varying(255),
    telefone character varying(20),
    email character varying(150),
    criado_em timestamp without time zone DEFAULT now() NOT NULL,
    excluido_em timestamp without time zone,
    motorista_id integer NOT NULL
);


--
-- Name: responsavel_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.responsavel ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.responsavel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: rota; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rota (
    id integer NOT NULL,
    nome character varying(100),
    sentido public.sentido_rota NOT NULL,
    ativa boolean DEFAULT true NOT NULL,
    motorista_id integer NOT NULL,
    turno public.turno_rota
);


--
-- Name: rota_dia_semana; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rota_dia_semana (
    rota_id integer NOT NULL,
    dia_semana smallint NOT NULL,
    CONSTRAINT check_rota_dia_semana CHECK (((dia_semana >= 1) AND (dia_semana <= 7)))
);


--
-- Name: rota_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.rota ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rota_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vw_detalhes_contrato; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_detalhes_contrato AS
 SELECT c.id AS contrato_id,
    c.status,
    c.data_inicio,
    c.data_fim,
    c.dia_vencimento,
    c.valor_mensal,
    a.id AS aluno_id,
    a.nome AS nome_aluno,
    a.endereco AS endereco_aluno,
    e.id AS escola_id,
    e.nome AS nome_escola,
    e.endereco AS endereco_escola,
    r.id AS responsavel_id,
    r.nome AS nome_responsavel,
    r.cpf AS cpf_responsavel,
    c.motorista_id
   FROM (((public.contrato c
     JOIN public.aluno a ON ((a.id = c.aluno_id)))
     JOIN public.escola e ON ((e.id = a.escola_id)))
     JOIN public.responsavel r ON ((r.id = c.responsavel_id)));


--
-- Name: vw_resumo_contrato; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_resumo_contrato AS
 SELECT c.id AS contrato_id,
    c.status,
    a.nome AS nome_aluno,
    r.nome AS nome_responsavel,
    c.data_inicio,
    c.data_fim,
    c.motorista_id
   FROM ((public.contrato c
     JOIN public.aluno a ON ((a.id = c.aluno_id)))
     JOIN public.responsavel r ON ((r.id = c.responsavel_id)));


--
-- Name: aluno aluno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT aluno_pkey PRIMARY KEY (id);


--
-- Name: assinatura_contrato assinatura_contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_contrato
    ADD CONSTRAINT assinatura_contrato_pkey PRIMARY KEY (id);


--
-- Name: assinatura_motorista assinatura_motorista_motorista_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_motorista
    ADD CONSTRAINT assinatura_motorista_motorista_id_key UNIQUE (motorista_id);


--
-- Name: assinatura_motorista assinatura_motorista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_motorista
    ADD CONSTRAINT assinatura_motorista_pkey PRIMARY KEY (id);


--
-- Name: clausula_motorista clausula_motorista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clausula_motorista
    ADD CONSTRAINT clausula_motorista_pkey PRIMARY KEY (id);


--
-- Name: clausula_padrao clausula_padrao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clausula_padrao
    ADD CONSTRAINT clausula_padrao_pkey PRIMARY KEY (id);


--
-- Name: cod_verificacao cod_verificacao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cod_verificacao
    ADD CONSTRAINT cod_verificacao_pkey PRIMARY KEY (id);


--
-- Name: contrato_clausula contrato_clausula_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_clausula
    ADD CONSTRAINT contrato_clausula_pkey PRIMARY KEY (id);


--
-- Name: contrato_documento contrato_documento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_documento
    ADD CONSTRAINT contrato_documento_pkey PRIMARY KEY (id);


--
-- Name: contrato contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT contrato_pkey PRIMARY KEY (id);


--
-- Name: escola escola_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola
    ADD CONSTRAINT escola_pkey PRIMARY KEY (id);


--
-- Name: escola_turno escola_turno_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola_turno
    ADD CONSTRAINT escola_turno_pkey PRIMARY KEY (id);


--
-- Name: financeiro financeiro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_pkey PRIMARY KEY (id);


--
-- Name: fotocopia_contrato fotocopia_contrato_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotocopia_contrato
    ADD CONSTRAINT fotocopia_contrato_pkey PRIMARY KEY (contrato_documento_id);


--
-- Name: link_assinatura link_assinatura_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_assinatura
    ADD CONSTRAINT link_assinatura_pkey PRIMARY KEY (id);


--
-- Name: link_assinatura link_assinatura_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_assinatura
    ADD CONSTRAINT link_assinatura_token_hash_key UNIQUE (token_hash);


--
-- Name: mensalidade mensalidade_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT mensalidade_pkey PRIMARY KEY (id);


--
-- Name: motorista motorista_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motorista
    ADD CONSTRAINT motorista_email_key UNIQUE (email);


--
-- Name: motorista motorista_google_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motorista
    ADD CONSTRAINT motorista_google_id_key UNIQUE (google_id);


--
-- Name: motorista motorista_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motorista
    ADD CONSTRAINT motorista_pkey PRIMARY KEY (id);


--
-- Name: notificacao notificacao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacao
    ADD CONSTRAINT notificacao_pkey PRIMARY KEY (id);


--
-- Name: ponto_rota ponto_rota_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT ponto_rota_pkey PRIMARY KEY (id);


--
-- Name: regra_financeira regra_financeira_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regra_financeira
    ADD CONSTRAINT regra_financeira_pkey PRIMARY KEY (id);


--
-- Name: responsavel responsavel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsavel
    ADD CONSTRAINT responsavel_pkey PRIMARY KEY (id);


--
-- Name: rota_dia_semana rota_dia_semana_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rota_dia_semana
    ADD CONSTRAINT rota_dia_semana_pkey PRIMARY KEY (rota_id, dia_semana);


--
-- Name: rota rota_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rota
    ADD CONSTRAINT rota_pkey PRIMARY KEY (id);


--
-- Name: assinatura_contrato uniq_assinatura_contrato_tipo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_contrato
    ADD CONSTRAINT uniq_assinatura_contrato_tipo UNIQUE (contrato_documento_id, tipo_signatario);


--
-- Name: mensalidade uniq_mensalidade_contrato_competencia; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT uniq_mensalidade_contrato_competencia UNIQUE (contrato_id, competencia);


--
-- Name: mensalidade uniq_mensalidade_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT uniq_mensalidade_id_motorista UNIQUE (id, motorista_id);


--
-- Name: ponto_rota uniq_ponto_rota_ordem; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT uniq_ponto_rota_ordem UNIQUE (rota_id, ordem);


--
-- Name: contrato unique_contrato_id_responsavel; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT unique_contrato_id_responsavel UNIQUE (id, responsavel_id);


--
-- Name: escola unique_escola_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola
    ADD CONSTRAINT unique_escola_id_motorista UNIQUE (id, motorista_id);


--
-- Name: link_assinatura unique_link_id_documento; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_assinatura
    ADD CONSTRAINT unique_link_id_documento UNIQUE (id, contrato_documento_id);


--
-- Name: motorista unique_motorista_cnpj; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motorista
    ADD CONSTRAINT unique_motorista_cnpj UNIQUE (cnpj);


--
-- Name: motorista unique_motorista_cpf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.motorista
    ADD CONSTRAINT unique_motorista_cpf UNIQUE (cpf);


--
-- Name: responsavel unique_responsavel_cpf_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsavel
    ADD CONSTRAINT unique_responsavel_cpf_motorista UNIQUE (motorista_id, cpf);


--
-- Name: responsavel unique_responsavel_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsavel
    ADD CONSTRAINT unique_responsavel_id_motorista UNIQUE (id, motorista_id);


--
-- Name: rota unique_rota_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rota
    ADD CONSTRAINT unique_rota_id_motorista UNIQUE (id, motorista_id);


--
-- Name: aluno uq_aluno_responsavel_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT uq_aluno_responsavel_motorista UNIQUE (id, responsavel_id, motorista_id);


--
-- Name: contrato_clausula uq_contrato_clausula_ordem; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_clausula
    ADD CONSTRAINT uq_contrato_clausula_ordem UNIQUE (contrato_id, ordem) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: contrato uq_contrato_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT uq_contrato_id_motorista UNIQUE (id, motorista_id);


--
-- Name: contrato_documento uq_documento_contrato_versao; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_documento
    ADD CONSTRAINT uq_documento_contrato_versao UNIQUE (contrato_id, versao);


--
-- Name: contrato_documento uq_documento_id_responsavel; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_documento
    ADD CONSTRAINT uq_documento_id_responsavel UNIQUE (id, responsavel_id);


--
-- Name: escola_turno uq_escola_turno; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola_turno
    ADD CONSTRAINT uq_escola_turno UNIQUE (escola_id, turno);


--
-- Name: escola_turno uq_escola_turno_id_escola; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola_turno
    ADD CONSTRAINT uq_escola_turno_id_escola UNIQUE (escola_id, id);


--
-- Name: financeiro uq_financeiro_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT uq_financeiro_id_motorista UNIQUE (id, motorista_id);


--
-- Name: regra_financeira uq_regra_financeira_id_motorista; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regra_financeira
    ADD CONSTRAINT uq_regra_financeira_id_motorista UNIQUE (id, motorista_id);


--
-- Name: contrato_ativo_por_aluno; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX contrato_ativo_por_aluno ON public.contrato USING btree (aluno_id) WHERE (status = 'ATIVO'::public.status_contrato);


--
-- Name: idx_aluno_escola_turno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aluno_escola_turno ON public.aluno USING btree (escola_id, escola_turno_id) WHERE (escola_turno_id IS NOT NULL);


--
-- Name: idx_ponto_rota_escola_turno; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ponto_rota_escola_turno ON public.ponto_rota USING btree (escola_id, escola_turno_id) WHERE (escola_turno_id IS NOT NULL);


--
-- Name: index_contrato_motorista_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_contrato_motorista_status ON public.contrato USING btree (motorista_id, status);


--
-- Name: index_financeiro_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_financeiro_data ON public.financeiro USING btree (motorista_id, data_lancamento);


--
-- Name: index_mensalidade_vencimento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_mensalidade_vencimento ON public.mensalidade USING btree (motorista_id, data_vencimento);


--
-- Name: indexaluno_motorista; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX indexaluno_motorista ON public.aluno USING btree (motorista_id);


--
-- Name: uq_financeiro_estorno_origem; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_financeiro_estorno_origem ON public.financeiro USING btree (lancamento_origem_id) WHERE (origem = 'ESTORNO'::public.origem_financeira);


--
-- Name: uq_financeiro_mensalidade; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_financeiro_mensalidade ON public.financeiro USING btree (mensalidade_id) WHERE (mensalidade_id IS NOT NULL);


--
-- Name: uq_financeiro_regra_referencia; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_financeiro_regra_referencia ON public.financeiro USING btree (regra_financeira_id, data_referencia) WHERE (regra_financeira_id IS NOT NULL);


--
-- Name: aluno aluno_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT aluno_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: assinatura_contrato assinatura_contrato_contrato_documento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_contrato
    ADD CONSTRAINT assinatura_contrato_contrato_documento_id_fkey FOREIGN KEY (contrato_documento_id) REFERENCES public.contrato_documento(id) ON DELETE CASCADE;


--
-- Name: assinatura_motorista assinatura_motorista_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_motorista
    ADD CONSTRAINT assinatura_motorista_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: clausula_motorista clausula_motorista_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clausula_motorista
    ADD CONSTRAINT clausula_motorista_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: cod_verificacao cod_verificacao_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cod_verificacao
    ADD CONSTRAINT cod_verificacao_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: contrato_clausula contrato_clausula_clausula_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_clausula
    ADD CONSTRAINT contrato_clausula_clausula_motorista_id_fkey FOREIGN KEY (clausula_motorista_id) REFERENCES public.clausula_motorista(id) ON DELETE CASCADE;


--
-- Name: contrato_clausula contrato_clausula_clausula_padrao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_clausula
    ADD CONSTRAINT contrato_clausula_clausula_padrao_id_fkey FOREIGN KEY (clausula_padrao_id) REFERENCES public.clausula_padrao(id) ON DELETE RESTRICT;


--
-- Name: contrato_clausula contrato_clausula_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_clausula
    ADD CONSTRAINT contrato_clausula_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contrato(id) ON DELETE CASCADE;


--
-- Name: contrato contrato_contrato_origem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT contrato_contrato_origem_id_fkey FOREIGN KEY (contrato_origem_id) REFERENCES public.contrato(id) ON DELETE SET NULL;


--
-- Name: contrato contrato_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT contrato_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: escola escola_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola
    ADD CONSTRAINT escola_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: escola_turno escola_turno_escola_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.escola_turno
    ADD CONSTRAINT escola_turno_escola_id_fkey FOREIGN KEY (escola_id) REFERENCES public.escola(id) ON DELETE CASCADE;


--
-- Name: financeiro financeiro_lancamento_origem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_lancamento_origem_id_fkey FOREIGN KEY (lancamento_origem_id) REFERENCES public.financeiro(id) ON DELETE CASCADE;


--
-- Name: financeiro financeiro_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: financeiro financeiro_regra_financeira_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT financeiro_regra_financeira_id_fkey FOREIGN KEY (regra_financeira_id) REFERENCES public.regra_financeira(id) ON DELETE CASCADE;


--
-- Name: aluno fk_aluno_escola_mesmo_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT fk_aluno_escola_mesmo_motorista FOREIGN KEY (escola_id, motorista_id) REFERENCES public.escola(id, motorista_id) ON DELETE CASCADE;


--
-- Name: aluno fk_aluno_escola_turno; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT fk_aluno_escola_turno FOREIGN KEY (escola_id, escola_turno_id) REFERENCES public.escola_turno(escola_id, id) ON DELETE RESTRICT;


--
-- Name: aluno fk_aluno_responsavel_mesmo_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aluno
    ADD CONSTRAINT fk_aluno_responsavel_mesmo_motorista FOREIGN KEY (responsavel_id, motorista_id) REFERENCES public.responsavel(id, motorista_id) ON DELETE CASCADE;


--
-- Name: assinatura_contrato fk_assinatura_link_documento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assinatura_contrato
    ADD CONSTRAINT fk_assinatura_link_documento FOREIGN KEY (link_assinatura_id, contrato_documento_id) REFERENCES public.link_assinatura(id, contrato_documento_id) ON DELETE CASCADE;


--
-- Name: contrato fk_contrato_aluno_responsavel_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato
    ADD CONSTRAINT fk_contrato_aluno_responsavel_motorista FOREIGN KEY (aluno_id, responsavel_id, motorista_id) REFERENCES public.aluno(id, responsavel_id, motorista_id) ON DELETE CASCADE;


--
-- Name: contrato_documento fk_documento_contrato_responsavel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_documento
    ADD CONSTRAINT fk_documento_contrato_responsavel FOREIGN KEY (contrato_id, responsavel_id) REFERENCES public.contrato(id, responsavel_id) ON DELETE CASCADE;


--
-- Name: contrato_documento fk_documento_responsavel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contrato_documento
    ADD CONSTRAINT fk_documento_responsavel FOREIGN KEY (responsavel_id) REFERENCES public.responsavel(id) ON DELETE CASCADE;


--
-- Name: financeiro fk_financeiro_estorno_msm_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT fk_financeiro_estorno_msm_motorista FOREIGN KEY (lancamento_origem_id, motorista_id) REFERENCES public.financeiro(id, motorista_id) ON DELETE RESTRICT;


--
-- Name: financeiro fk_financeiro_mensalidade_msm_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT fk_financeiro_mensalidade_msm_motorista FOREIGN KEY (mensalidade_id, motorista_id) REFERENCES public.mensalidade(id, motorista_id) ON DELETE CASCADE;


--
-- Name: financeiro fk_financeiro_regra_msm_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financeiro
    ADD CONSTRAINT fk_financeiro_regra_msm_motorista FOREIGN KEY (regra_financeira_id, motorista_id) REFERENCES public.regra_financeira(id, motorista_id) ON DELETE RESTRICT;


--
-- Name: link_assinatura fk_link_documento_responsavel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_assinatura
    ADD CONSTRAINT fk_link_documento_responsavel FOREIGN KEY (contrato_documento_id, responsavel_id) REFERENCES public.contrato_documento(id, responsavel_id) ON DELETE CASCADE;


--
-- Name: mensalidade fk_mensalidade_contrato; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT fk_mensalidade_contrato FOREIGN KEY (contrato_id) REFERENCES public.contrato(id) ON DELETE CASCADE;


--
-- Name: mensalidade fk_mensalidade_contrato_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT fk_mensalidade_contrato_motorista FOREIGN KEY (contrato_id, motorista_id) REFERENCES public.contrato(id, motorista_id) ON DELETE RESTRICT;


--
-- Name: mensalidade fk_mensalidade_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensalidade
    ADD CONSTRAINT fk_mensalidade_motorista FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: ponto_rota fk_ponto_aluno_mesmo_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT fk_ponto_aluno_mesmo_motorista FOREIGN KEY (aluno_id) REFERENCES public.aluno(id) ON DELETE CASCADE;


--
-- Name: ponto_rota fk_ponto_escola_mesmo_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT fk_ponto_escola_mesmo_motorista FOREIGN KEY (escola_id, motorista_id) REFERENCES public.escola(id, motorista_id) ON DELETE CASCADE;


--
-- Name: ponto_rota fk_ponto_rota_escola_turno; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT fk_ponto_rota_escola_turno FOREIGN KEY (escola_id, escola_turno_id) REFERENCES public.escola_turno(escola_id, id) ON DELETE SET NULL (escola_turno_id);


--
-- Name: ponto_rota fk_ponto_rota_mesmo_motorista; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ponto_rota
    ADD CONSTRAINT fk_ponto_rota_mesmo_motorista FOREIGN KEY (rota_id, motorista_id) REFERENCES public.rota(id, motorista_id) ON DELETE CASCADE;


--
-- Name: fotocopia_contrato fk_snapshot_documento; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotocopia_contrato
    ADD CONSTRAINT fk_snapshot_documento FOREIGN KEY (contrato_documento_id) REFERENCES public.contrato_documento(id) ON DELETE CASCADE;


--
-- Name: fotocopia_contrato fk_snapshot_responsavel; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fotocopia_contrato
    ADD CONSTRAINT fk_snapshot_responsavel FOREIGN KEY (responsavel_id) REFERENCES public.responsavel(id) ON DELETE RESTRICT;


--
-- Name: link_assinatura link_assinatura_contrato_documento_id_responsavel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.link_assinatura
    ADD CONSTRAINT link_assinatura_contrato_documento_id_responsavel_id_fkey FOREIGN KEY (contrato_documento_id, responsavel_id) REFERENCES public.contrato_documento(id, responsavel_id) ON DELETE CASCADE;


--
-- Name: notificacao notificacao_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificacao
    ADD CONSTRAINT notificacao_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: regra_financeira regra_financeira_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regra_financeira
    ADD CONSTRAINT regra_financeira_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: responsavel responsavel_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.responsavel
    ADD CONSTRAINT responsavel_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- Name: rota_dia_semana rota_dia_semana_rota_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rota_dia_semana
    ADD CONSTRAINT rota_dia_semana_rota_id_fkey FOREIGN KEY (rota_id) REFERENCES public.rota(id) ON DELETE CASCADE;


--
-- Name: rota rota_motorista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rota
    ADD CONSTRAINT rota_motorista_id_fkey FOREIGN KEY (motorista_id) REFERENCES public.motorista(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict JJGpnxjYpM45KSYdJL0G7VVoVH0tyjo6da9iz7eFupWen0ppFs43v4iTReyP9Sa

