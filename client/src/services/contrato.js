import api from './api'

export const listarContratos = async () => {
    const response = await api.get('/contrato', { skipGlobalErrorToast: true })
    return response.data.contrato || []
}

export const obterContrato = async (id) => {
    const response = await api.get(`/contrato/${id}`, { skipGlobalErrorToast: true })
    return response.data.contrato
}