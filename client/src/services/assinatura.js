import api from './api'

export const obterAssinaturaMotorista = async (signal) => {
    const response = await api.get('/contrato/assinatura-motorista', {
        signal,
        skipGlobalErrorToast: true,
    })
    return response.data.assinatura
}

export const salvarAssinaturaMotorista = async (imagem) => {
    const dados = new FormData()
    dados.append('assinatura', imagem, 'assinatura.webp')
    const response = await api.post('/contrato/assinatura-motorista', dados, {
        headers: { 'Content-Type': undefined },
        skipGlobalErrorToast: true,
        timeout: 60000,
    })
    return response.data.assinatura
}
