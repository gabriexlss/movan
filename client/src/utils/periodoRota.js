export const obterDiaSemanaAtual = (data = new Date()) => {
    const dia = data.getDay()
    const mapa = { 1: 'SEGUNDA', 2: 'TERÇA', 3: 'QUARTA', 4: 'QUINTA', 5: 'SEXTA' }
    return mapa[dia] || 'SEGUNDA'
}

export const obterTurnoAtual = (data = new Date()) => {
    const hora = data.getHours()
    if (hora < 12) return 'MANHA'
    if (hora < 18) return 'TARDE'
    return 'NOITE'
}

const pertenceAoTurno = (turnoRegistro, turnoAlvo) => {
    const turno = String(turnoRegistro || '').toUpperCase()
    if (!turno) return false
    if (turno === turnoAlvo) return true
    if (turnoAlvo === 'MANHA') return turno === 'INTEGRAL' || turno === 'INTEGRAL-MANHA'
    if (turnoAlvo === 'TARDE') return turno === 'INTEGRAL' || turno === 'INTEGRAL-TARDE'
    return false
}

export const calcularResumoAlunos = ({
    alunos = [],
    turnosEscola = [],
    rotasDoDia = [],
    pontosPorRotaId = {},
    turnoAtual = obterTurnoAtual(),
}) => {
    const cadastrados = Array.isArray(alunos) ? alunos.length : 0
    if (cadastrados === 0) {
        return { cadastrados: 0, ausentes: 0 }
    }

    const turnosPorId = new Map((turnosEscola || []).map((t) => [String(t.id), t.turno]))
    const alunosDoTurno = alunos.filter((aluno) => (
        pertenceAoTurno(turnosPorId.get(String(aluno.escola_turno_id)), turnoAtual)
    ))

    const rotasDoTurno = (rotasDoDia || []).filter((rota) => (
        String(rota.turno || '').toUpperCase() === turnoAtual && rota.ativa !== false
    ))

    if (alunosDoTurno.length === 0 || rotasDoTurno.length === 0) {
        return { cadastrados, ausentes: 0 }
    }

    const conjuntosPresenca = rotasDoTurno.map((rota) => {
        const pontos = pontosPorRotaId?.[rota.id] || pontosPorRotaId?.[String(rota.id)] || []
        return new Set(
            pontos
                .filter((p) => p.aluno_id != null)
                .map((p) => String(p.aluno_id)),
        )
    })

    const ausentes = alunosDoTurno.reduce(
        (total, aluno) => total + (conjuntosPresenca.every((conjunto) => conjunto.has(String(aluno.id))) ? 0 : 1),
        0,
    )

    return { cadastrados, ausentes }
}
