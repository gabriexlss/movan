export const situacoesContrato = {
    ativo: 'Ativo',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
    rascunho: 'Rascunho',
    pendente: 'Pendente',
}

// Dados de exemplo, seguindo as listas de clientes e do financeiro.
export const contratos = [
    { id: 'C-001', titulo: 'Contrato de prestação de serviços', cliente: 'Bianca Nogueira', inicio: '2026-09-29', termino: '2027-05-01', situacao: 'ativo' },
    { id: 'C-002', titulo: 'Contrato de prestação de serviços', cliente: 'Thiago Teixeira', inicio: '2026-09-29', termino: '2027-05-01', situacao: 'ativo' },
    { id: 'C-003', titulo: 'Contrato de prestação de serviços', cliente: 'Carlos Fabrício', inicio: '2026-09-29', termino: '2027-05-01', situacao: 'ativo' },
    { id: 'C-004', titulo: 'Contrato de prestação de serviços', cliente: 'Ricardo Manuel', inicio: '2026-09-29', termino: '2027-05-01', situacao: 'ativo' },
    { id: 'C-005', titulo: 'Contrato de prestação de serviços', cliente: 'Bianca Nogueira', inicio: '2026-08-01', termino: '2027-06-30', situacao: 'ativo' },
    { id: 'C-006', titulo: 'Contrato de prestação de serviços', cliente: 'Thiago Teixeira', inicio: '2026-11-01', termino: '2027-06-30', situacao: 'pendente' },
    { id: 'C-007', titulo: 'Contrato de prestação de serviços', cliente: 'Carlos Fabrício', inicio: '2026-02-01', termino: '2026-07-31', situacao: 'finalizado' },
    { id: 'C-008', titulo: 'Contrato de prestação de serviços', cliente: 'Ricardo Manuel', inicio: '2026-06-01', termino: '2026-07-31', situacao: 'cancelado' },
    { id: 'C-009', titulo: 'Contrato de prestação de serviços', cliente: 'Bianca Nogueira', inicio: '2026-11-01', termino: '2027-06-30', situacao: 'rascunho' },
]

export const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}
