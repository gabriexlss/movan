export const situacoesContrato = {
    ativo: 'Ativo',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
    rascunho: 'Rascunho',
    pendente: 'Pendente',
}

export const situacoesBanco = {
    RASCUNHO: 'rascunho',
    AGUARDANDO_ASSINATURA: 'pendente',
    ATIVO: 'ativo',
    FINALIZADO: 'finalizado',
    CANCELADO: 'cancelado',
    INATIVO: 'cancelado',
    PENDENTE: 'pendente',
}

export const normalizarSituacaoContrato = (status) => (
    situacoesBanco[status] || String(status || '').toLocaleLowerCase('pt-BR')
)

export const adaptarContrato = (contrato) => ({
    ...contrato,
    id: contrato.contrato_id ?? contrato.id,
    titulo: 'Contrato de prestação de serviços',
    cliente: contrato.nome_responsavel || contrato.cliente || 'Não informado',
    aluno: contrato.nome_aluno || contrato.aluno || '',
    escola: contrato.nome_escola || contrato.escola || '',
    inicio: contrato.data_inicio || contrato.inicio || '',
    termino: contrato.data_fim || contrato.termino || '',
    situacao: normalizarSituacaoContrato(contrato.status || contrato.situacao),
})

export const formatarData = (data) => {
    if (!data) return 'Não informada'
    const [ano, mes, dia] = String(data).slice(0, 10).split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : String(data)
}

export const formatarMoeda = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'Não informado'
    const numero = Number(valor)
    if (!Number.isFinite(numero)) return String(valor)
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const extrairCaminhoAssinatura = (link) => {
    if (!link) return ''
    try {
        const url = new URL(link)
        if (url.pathname.startsWith('/assinar/')) {
            return url.pathname
        }
    } catch {
        if (String(link).startsWith('/assinar/')) {
            return String(link)
        }
    }
    return ''
}
