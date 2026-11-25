import api from "./api";

const converterTipoAPI = (tipo) => {
    if (tipo === 'Receita' || tipo === 'ENTRADA') return 'ENTRADA'
    if (tipo === 'Despesa' || tipo === 'SAIDA') return 'SAIDA'
    return tipo
}

//======================
//CRIAR REGISTRO
//======================
export const criarRegistro = async (entradas) => {
    const registro = {
        titulo: entradas.titulo,
        valor: entradas.valor,
        data_lancamento: entradas.data,
        tipo: converterTipoAPI(entradas.tipo),
        descricao: entradas.descricao,
    }


    const response = await api.post('/financeiro', registro, {skipGlobalErrorToast: true})
    return response.data.financeiro
}
//======================
// LISTAR REGISTROS FINANCEIROS
//======================
export const listarRegistros = async (entradas = {}) => {
    const params = {};

    if (entradas.data) {//filtar por mes
        const [ano, mes] = entradas.data.split("-");
        params.mes = `${mes}/${ano}`;
    }

    if (entradas.id) {//filtar por id do registro
        params.id = entradas.id;
    }

    const response = await api.get("/financeiro", {
        params,
        skipGlobalErrorToast: true
    });

    return response.data.financeiro;
};

//======================
//ALTERAR REGISTRO
//======================
export const alterarRegistro = async (id, entradas) => {
    const registro = {
        titulo: entradas.titulo,
        valor: entradas.valor,
        data_lancamento: entradas.data,
        tipo: converterTipoAPI(entradas.tipo),
        descricao: entradas.descricao,
    }

    const response = await api.patch(`/financeiro/${id}`, registro, {skipGlobalErrorToast: true})
    return response.data.financeiro || entradas
}

//======================
//EXCLUIR REGISTRO
//======================
export const excluirRegistro = async (id) => {
    const response = await api.delete(`/financeiro/${id}`, {skipGlobalErrorToast: true})
    return response.data.financeiro
}

//======================
//SUMARIO FINANCEIRO
//======================
export const obterSumarioFinanceiro = async (entradas = {}) => {
    const params = {}

    if (entradas.data) {
        const [ano, mes] = entradas.data.split('-')
        params.mes = `${mes}/${ano}`
    }

    if (entradas.tipo) {
        params.tipo = entradas.tipo
    }

    const response = await api.get('/financeiro/sumario', {
        params,
        skipGlobalErrorToast: true
    })

    return response.data.valorFinal ?? response.data.valor ?? 0
}

















//======================
// LISTAR MENSALIDADES
//======================
export const listarMensalidades = async (entradas = {}) => { 
    const params = {};

    if (entradas.aluno_id) {//filtar por aluno_id
        params.aluno_id = entradas.aluno_id;
    }

    if (entradas.data) {//filtrar por mes
        const [ano, mes] = entradas.data.split("-");
        params.mes = `${mes}/${ano}`;
    }

    if (entradas.status) {//filtar por status (Pago ou Pendente)
        params.status = entradas.status;
    }

    const response = await api.get(
        "/financeiro/mensalidade",
        {
            params,
            skipGlobalErrorToast: true
        }
    );

    return response.data.mensalidades;
};

//======================
//PAGAR MENSALIDADE
//======================
export const pagarMensalidade = async (id) => {
    const response = await api.patch(`/financeiro/mensalidade/${id}/pagar`, {}, {skipGlobalErrorToast: true}) //mando o id da mensalidade para o backend pagar
    return response.data.mensalidade //devolvo a resposta do backend
}