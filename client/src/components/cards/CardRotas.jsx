import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { RiGraduationCapLine } from 'react-icons/ri'

import DefaultCard from './DefaultCard'
import { listarRotas, obterPontosRota } from '../../services/rotas'
import { listarEscola } from '../../services/escola'
import { listarTurnosEscola } from '../../services/turnosEscola'
import styles from './CardRotas.module.css'

const ITENS_POR_PAGINA = 3

const nomesTurnoAmigaveis = {
    MANHA: 'manhã',
    TARDE: 'tarde',
    NOITE: 'noite',
}

const obterDiaSemanaAtual = () => {
    const dia = new Date().getDay()
    const mapa = { 1: 'SEGUNDA', 2: 'TERÇA', 3: 'QUARTA', 4: 'QUINTA', 5: 'SEXTA' }
    return mapa[dia] || 'SEGUNDA'
}

const CardRotas = () => {
    const [pagina, setPagina] = useState(0)
    const [escolasRotas, setEscolasRotas] = useState([])
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
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
                const pontosPromises = rotasDoDia.map((r) => obterPontosRota(r.id))
                const resultadosPontos = await Promise.all(pontosPromises)

                const itensEncontrados = []
                const chavesVistas = new Set()

                rotasDoDia.forEach((rota, idx) => {
                    const pontos = resultadosPontos[idx] || []
                    const pontosComEscola = pontos.filter((p) => p.escola_id != null)

                    pontosComEscola.forEach((p) => {
                        const chave = `${p.escola_id}-${rota.turno}`
                        if (!chavesVistas.has(chave)) {
                            chavesVistas.add(chave)
                            const escola = todasEscolas.find((e) => String(e.id) === String(p.escola_id))
                            if (escola) {
                                // Tenta obter o horário de entrada/saída do turno daquela escola
                                const turnoInfo = todosTurnos.find(
                                    (t) => String(t.escola_id) === String(escola.id) &&
                                           String(t.turno).toUpperCase() === String(rota.turno).toUpperCase()
                                )

                                const horarioTexto = turnoInfo?.hora_entrada
                                    ? String(turnoInfo.hora_entrada).slice(0, 5)
                                    : nomesTurnoAmigaveis[rota.turno] || rota.turno.toLowerCase()

                                itensEncontrados.push({
                                    nome: escola.nome,
                                    horario: horarioTexto,
                                })
                            }
                        }
                    })
                })

                if (montado) {
                    setEscolasRotas(itensEncontrados)
                }
            } catch {
                if (montado) {
                    setEscolasRotas([])
                }
            } finally {
                if (montado) {
                    setCarregando(false)
                }
            }
        }

        carregar()

        return () => {
            montado = false
        }
    }, [])

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
