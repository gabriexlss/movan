import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuUserRound } from 'react-icons/lu'
import { TbArrowsExchange2, TbSunFilled, TbSunset2Filled } from 'react-icons/tb'
import { IoMoon } from 'react-icons/io5'
import { RiGraduationCapLine } from 'react-icons/ri'

import TituloTela from '../../components/layout/tituloTela'
import MapaRota from './MapaRota'
import { listarRotas, obterPontosRota } from '../../services/rotas'
import { listarAluno } from '../../services/aluno'
import { listarEscola } from '../../services/escola'
import { listarTurnosEscola } from '../../services/turnosEscola'
import styles from './rota.module.css'

const TURNOS = [
    { id: 'MANHA', nome: 'Manhã', icone: TbSunFilled, cor: '#F4C51F' },
    { id: 'TARDE', nome: 'Tarde', icone: TbSunset2Filled, cor: '#e7a01c' },
    { id: 'NOITE', nome: 'Noite', icone: IoMoon, cor: '#a6e7f3' },
]

const SENTIDOS = [
    { id: 'IDA', nome: 'Ida' },
    { id: 'VOLTA', nome: 'Volta' },
]

// Identifica o dia da semana atual para enviar ao backend (padrão Seg-Sex)
const obterDiaSemanaAtual = () => {
    const dia = new Date().getDay() // 0=dom, 1=seg...6=sab
    const mapa = { 1: 'SEGUNDA', 2: 'TERÇA', 3: 'QUARTA', 4: 'QUINTA', 5: 'SEXTA' }
    return mapa[dia] || 'SEGUNDA'
}

const formatarHora = (hora) => {
    if (!hora) return ''
    return String(hora).slice(0, 5)
}

