import { segundosRetryAfter } from './codeCooldown'

export const mensagemErroApi = (error, mensagemPadrao) => {
    const dados = error.response?.data
    const errosDeCampo = Object.values(dados?.erro || {}).flatMap((campo) => campo?._errors || [])
    const mensagem = errosDeCampo.join(' ') || (typeof dados === 'string' ? dados : dados?.msg) || mensagemPadrao

    if (error.response?.status === 429) {
        const segundos = segundosRetryAfter(error.response.headers)
        return segundos === null ? mensagem : `${mensagem} Aguarde ${segundos} segundos antes de tentar novamente.`
    }

    return mensagem
}
