import api from './api'

export const obterAssinaturaMotorista = async (signal) => {
    const response = await api.get('/contrato/assinatura-motorista', {
        signal,
        skipGlobalErrorToast: true,
        timeout: 30000,
    })
    return response.data.assinatura ?? null
}

export const salvarAssinaturaMotorista = async (imagem) => {
    const dados = new FormData()
    dados.append('assinatura', imagem, 'assinatura.webp')
    const response = await api.post('/contrato/assinatura-motorista', dados, {
        headers: { 'Content-Type': undefined },
        skipGlobalErrorToast: true,
        timeout: 60000,
    })
    return response.data.assinatura ?? null
}

export const obterContratoParaAssinatura = async (token, signal) => {
    const response = await api.get(`/contrato/assinar/${encodeURIComponent(token)}`, {
        signal,
        skipAuthExpired: true,
        skipGlobalErrorToast: true,
        timeout: 30000,
    })
    return response.data
}

export const assinarContratoResponsavel = async (token, imagem) => {
    const dados = new FormData()
    dados.append('assinatura', imagem, 'assinatura.webp')
    const response = await api.post(`/contrato/assinar/${encodeURIComponent(token)}`, dados, {
        headers: { 'Content-Type': undefined },
        skipAuthExpired: true,
        skipGlobalErrorToast: true,
        timeout: 60000,
    })
    return response.data
}
