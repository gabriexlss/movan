import api from './api'

export const listarTurnosEscola = async (escolaId) => {
    const params = escolaId ? { escola_id: Number(escolaId) } : undefined
    const response = await api.get('/escola/turno', {
        params,
        skipGlobalErrorToast: true,
    })
    return response.data.turnos || []
}

export const criarTurnoEscola = async (valores) => {
    const response = await api.post('/escola/turno', {
        turno: valores.turno,
        hora_entrada: valores.horaEntrada,
        hora_saida: valores.horaSaida,
        escola_id: Number(valores.escolaId),
    }, { skipGlobalErrorToast: true })
    return response.data.turno
}

export const alterarTurnoEscola = async (id, valores) => {
    const response = await api.patch(`/escola/turno/${id}`, {
        turno: valores.turno,
        hora_entrada: valores.horaEntrada,
        hora_saida: valores.horaSaida,
    }, { skipGlobalErrorToast: true })
    return response.data.turno || valores
}

export const excluirTurnoEscola = async (id) => {
    await api.delete(`/escola/turno/${id}`, { skipGlobalErrorToast: true })
}