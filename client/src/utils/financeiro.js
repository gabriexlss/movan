const moedaBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

export const formatarMoeda = (valor) => moedaBRL.format(Number(valor) || 0)

export const formatarDataFinanceira = (data) => {
    if (!data) return ''

    const [ano, mes, dia] = String(data).substring(0, 10).split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : String(data)
}

export const STATUS_MENSALIDADE = {
    PAGA: { label: 'Pago', classe: 'pago' },
    PENDENTE: { label: 'Pendente', classe: 'pendente' },
    CANCELADA: { label: 'Cancelada', classe: 'cancelada' },
}
