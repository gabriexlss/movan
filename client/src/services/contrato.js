import api from './api'

//==========================
//LISTAR CONTRATOS
//==========================
export const listarContratos = async () => {
    const response = await api.get('/contrato', { skipGlobalErrorToast: true, timeout: 30000 }) //peço os contratos para o backend
    return response.data.contrato || [] //devolvo a lista de contratos ou uma lista vazia
}

//==========================
//OBTER CONTRATO ESPECIFICO
//==========================
export const obterContrato = async (id) => {
    const response = await api.get(`/contrato/${id}`, { skipGlobalErrorToast: true, timeout: 30000 }) //peço os dados do contrato para o backend
    return response.data.contrato //devolvo o contrato encontrado
}

//==========================
//LISTAR CLAUSULAS PADRAO
//==========================
export const listarClausulasPadrao = async () => {
    const response = await api.get('/contrato/clausula/padrao', { skipGlobalErrorToast: true }) //peço as cláusulas padrão do motorista
    return response.data.ClausulasMotorista || [] //devolvo as cláusulas ou uma lista vazia
}

//==========================
//CRIAR CONTRATO
//==========================
export const criarContrato = async (valores) => {
    const contrato = { //guardo os dados no formato que o backend espera
        data_inicio: valores.inicio,
        data_fim: valores.termino,
        dia_vencimento: Number(valores.diaVencimento),
        valor_mensal: Number(String(valores.valorMensal).replace(',', '.')),
        aluno_id: Number(valores.alunoId),
    }

    const response = await api.post('/contrato', contrato, { timeout: 30000 }) //mando os dados para criar o contrato
    return response.data //devolvo a resposta do backend
}

//==========================
//CRIAR CLAUSULA
//==========================
export const criarClausula = async (contratoId, valores) => {
    const clausula = { //guardo os dados da cláusula no formato esperado pelo backend
        titulo: valores.titulo,
        conteudo: valores.conteudo,
    }

    const response = await api.post(`/contrato/${contratoId}/clausula`, clausula, { timeout: 30000 }) //mando a cláusula para o contrato
    return response.data //devolvo a resposta do backend
}

//==========================
//FINALIZAR CONTRATO
//==========================
export const finalizarContrato = async (contratoId) => {
    const response = await api.post(`/contrato/finalizar-contrato/${contratoId}`, {}, { timeout: 60000, skipAuthExpired: true, skipGlobalErrorToast: true }) //mando um corpo JSON válido sem encerrar a sessão por causa de uma regra do contrato
    return response.data //devolvo o link de assinatura e a mensagem do backend
}