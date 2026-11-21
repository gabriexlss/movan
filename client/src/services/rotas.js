import api from './api'

//==========================
//LISTAR ROTAS (com filtros opcionais)
//==========================
export const listarRotas = async (filtros = {}) => {
    try {
        const params = {}
        if (filtros.turno) params.turno = filtros.turno
        if (filtros.sentido) params.sentido = filtros.sentido
        if (filtros.dia) params.dia = filtros.dia
        if (filtros.id) params.id = filtros.id

        const response = await api.get('/rota', { params, skipGlobalErrorToast: true, timeout: 30000 })
        return response.data.rotas || []
    } catch (erro) {
        if (erro.response?.status === 404) {
            return []
        }
        throw erro
    }
}

//==========================
//OBTER PONTOS DE UMA ROTA
//==========================
export const obterPontosRota = async (rotaId) => {
    try {
        const response = await api.get(`/rota/${rotaId}/pontos`, { skipGlobalErrorToast: true, timeout: 30000 })
        return response.data.pontos || []
    } catch (erro) {
        if (erro.response?.status === 404) {
            return []
        }
        throw erro
    }
}

//==========================
//ADICIONAR PONTO (ALUNO) A ROTA
//==========================
export const adicionarPontoRota = async (rotaId, alunoId) => {
    const response = await api.post(
        `/rota/${rotaId}/pontos`,
        { aluno_id: Number(alunoId) },
        { skipGlobalErrorToast: true, timeout: 30000 },
    )
    return response.data
}

//==========================
//EXCLUIR PONTO DA ROTA
//==========================
export const excluirPontoRota = async (rotaId, pontoId) => {
    const response = await api.delete(`/rota/${rotaId}/pontos/${pontoId}`, {
        skipGlobalErrorToast: true,
        timeout: 30000,
    })
    return response.data
}

//==========================
//MOVER PONTOS DE UMA ROTA
//==========================
export const moverPontosRota = async (rotaId, from, to) => {
    const response = await api.post(`/rota/${rotaId}/pontos/mover`, {}, {
        params: { from, to },
        skipGlobalErrorToast: true,
        timeout: 30000,
    })
    return response.data
}

//==========================
//OTIMIZAR ROTA
//==========================
export const otimizarRota = async (rotaId, { latitude, longitude }) => {
    const response = await api.post(
        `/rota/${rotaId}/otimizar`,
        { latitude: Number(latitude), longitude: Number(longitude) },
        { skipGlobalErrorToast: true, timeout: 60000 },
    )
    return response.data
}

//==========================
//OBTER POLYLINE DE UMA ROTA
//==========================
export const obterPolylineRota = async (rotaId, coordenadas, signal) => {
    try {
        const params = {}
        if (coordenadas?.latitude != null && coordenadas?.longitude != null) {
            params.latitude = coordenadas.latitude
            params.longitude = coordenadas.longitude
        }

        const response = await api.get(`/rota/${rotaId}/polyline`, {
            params,
            signal,
            skipGlobalErrorToast: true,
            timeout: 30000,
        })
        return response.data.polyline || null
    } catch {
        return null
    }
}
