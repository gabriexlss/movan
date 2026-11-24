import { useEffect, useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { RiGraduationCapLine } from 'react-icons/ri'

import DefaultCard from './DefaultCard'
import { listarRotas, obterPontosRota } from '../../services/rotas'
import { listarEscola } from '../../services/escola'
import { listarTurnosEscola } from '../../services/turnosEscola'
import { obterDiaSemanaAtual } from '../../utils/periodoRota'
import styles from './CardRotas.module.css'

const ITENS_POR_PAGINA = 3

const nomesTurnoAmigaveis = {
    MANHA: 'manhã',
    TARDE: 'tarde',
    NOITE: 'noite',
}

const montarEscolasRotas = (rotasDoDia = [], pontosPorRotaId = {}, todasEscolas = [], todosTurnos = []) => {
    const itensEncontrados = []
    const chavesVistas = new Set()

    rotasDoDia.forEach((rota) => {
        const pontos = pontosPorRotaId?.[rota.id] || pontosPorRotaId?.[String(rota.id)] || []
        const pontosComEscola = pontos.filter((p) => p.escola_id != null)

        pontosComEscola.forEach((p) => {
            const chave = `${p.escola_id}-${rota.turno}`
            if (!chavesVistas.has(chave)) {
                chavesVistas.add(chave)
                const escola = todasEscolas.find((e) => String(e.id) === String(p.escola_id))
                if (escola) {
                    // Tenta obter o horário pelo escola_turno_id do ponto ou pelo turno da escola
                    const turnoInfo = (p.escola_turno_id
                        && todosTurnos.find((t) => String(t.id) === String(p.escola_turno_id)))
                        || todosTurnos.find(
                            (t) => String(t.escola_id) === String(escola.id)
                                && String(t.turno).toUpperCase() === String(rota.turno).toUpperCase(),
                        )

                    const horarioBruto = rota.sentido === 'VOLTA'
                        ? (turnoInfo?.hora_saida || turnoInfo?.hora_entrada)
                        : turnoInfo?.hora_entrada
                    const horarioTexto = horarioBruto
                        ? String(horarioBruto).slice(0, 5)
                        : nomesTurnoAmigaveis[rota.turno] || rota.turno.toLowerCase()

                    itensEncontrados.push({
                        nome: escola.nome,
                        horario: horarioTexto,
                    })
                }
            }
        })
    })

    return itensEncontrados
}

const CardRotas = ({ dadosHome }) => {
    const [pagina, setPagina] = useState(0)
    const [estadoInterno, setEstadoInterno] = useState({
        escolasRotas: [],
        carregando: true,
    })

    useEffect(() => {
        if (dadosHome) return undefined
        let montado = true
        const carregar = async () => {
            try {
                const dia = obterDiaSemanaAtual()
                const [rotasDoDia, todasEscolas, todosTurnos] = await Promise.all([
                    listarRotas({ dia }),
                    listarEscola(),
                    listarTurnosEscola(),
                ])

                // Buscar pontos de cada rota do dia para descobrir quais escolas são atendidas hoje
                const paresPontos = await Promise.all(
                    rotasDoDia.map(async (r) => [r.id, await obterPontosRota(r.id)]),
                )
                const pontosPorRotaId = Object.fromEntries(paresPontos)
                const itensEncontrados = montarEscolasRotas(rotasDoDia, pontosPorRotaId, todasEscolas, todosTurnos)

                if (montado) {
                    setEstadoInterno({
                        escolasRotas: itensEncontrados,
                        carregando: false,
                    })
                }
            } catch {
                if (montado) {
                    setEstadoInterno({
                        escolasRotas: [],
                        carregando: false,
                    })
                }
            }
        }

        carregar()

        return () => {
            montado = false
        }
    }, [dadosHome])

    const carregando = dadosHome ? dadosHome.carregando : estadoInterno.carregando

    const escolasRotas = useMemo(() => {
        if (!dadosHome) return estadoInterno.escolasRotas
        if (dadosHome.carregando || dadosHome.erroRotas || dadosHome.erroEscolas || dadosHome.erroTurnos) return []
        return montarEscolasRotas(
            dadosHome.rotasDoDia,
            dadosHome.pontosPorRotaId,
            dadosHome.escolas,
            dadosHome.turnosEscola,
        )
    }, [dadosHome, estadoInterno.escolasRotas])

    const totalPaginas = Math.max(1, Math.ceil(escolasRotas.length / ITENS_POR_PAGINA))
    const inicio = pagina * ITENS_POR_PAGINA
    const escolasExibidas = escolasRotas.slice(inicio, inicio + ITENS_POR_PAGINA)

    return (
        <DefaultCard
            title="Rotas diárias"
            link="/rota"
            linkLabel="Ver rotas no mapa"
            headerContent={(
                <nav className={styles.paginacao} aria-label="Páginas de rotas diárias">
                    <button
                        type="button"
                        aria-label="Página anterior"
                        disabled={pagina === 0}
                        onClick={() => setPagina((paginaAtual) => paginaAtual - 1)}
                    >
                        <FaChevronLeft aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{pagina + 1}</span>
                    <button
                        type="button"
                        aria-label="Próxima página"
                        disabled={pagina + 1 >= totalPaginas}
                        onClick={() => setPagina((paginaAtual) => paginaAtual + 1)}
                    >
                        <FaChevronRight aria-hidden="true" />
                    </button>
                </nav>
            )}
        >
            <div className={styles.containerEscolas}>
                {carregando ? (
                    <div className={styles.textoEscola} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        <span>Carregando rotas...</span>
                    </div>
                ) : escolasRotas.length === 0 ? (
                    <div className={styles.textoEscola} style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                        <span>Nenhuma rota com escolas para hoje.</span>
                    </div>
                ) : (
                    escolasExibidas.map((escola, indice) => (
                        <div className={styles.escola} key={`${escola.nome}-${escola.horario}-${indice}`}>
                            <RiGraduationCapLine className={styles.iconEscola} aria-hidden="true" />

                            <div className={styles.textoEscola}>
                                <p>{escola.nome}</p>
                                <span>horário: {escola.horario}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DefaultCard>
    )
}

export default CardRotas
