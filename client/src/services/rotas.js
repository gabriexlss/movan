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

        const response = await api.get('/rota', { params, skipGlobalErrorToast: true })
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
        const response = await api.get(`/rota/${rotaId}/pontos`, { skipGlobalErrorToast: true })
        return response.data.pontos || []
    } catch (erro) {
        if (erro.response?.status === 404) {
            return []
        }
        throw erro
    }
}

//==========================
//MOVER PONTOS DE UMA ROTA
//==========================
export const moverPontosRota = async (rotaId, from, to) => {
    const response = await api.post(`/rota/${rotaId}/pontos/mover`, null, {
        params: { from, to },
        skipGlobalErrorToast: true,
    })
    return response.data
}

//==========================
//OTIMIZAR ROTA
//==========================
export const otimizarRota = async (rotaId, { latitude, longitude }) => {
    const response = await api.post(`/rota/${rotaId}/otimizar`, { latitude, longitude }, {
        skipGlobalErrorToast: true,
    })
    return response.data
}

//==========================
//OBTER POLYLINE DE UMA ROTA
//==========================
export const obterPolylineRota = async (rotaId, coordenadas) => {
    try {
        const params = {}
        if (coordenadas?.latitude != null && coordenadas?.longitude != null) {
            params.latitude = coordenadas.latitude
            params.longitude = coordenadas.longitude
        }

        const response = await api.get(`/rota/${rotaId}/polyline`, { params, skipGlobalErrorToast: true })
        return response.data.polyline || null
    } catch {
        return null
    }
}
