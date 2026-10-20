export const rotasCodigo = {
    cadastro: '/motorista/codigo/CRIACAO',
    recuperacao: '/motorista/recuperar-conta/enviar-codigo',
    atualizar: '/motorista/editar/enviar-codigo',
}

export const INTERVALO_CODIGO = 300
const chavePrazo = (rota) => `movan:codeCooldown:${rota}`

export const segundosRetryAfter = (headers, agora = Date.now()) => {
    const valor = headers?.['retry-after']
    if (valor === undefined || valor === null || valor === '') return null
    const segundos = Number(valor)
    if (Number.isFinite(segundos) && segundos >= 0) return Math.ceil(segundos)
    const data = Date.parse(valor)
    return Number.isFinite(data) ? Math.max(0, Math.ceil((data - agora) / 1000)) : null
}

export const registrarPrazoCodigo = (rota, segundos = INTERVALO_CODIGO) => {
    if (!Object.values(rotasCodigo).includes(rota)) return
    sessionStorage.setItem(chavePrazo(rota), String(Date.now() + segundos * 1000))
}

export const tempoCodigoRestante = (fluxo) => {
    const prazo = Number(sessionStorage.getItem(chavePrazo(rotasCodigo[fluxo])))
    return Number.isFinite(prazo) ? Math.max(0, Math.ceil((prazo - Date.now()) / 1000)) : 0
}

export const formatarTempo = (segundos) => `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')}`
