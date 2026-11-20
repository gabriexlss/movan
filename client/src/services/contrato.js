import api from './api'

const formatarValorMensal = (valor) => Number(String(valor).replace(',', '.'))

//==========================
//LISTAR CONTRATOS
//==========================
export const listarContratos = async () => {
    const response = await api.get('/contrato', { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data.contrato || []
}

//==========================
//OBTER CONTRATO ESPECIFICO
//==========================
export const obterContrato = async (id) => {
    const response = await api.get(`/contrato/${id}`, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data.contrato
}

//==========================
//CRIAR CONTRATO
//==========================
export const criarContrato = async (valores) => {
    const contrato = {
        data_inicio: valores.inicio,
        data_fim: valores.termino,
        dia_vencimento: Number(valores.diaVencimento),
        valor_mensal: formatarValorMensal(valores.valorMensal),
        aluno_id: Number(valores.alunoId),
    }

    const response = await api.post('/contrato', contrato, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

//==========================
//EDITAR CONTRATO (RASCUNHO)
//==========================
export const editarContrato = async (contratoId, valores) => {
    const contrato = {}

    if (valores.inicio) contrato.data_inicio = valores.inicio
    if (valores.termino) contrato.data_fim = valores.termino
    if (valores.diaVencimento !== '' && valores.diaVencimento !== undefined) {
        contrato.dia_vencimento = Number(valores.diaVencimento)
    }
    if (valores.valorMensal !== '' && valores.valorMensal !== undefined) {
        contrato.valor_mensal = formatarValorMensal(valores.valorMensal)
    }

    const response = await api.patch(`/contrato/${contratoId}`, contrato, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

//==========================
//EXCLUIR CONTRATO (RASCUNHO)
//==========================
export const excluirContrato = async (contratoId) => {
    const response = await api.delete(`/contrato/${contratoId}`, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

//==========================
//FINALIZAR CONTRATO
//==========================
export const finalizarContrato = async (contratoId) => {
    const response = await api.post(
        `/contrato/finalizar-contrato/${contratoId}`,
        {},
        { timeout: 60000, skipAuthExpired: true, skipGlobalErrorToast: true },
    )
    return response.data
}

//==========================
//CANCELAR CONTRATO
//==========================
export const cancelarContrato = async (contratoId, motivoCancelamento) => {
    const response = await api.post(
        `/contrato/cancelar-contrato/${contratoId}`,
        { motivo_cancelamento: motivoCancelamento },
        { skipGlobalErrorToast: true, timeout: 30000 },
    )
    return response.data
}

//==========================
//RECRIAR LINK DE ASSINATURA
//==========================
export const recriarLinkContrato = async (contratoId) => {
    const response = await api.post(
        `/contrato/recriar-link/${contratoId}`,
        {},
        { skipGlobalErrorToast: true, timeout: 30000 },
    )
    return response.data
}

//==========================
//CLAUSULAS DO CONTRATO
//==========================
export const criarClausula = async (contratoId, valores) => {
    const clausula = {
        titulo: valores.titulo.trim(),
        conteudo: valores.conteudo.trim(),
    }

    const response = await api.post(`/contrato/${contratoId}/clausula`, clausula, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const editarClausula = async (contratoId, ordem, valores) => {
    const clausula = {}
    if (valores.titulo !== undefined) clausula.titulo = valores.titulo.trim()
    if (valores.conteudo !== undefined) clausula.conteudo = valores.conteudo.trim()

    const response = await api.patch(`/contrato/${contratoId}/clausula/${ordem}`, clausula, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const excluirClausula = async (contratoId, ordem) => {
    const response = await api.delete(`/contrato/${contratoId}/clausula/${ordem}`, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const moverClausula = async (contratoId, from, to) => {
    const response = await api.post(
        `/contrato/${contratoId}/clausula/mover`,
        {},
        { params: { from, to }, skipGlobalErrorToast: true, timeout: 30000 },
    )
    return response.data
}

//==========================
//CLAUSULAS PADRAO DO MOTORISTA
//==========================
export const listarClausulasPadrao = async () => {
    const response = await api.get('/contrato/clausula/padrao', { skipGlobalErrorToast: true, timeout: 30000 })
    return {
        clausulasMotorista: response.data.ClausulasMotorista || [],
        clausulasSistema: response.data.ClausulasSistema || [],
    }
}

export const criarClausulaPadrao = async (valores) => {
    const clausula = {
        titulo: valores.titulo.trim(),
        conteudo: valores.conteudo.trim(),
    }

    const response = await api.post('/contrato/clausula/padrao', clausula, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const editarClausulaPadrao = async (ordem, valores) => {
    const clausula = {}
    if (valores.titulo !== undefined) clausula.titulo = valores.titulo.trim()
    if (valores.conteudo !== undefined) clausula.conteudo = valores.conteudo.trim()

    const response = await api.patch(`/contrato/clausula/padrao/${ordem}`, clausula, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const excluirClausulaPadrao = async (ordem) => {
    const response = await api.delete(`/contrato/clausula/padrao/${ordem}`, { skipGlobalErrorToast: true, timeout: 30000 })
    return response.data
}

export const moverClausulaPadrao = async (from, to) => {
    const response = await api.post(
        '/contrato/clausula/padrao/mover',
        {},
        { params: { from, to }, skipGlobalErrorToast: true, timeout: 30000 },
    )
    return response.data
}
