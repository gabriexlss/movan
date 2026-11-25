import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuArrowDown, LuArrowUp, LuPlus, LuTrash2, LuUserRound } from 'react-icons/lu'
import { TbArrowsExchange2, TbSunFilled, TbSunset2Filled } from 'react-icons/tb'
import { IoMoon } from 'react-icons/io5'
import { RiGraduationCapLine } from 'react-icons/ri'

import TituloTela from '../../components/layout/tituloTela'
import MapaRota from './MapaRota'
import DialogPontoRota from './DialogPontoRota'
import {
    adicionarPontoRota,
    excluirPontoRota,
    listarRotas,
    moverPontosRota,
    obterPontosRota,
    otimizarRota,
} from '../../services/rotas'
import { listarAluno } from '../../services/aluno'
import { listarEscola } from '../../services/escola'
import { listarTurnosEscola } from '../../services/turnosEscola'
import { apiErrorToast, errorToast, successToast } from '../../services/toastManager'
import { obterDiaSemanaAtual } from '../../utils/periodoRota'
import styles from './rota.module.css'

const DIAS_SEMANA = [
    { id: 'SEGUNDA', curto: 'Seg', nome: 'Segunda-feira' },
    { id: 'TERÇA', curto: 'Ter', nome: 'Terça-feira' },
    { id: 'QUARTA', curto: 'Qua', nome: 'Quarta-feira' },
    { id: 'QUINTA', curto: 'Qui', nome: 'Quinta-feira' },
    { id: 'SEXTA', curto: 'Sex', nome: 'Sexta-feira' },
]

const TURNOS = [
    { id: 'MANHA', nome: 'Manhã', icone: TbSunFilled, cor: '#F4C51F' },
    { id: 'TARDE', nome: 'Tarde', icone: TbSunset2Filled, cor: '#e7a01c' },
    { id: 'NOITE', nome: 'Noite', icone: IoMoon, cor: '#a6e7f3' },
]

const formatarHora = (hora) => (hora ? String(hora).slice(0, 5) : '')

const obterLocalizacaoAtual = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_UNAVAILABLE'))
        return
    }
    navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (erro) => reject(erro),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
    )
})