const Rotas = () => {
    const [turno, setTurno] = useState('MANHA')
    const [sentido, setSentido] = useState('IDA')

    const [rotas, setRotas] = useState([])
    const [pontos, setPontos] = useState([])
    const [alunos, setAlunos] = useState([])
    const [escolas, setEscolas] = useState([])
    const [turnosEscola, setTurnosEscola] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [escolaSelecionadaId, setEscolaSelecionadaId] = useState(null)

    // Data por extenso para o subtítulo (ex.: "Quarta-feira, 18 de novembro")
    const dataSubtitulo = useMemo(() => {
        try {
            const formatador = new Intl.DateTimeFormat('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            })
            const texto = formatador.format(new Date())
            return texto.charAt(0).toUpperCase() + texto.slice(1)
        } catch {
            return ''
        }
    }, [])

    // Buscar alunos, escolas e turnos ao carregar a página
    useEffect(() => {
        let montado = true
        const carregarDadosBase = async () => {
            try {
                const [dadosAlunos, dadosEscolas, dadosTurnos] = await Promise.all([
                    listarAluno(),
                    listarEscola(),
                    listarTurnosEscola(),
                ])
                if (montado) {
                    setAlunos(dadosAlunos || [])
                    setEscolas(dadosEscolas || [])
                    setTurnosEscola(dadosTurnos || [])
                }
            } catch {
                // interceptor cuida do erro ou toast
            }
        }
        carregarDadosBase()
        return () => {
            montado = false
        }
    }, [])

    // Buscar rotas quando turno ou sentido mudam, informando o dia atual ao backend
    useEffect(() => {
        let montado = true
        const carregarRotasFiltradas = async () => {
            setCarregando(true)
            try {
                const dia = obterDiaSemanaAtual()
                const dados = await listarRotas({ turno, dia, sentido })
                if (montado) {
                    setRotas(dados || [])
                }
            } catch {
                if (montado) {
                    setRotas([])
                }
            } finally {
                if (montado) {
                    setCarregando(false)
                }
            }
        }
        carregarRotasFiltradas()
        return () => {
            montado = false
        }
    }, [turno, sentido])

    // A rota atual é a rota correspondente ao filtro (turno + dia + sentido)
    const rotaAtual = rotas[0] || null
    const rotaAtualId = rotaAtual?.id

    // Buscar pontos quando a rota atual muda
    useEffect(() => {
        let montado = true
        if (!rotaAtualId) {
            return
        }

        const carregarPontos = async () => {
            try {
                const dados = await obterPontosRota(rotaAtualId)
                if (montado) {
                    setPontos(dados || [])
                }
            } catch {
                if (montado) {
                    setPontos([])
                }
            }
        }
        carregarPontos()
        return () => {
            montado = false
        }
    }, [rotaAtualId])

    const pontosAtuais = useMemo(() => {
        return rotaAtualId ? pontos : []
    }, [rotaAtualId, pontos])

    // Escolas pertencentes aos pontos desta rota (comparação tolerante a number/string)
    const escolasDaRota = useMemo(() => {
        const idsEscolas = [...new Set(
            pontosAtuais
                .filter((p) => p.escola_id != null)
                .map((p) => String(p.escola_id))
        )]
        return idsEscolas
            .map((id) => escolas.find((e) => String(e.id) === id))
            .filter(Boolean)
    }, [pontosAtuais, escolas])

    // Escola selecionada derivada diretamente da lista disponível
    const escolaSelecionada = useMemo(() => {
        if (escolaSelecionadaId && escolasDaRota.some((e) => String(e.id) === String(escolaSelecionadaId))) {
            return escolaSelecionadaId
        }
        return escolasDaRota[0]?.id || null
    }, [escolaSelecionadaId, escolasDaRota])

    // Alunos da escola selecionada que estão nesta rota (comparação tolerante a number/string)
    const alunosDaEscola = useMemo(() => {
        if (!escolaSelecionada) return []
        const idsAlunosPonto = pontosAtuais
            .filter((p) => p.aluno_id != null)
            .map((p) => String(p.aluno_id))

        return alunos.filter((aluno) => (
            idsAlunosPonto.includes(String(aluno.id)) &&
            String(aluno.escola_id) === String(escolaSelecionada)
        ))
    }, [pontosAtuais, alunos, escolaSelecionada])

    const escolaAtualObj = escolas.find((e) => String(e.id) === String(escolaSelecionada))

    const alternarSentido = useCallback(() => {
        setSentido((atual) => (atual === 'IDA' ? 'VOLTA' : 'IDA'))
    }, [])

    const sentidoAtualObj = SENTIDOS.find((s) => s.id === sentido)

    // Obter horário do turno da escola (hora_entrada se IDA, hora_saida se VOLTA)
    const obterHorarioEscola = useCallback((escolaId) => {
        const registroTurno = turnosEscola.find(
            (t) => String(t.escola_id) === String(escolaId) && String(t.turno).toUpperCase() === String(turno).toUpperCase()
        )
        if (!registroTurno) return null
        return sentido === 'IDA'
            ? formatarHora(registroTurno.hora_entrada)
            : formatarHora(registroTurno.hora_saida)
    }, [turnosEscola, turno, sentido])

    return (
        <main className={styles.container}>
            <TituloTela
                title="Suas rotas"
                subtitle={dataSubtitulo}
                notificacoesAtivas={false}
            />

            <div className={styles.conteudo}>
                <section className={styles.secaoTurnos} aria-labelledby="titulo-turnos">
                    <h2 id="titulo-turnos">Turnos</h2>
                    <div className={styles.turnos}>
                        {TURNOS.map(({ id, nome, icone: Icone, cor }) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={id === turno}
                                onClick={() => setTurno(id)}
                            >
                                <span className={styles.iconeTurno}>
                                    <Icone color={cor} aria-hidden="true" />
                                </span>
                                {nome}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        className={styles.sentido}
                        onClick={alternarSentido}
                        title={`Sentido atual: ${sentidoAtualObj?.nome}. Clique para alternar.`}
                    >
                        <TbArrowsExchange2 aria-hidden="true" />
                        {sentidoAtualObj?.nome}
                    </button>
                </section>

                <div className={styles.painel}>
                    <figure className={styles.mapa}>
                        <MapaRota
                            rotaId={rotaAtualId}
                            pontos={pontosAtuais}
                            alunos={alunos}
                            escolas={escolas}
                        />
                    </figure>

                    <div className={styles.listas}>
                        <section aria-labelledby="titulo-escolas">
                            <div className={styles.cabecalhoLista}>
                                <h2 id="titulo-escolas">
                                    Escolas da rota atual ({escolasDaRota.length})
                                </h2>
                            </div>

                            {carregando ? (
                                <p className={styles.mensagemVazia}>Carregando escolas da rota...</p>
                            ) : rotas.length === 0 ? (
                                <p className={styles.mensagemVazia}>Nenhuma rota encontrada para este turno.</p>
                            ) : escolasDaRota.length === 0 ? (
                                <p className={styles.mensagemVazia}>Nenhuma escola nesta rota.</p>
                            ) : (
                                <ul className={styles.escolas}>
                                    {escolasDaRota.map((escola) => {
                                        const horario = obterHorarioEscola(escola.id)
                                        const estaSelecionada = String(escola.id) === String(escolaSelecionada)

                                        return (
                                            <li
                                                className={`${styles.escola} ${estaSelecionada ? styles.escolaAtiva : ''}`}
                                                key={escola.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setEscolaSelecionadaId(escola.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        setEscolaSelecionadaId(escola.id)
                                                    }
                                                }}
                                            >
                                                <span className={styles.iconeEscola}>
                                                    <RiGraduationCapLine aria-hidden="true" />
                                                </span>
                                                <div className={styles.dadosEscola}>
                                                    <strong>{escola.nome}</strong>
                                                    <span>{escola.endereco}</span>
                                                </div>
                                                {horario && (
                                                    <div className={styles.infosPonto}>
                                                        <time>{horario}</time>
                                                        <span>{sentido === 'IDA' ? 'Entrada' : 'Saída'}</span>
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </section>

                        <section className={styles.secaoAlunos} aria-labelledby="titulo-alunos">
                            <h2 id="titulo-alunos" className={styles.tituloAlunos}>
                                Alunos da escola{' '}
                                {escolaAtualObj && <span>– {escolaAtualObj.nome}</span>}
                            </h2>
                            {alunosDaEscola.length === 0 ? (
                                <p className={styles.mensagemVazia}>
                                    {escolaSelecionada
                                        ? 'Nenhum aluno desta escola cadastrado nesta rota.'
                                        : 'Selecione uma escola para ver os alunos.'}
                                </p>
                            ) : (
                                <ul className={styles.alunos}>
                                    {alunosDaEscola.map((aluno) => (
                                        <li className={styles.aluno} key={aluno.id}>
                                            <LuUserRound aria-hidden="true" />
                                            <span>{aluno.nome}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Rotas