const Rotas = () => {
    const [dia, setDia] = useState(obterDiaSemanaAtual)
    const [turno, setTurno] = useState('MANHA')
    const [sentido, setSentido] = useState('IDA')

    const [rotas, setRotas] = useState([])
    const [pontos, setPontos] = useState([])
    const [alunos, setAlunos] = useState([])
    const [escolas, setEscolas] = useState([])
    const [turnosEscola, setTurnosEscola] = useState([])

    const [carregandoRota, setCarregandoRota] = useState(true)
    const [erroCarregamento, setErroCarregamento] = useState(false)
    const [escolaSelecionadaId, setEscolaSelecionadaId] = useState(null)
    const [popup, setPopup] = useState(null)
    const [movendoOrdem, setMovendoOrdem] = useState(null)
    const [otimizando, setOtimizando] = useState(false)
    const [versaoMapa, setVersaoMapa] = useState(0)

    const dataSubtitulo = useMemo(() => {
        try {
            const texto = new Intl.DateTimeFormat('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            }).format(new Date())
            return texto.charAt(0).toUpperCase() + texto.slice(1)
        } catch {
            return ''
        }
    }, [])

    useEffect(() => {
        let ativo = true
        const carregarBase = async () => {
            try {
                const [dadosAlunos, dadosEscolas, dadosTurnos] = await Promise.all([
                    listarAluno(),
                    listarEscola(),
                    listarTurnosEscola(),
                ])
                if (ativo) {
                    setAlunos(dadosAlunos || [])
                    setEscolas(dadosEscolas || [])
                    setTurnosEscola(dadosTurnos || [])
                }
            } catch (error) {
                if (ativo) apiErrorToast(error, 'ROUTE_LOAD_FAILED')
            }
        }
        carregarBase()
        return () => {
            ativo = false
        }
    }, [])

    const carregarRotaEPontos = useCallback(async () => {
        setCarregandoRota(true)
        setErroCarregamento(false)
        setPontos([])
        try {
            const dadosRotas = await listarRotas({ turno, dia, sentido })
            setRotas(dadosRotas || [])

            const rotaPrincipal = dadosRotas?.[0]
            if (rotaPrincipal?.id) {
                const dadosPontos = await obterPontosRota(rotaPrincipal.id)
                setPontos(dadosPontos || [])
            }
        } catch (error) {
            setRotas([])
            setPontos([])
            setErroCarregamento(true)
            apiErrorToast(error, 'ROUTE_LOAD_FAILED')
        } finally {
            setCarregandoRota(false)
        }
    }, [turno, dia, sentido])

    useEffect(() => {
        const timer = window.setTimeout(() => carregarRotaEPontos(), 0)
        return () => window.clearTimeout(timer)
    }, [carregarRotaEPontos])

    const rotaAtual = rotas[0] || null
    const rotaAtualId = rotaAtual?.id ?? null

    const pontosOrdenados = useMemo(
        () => [...pontos].sort((a, b) => a.ordem - b.ordem),
        [pontos],
    )

    // Escolas presentes nesta rota com o respectivo ponto_rota
    const escolasDaRota = useMemo(() => (
        pontosOrdenados
            .filter((p) => p.escola_id != null)
            .map((ponto) => {
                const escola = escolas.find((e) => String(e.id) === String(ponto.escola_id))
                return escola ? { ...escola, pontoId: ponto.id, ordem: ponto.ordem, escolaTurnoId: ponto.escola_turno_id } : null
            })
            .filter(Boolean)
    ), [pontosOrdenados, escolas])

    const escolaSelecionada = useMemo(() => {
        if (escolaSelecionadaId && escolasDaRota.some((e) => String(e.id) === String(escolaSelecionadaId))) {
            return escolaSelecionadaId
        }
        return escolasDaRota[0]?.id || null
    }, [escolaSelecionadaId, escolasDaRota])

    const escolaAtualObj = escolasDaRota.find((e) => String(e.id) === String(escolaSelecionada)) || null

    // Alunos da escola selecionada nesta rota, com o pontoId correspondente para exclusão
    const alunosDaEscola = useMemo(() => {
        if (!escolaSelecionada) return []
        return pontosOrdenados
            .filter((p) => p.aluno_id != null)
            .map((ponto) => {
                const aluno = alunos.find((a) => String(a.id) === String(ponto.aluno_id))
                if (!aluno || String(aluno.escola_id) !== String(escolaSelecionada)) return null
                return { ...aluno, pontoId: ponto.id, ordem: ponto.ordem }
            })
            .filter(Boolean)
    }, [pontosOrdenados, alunos, escolaSelecionada])

    // Alunos cadastrados que ainda não estão nesta rota (para o modal "Adicionar ponto")
    const alunosDisponiveis = useMemo(() => {
        const idsNaRota = new Set(pontosOrdenados.filter((p) => p.aluno_id != null).map((p) => String(p.aluno_id)))
        return alunos.filter((aluno) => !idsNaRota.has(String(aluno.id)))
    }, [pontosOrdenados, alunos])

    const obterHorarioEscola = useCallback((escolaItem) => {
        const turnoPorId = escolaItem.escolaTurnoId
            ? turnosEscola.find((t) => String(t.id) === String(escolaItem.escolaTurnoId))
            : null

        const registroTurno = turnoPorId || turnosEscola.find(
            (t) => String(t.escola_id) === String(escolaItem.id)
                && String(t.turno).toUpperCase() === turno,
        )

        if (!registroTurno) return null
        return sentido === 'IDA'
            ? formatarHora(registroTurno.hora_entrada)
            : formatarHora(registroTurno.hora_saida)
    }, [turnosEscola, turno, sentido])

    const recarregarPontosEMapa = async () => {
        if (!rotaAtualId) return
        const dadosPontos = await obterPontosRota(rotaAtualId)
        setPontos(dadosPontos || [])
        setVersaoMapa((v) => v + 1)
    }

    const moverParada = async (index, direcao) => {
        const destinoIndex = index + direcao
        if (!rotaAtualId || destinoIndex < 0 || destinoIndex >= pontosOrdenados.length || movendoOrdem !== null) return

        const atual = pontosOrdenados[index]
        const vizinho = pontosOrdenados[destinoIndex]
        setMovendoOrdem(atual.ordem)
        try {
            await moverPontosRota(rotaAtualId, atual.ordem, vizinho.ordem)
            successToast('ROUTE_POINT_MOVED')
            await recarregarPontosEMapa()
        } catch (error) {
            apiErrorToast(error, 'ROUTE_POINT_MOVE_FAILED')
        } finally {
            setMovendoOrdem(null)
        }
    }

    const executarOtimizacao = async () => {
        if (!rotaAtualId || otimizando) return

        setOtimizando(true)
        try {
            let coordenadas
            try {
                coordenadas = await obterLocalizacaoAtual()
            } catch {
                errorToast('ROUTE_LOCATION_REQUIRED')
                return
            }

            await otimizarRota(rotaAtualId, coordenadas)
            successToast('ROUTE_OPTIMIZED')
            await recarregarPontosEMapa()
        } catch (error) {
            apiErrorToast(error, 'ROUTE_OPTIMIZE_FAILED')
        } finally {
            setOtimizando(false)
        }
    }

    const confirmarPopup = async (alunoIdSelecionado) => {
        if (!rotaAtualId || !popup) return

        try {
            if (popup.tipo === 'adicionar') {
                await adicionarPontoRota(rotaAtualId, alunoIdSelecionado)
                successToast('ROUTE_POINT_ADDED')
            } else if (popup.tipo === 'excluir-escola' && popup.escola?.pontoId) {
                await excluirPontoRota(rotaAtualId, popup.escola.pontoId)
                successToast('ROUTE_POINT_DELETED')
            } else if (popup.tipo === 'excluir-aluno' && popup.aluno?.pontoId) {
                await excluirPontoRota(rotaAtualId, popup.aluno.pontoId)
                successToast('ROUTE_POINT_DELETED')
            }
            setPopup(null)
            await recarregarPontosEMapa()
        } catch (error) {
            apiErrorToast(error, popup.tipo === 'adicionar' ? 'ROUTE_POINT_ADD_FAILED' : 'ROUTE_POINT_DELETE_FAILED')
        }
    }

    const detalharPonto = (ponto) => {
        if (ponto.escola_id != null) {
            const escola = escolas.find((e) => String(e.id) === String(ponto.escola_id))
            return {
                ehEscola: true,
                nome: escola?.nome || `Escola #${ponto.escola_id}`,
                subtitulo: escola?.endereco || '',
                escola: escola ? { ...escola, pontoId: ponto.id } : { id: ponto.escola_id, nome: `Escola #${ponto.escola_id}`, pontoId: ponto.id },
            }
        }
        const aluno = alunos.find((a) => String(a.id) === String(ponto.aluno_id))
        return {
            ehEscola: false,
            nome: aluno?.nome || `Aluno #${ponto.aluno_id}`,
            subtitulo: aluno?.endereco || '',
            aluno: aluno ? { ...aluno, pontoId: ponto.id } : { id: ponto.aluno_id, nome: `Aluno #${ponto.aluno_id}`, pontoId: ponto.id },
        }
    }

    const temAlunosNaRota = pontosOrdenados.some((p) => p.aluno_id != null)

    return (
        <main className={styles.container}>
            <TituloTela
                title="Suas rotas"
                subtitle={dataSubtitulo}
            />

            <div className={styles.conteudo}>
                <section className={styles.filtrosRota} aria-label="Filtros da rota">
                    <div className={styles.diasSemana} role="group" aria-label="Dia da semana">
                        {DIAS_SEMANA.map(({ id, curto, nome }) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={dia === id}
                                aria-label={nome}
                                onClick={() => setDia(id)}
                            >
                                {curto}
                            </button>
                        ))}
                    </div>

                    <div className={styles.secaoTurnos}>
                        <div className={styles.turnos} role="group" aria-label="Turnos">
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

                        <div className={styles.acoesTopo}>
                            <button
                                type="button"
                                className={styles.sentido}
                                onClick={() => setSentido((atual) => (atual === 'IDA' ? 'VOLTA' : 'IDA'))}
                                title="Alternar sentido entre Ida e Volta"
                            >
                                <TbArrowsExchange2 aria-hidden="true" />
                                {sentido === 'IDA' ? 'Ida' : 'Volta'}
                            </button>

                            <button
                                type="button"
                                className={styles.otimizar}
                                disabled={!rotaAtualId || !temAlunosNaRota || otimizando || carregandoRota}
                                onClick={executarOtimizacao}
                            >
                                {otimizando ? 'Otimizando...' : 'Otimizar rota'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className={styles.painel}>
                    <figure className={styles.mapa}>
                        <MapaRota
                            rotaId={rotaAtualId}
                            pontos={pontosOrdenados}
                            alunos={alunos}
                            escolas={escolas}
                            versaoMapa={versaoMapa}
                        />
                    </figure>

                    <div className={styles.listas}>
                        {erroCarregamento && (
                            <div className={styles.erroEstado} role="alert">
                                <p>Não foi possível carregar os dados desta rota.</p>
                                <button type="button" className={styles.adicionar} onClick={carregarRotaEPontos}>
                                    Tentar novamente
                                </button>
                            </div>
                        )}

                        <section className={styles.secaoParadas} aria-labelledby="titulo-paradas">
                            <div className={styles.cabecalhoLista}>
                                <h2 id="titulo-paradas">
                                    Ordem de paradas ({pontosOrdenados.length})
                                </h2>
                                <button
                                    type="button"
                                    className={styles.adicionar}
                                    aria-haspopup="dialog"
                                    disabled={!rotaAtualId || carregandoRota}
                                    onClick={() => setPopup({ tipo: 'adicionar' })}
                                >
                                    <LuPlus aria-hidden="true" />
                                    Adicionar ponto
                                </button>
                            </div>

                            {carregandoRota ? (
                                <p className={styles.mensagemVazia}>Carregando paradas da rota...</p>
                            ) : !rotaAtualId ? (
                                <p className={styles.mensagemVazia}>Nenhuma rota encontrada para os filtros selecionados.</p>
                            ) : pontosOrdenados.length === 0 ? (
                                <p className={styles.mensagemVazia}>Nenhuma parada cadastrada nesta rota.</p>
                            ) : (
                                <ol className={styles.paradas}>
                                    {pontosOrdenados.map((ponto, index) => {
                                        const info = detalharPonto(ponto)
                                        const ehEmbarque = ponto.tipo_ponto === 'EMBARQUE'
                                        return (
                                            <li className={styles.parada} key={ponto.id}>
                                                <span className={styles.ordemBadge}>{ponto.ordem}º</span>
                                                <span className={info.ehEscola ? styles.iconeEscola : styles.iconeParadaAluno}>
                                                    {info.ehEscola
                                                        ? <RiGraduationCapLine aria-hidden="true" />
                                                        : <LuUserRound aria-hidden="true" />}
                                                </span>
                                                <div className={styles.dadosParada}>
                                                    <strong>{info.nome}</strong>
                                                    <div className={styles.subinfoParada}>
                                                        <span className={ehEmbarque ? styles.tagEmbarque : styles.tagDesembarque}>
                                                            {ehEmbarque ? 'Embarque' : 'Desembarque'}
                                                        </span>
                                                        {info.subtitulo && <span>{info.subtitulo}</span>}
                                                    </div>
                                                </div>
                                                <div className={styles.acoes}>
                                                    <button
                                                        type="button"
                                                        aria-label={`Mover ${info.nome} para cima`}
                                                        disabled={index === 0 || movendoOrdem !== null}
                                                        onClick={() => moverParada(index, -1)}
                                                    >
                                                        <LuArrowUp aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        aria-label={`Mover ${info.nome} para baixo`}
                                                        disabled={index === pontosOrdenados.length - 1 || movendoOrdem !== null}
                                                        onClick={() => moverParada(index, 1)}
                                                    >
                                                        <LuArrowDown aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.excluir}
                                                        aria-label={`Excluir ${info.nome} da rota`}
                                                        aria-haspopup="dialog"
                                                        disabled={movendoOrdem !== null}
                                                        onClick={() => setPopup(info.ehEscola
                                                            ? { tipo: 'excluir-escola', escola: info.escola }
                                                            : { tipo: 'excluir-aluno', aluno: info.aluno })}
                                                    >
                                                        <LuTrash2 aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ol>
                            )}
                        </section>

                        <section className={styles.secaoEscolas} aria-labelledby="titulo-escolas">
                            <div className={styles.cabecalhoLista}>
                                <h2 id="titulo-escolas">
                                    Escolas da rota atual ({escolasDaRota.length})
                                </h2>
                            </div>

                            {carregandoRota ? (
                                <p className={styles.mensagemVazia}>Carregando escolas da rota...</p>
                            ) : escolasDaRota.length === 0 ? (
                                <p className={styles.mensagemVazia}>Nenhuma escola nesta rota.</p>
                            ) : (
                                <ul className={styles.escolas}>
                                    {escolasDaRota.map((escola) => {
                                        const horario = obterHorarioEscola(escola)
                                        const estaSelecionada = String(escola.id) === String(escolaSelecionada)

                                        return (
                                            <li
                                                className={`${styles.escola} ${estaSelecionada ? styles.escolaAtiva : ''}`}
                                                key={escola.pontoId}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setEscolaSelecionadaId(escola.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault()
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
                                                {horario ? (
                                                    <div className={styles.infosPonto}>
                                                        <time>{horario}</time>
                                                        <span>{sentido === 'IDA' ? 'Entrada' : 'Saída'}</span>
                                                    </div>
                                                ) : <span />}
                                                <div className={styles.acoes}>
                                                    <button
                                                        type="button"
                                                        className={styles.excluir}
                                                        aria-label={`Excluir ${escola.nome} da rota`}
                                                        aria-haspopup="dialog"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setPopup({ tipo: 'excluir-escola', escola })
                                                        }}
                                                    >
                                                        <LuTrash2 aria-hidden="true" />
                                                    </button>
                                                </div>
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
                                        <li className={styles.aluno} key={aluno.pontoId}>
                                            <LuUserRound aria-hidden="true" />
                                            <span>{aluno.nome}</span>
                                            <div className={styles.acoes}>
                                                <button
                                                    type="button"
                                                    className={styles.excluir}
                                                    aria-label={`Excluir ${aluno.nome} da rota`}
                                                    aria-haspopup="dialog"
                                                    onClick={() => setPopup({ tipo: 'excluir-aluno', aluno })}
                                                >
                                                    <LuTrash2 aria-hidden="true" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {popup && (
                <DialogPontoRota
                    tipo={popup.tipo}
                    escola={popup.escola}
                    aluno={popup.aluno}
                    alunosDisponiveis={alunosDisponiveis}
                    escolas={escolas}
                    onConfirm={confirmarPopup}
                    onClose={() => setPopup(null)}
                />
            )}
        </main>
    )
}

export default Rotas
