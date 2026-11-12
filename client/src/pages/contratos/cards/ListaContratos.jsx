import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPlus, FaRegCalendarAlt, FaRegFileAlt, FaSearch, FaUser } from 'react-icons/fa'
import { IoFilterSharp } from 'react-icons/io5'
import { LuScrollText } from 'react-icons/lu'
import { Link, useNavigate } from 'react-router-dom'
import DefaultCard from '../../../components/cards/DefaultCard'
import { listarContratos } from '../../../services/contrato'
import { formatarData, situacoesContrato } from '../contratos-data'
import DialogContrato from '../dialogs/DialogContrato'
import styles from './listaContratos.module.css'

const ITENS_POR_PAGINA = 5

const situacoesBanco = {
    RASCUNHO: 'rascunho',
    AGUARDANDO_ASSINATURA: 'pendente',
    ATIVO: 'ativo',
    FINALIZADO: 'finalizado',
    CANCELADO: 'cancelado',
    INATIVO: 'cancelado',
    PENDENTE: 'pendente',
}

const adaptarContrato = (contrato) => ({
    ...contrato,
    id: contrato.contrato_id,
    titulo: 'Contrato de prestação de serviços',
    cliente: contrato.nome_responsavel,
    inicio: contrato.data_inicio,
    termino: contrato.data_fim,
    situacao: situacoesBanco[contrato.status] || String(contrato.status || '').toLocaleLowerCase('pt-BR'),
})

const ListaContratos = () => {
    const navigate = useNavigate()
    const [contratos, setContratos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [busca, setBusca] = useState('')
    const [situacao, setSituacao] = useState('todos')
    const [pagina, setPagina] = useState(0)
    const [filtroAberto, setFiltroAberto] = useState(false)
    const [formularioAberto, setFormularioAberto] = useState(false)

    useEffect(() => {
        let ativo = true

        listarContratos()
            .then((dados) => {
                if (ativo) {
                    setContratos(dados.map(adaptarContrato))
                }
            })
            .finally(() => {
                if (ativo) {
                    setCarregando(false)
                }
            })

        return () => {
            ativo = false
        }
    }, [])

    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    const resultados = contratos.filter((contrato) => (
        (situacao === 'todos' || contrato.situacao === situacao)
        && `${contrato.id} ${contrato.titulo} ${contrato.cliente}`
            .toLocaleLowerCase('pt-BR')
            .includes(termo)
    ))

    const totalPaginas = Math.max(1, Math.ceil(resultados.length / ITENS_POR_PAGINA))
    const paginaAtual = Math.min(pagina, totalPaginas - 1)
    const contratosDaPagina = resultados.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA,
    )
    const primeiroItem = resultados.length ? paginaAtual * ITENS_POR_PAGINA + 1 : 0
    const ultimoItem = Math.min((paginaAtual + 1) * ITENS_POR_PAGINA, resultados.length)

    const selecionarSituacao = (valor) => {
        setSituacao(valor)
        setPagina(0)
        setFiltroAberto(false)
    }

    const salvarContrato = (valores) => {
        const novoContrato = {
            ...valores,
            id: `C-${String(contratos.length + 1).padStart(3, '0')}`,
            situacao: 'ativo',
        }

        navigate('/contratos/clausulas', { state: { contrato: novoContrato } })
    }

    return (
        <DefaultCard
            title="Contratos"
            titleClassName={styles.tituloCard}
            headerContentClassName={styles.acoesCabecalho}
            headerContent={(
                <>
                    <nav className={styles.paginacao} aria-label="Páginas de contratos">
                        <button
                            type="button"
                            aria-label="Página anterior"
                            disabled={paginaAtual === 0}
                            onClick={() => setPagina(paginaAtual - 1)}
                        >
                            <FaChevronLeft aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{paginaAtual + 1} / {totalPaginas}</span>
                        <button
                            type="button"
                            aria-label="Próxima página"
                            disabled={paginaAtual + 1 >= totalPaginas}
                            onClick={() => setPagina(paginaAtual + 1)}
                        >
                            <FaChevronRight aria-hidden="true" />
                        </button>
                    </nav>
                    <div
                        className={styles.filtroContainer}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') {
                                setFiltroAberto(false)
                                event.currentTarget.querySelector('button').focus()
                            }
                        }}
                    >
                        <button
                            type="button"
                            className={styles.filtro}
                            aria-expanded={filtroAberto}
                            aria-controls={filtroAberto ? 'filtro-contratos' : undefined}
                            onClick={() => setFiltroAberto((aberto) => !aberto)}
                        >
                            <IoFilterSharp aria-hidden="true" />
                            <span>Filtro{situacao !== 'todos' ? ' (1)' : ''}</span>
                        </button>

                        {filtroAberto && (
                            <div className={styles.miniFiltro} id="filtro-contratos" role="group" aria-label="Filtrar contratos por situação">
                                <strong className={styles.tituloFiltro}>Situação do contrato</strong>
                                <div className={styles.opcoesFiltro}>
                                    {Object.entries({ todos: 'Todos', ...situacoesContrato }).map(([valor, nome]) => (
                                        <button
                                            key={valor}
                                            type="button"
                                            className={`${styles.opcaoFiltro} ${styles[valor] || ''}`}
                                            aria-pressed={situacao === valor}
                                            onClick={() => selecionarSituacao(valor)}
                                        >
                                            {nome}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        >
            <div className={styles.listaContratos}>
                <div className={styles.toolbar}>
                    <label className={styles.busca}>
                        <FaSearch aria-hidden="true" />
                        <input
                            type="search"
                            aria-label="Buscar contratos"
                            placeholder="Buscar contratos"
                            value={busca}
                            onChange={(event) => {
                                setBusca(event.target.value)
                                setPagina(0)
                            }}
                        />
                    </label>
                    <button
                        type="button"
                        className={styles.novo}
                        aria-haspopup="dialog"
                        onClick={() => setFormularioAberto(true)}
                    >
                        <FaPlus aria-hidden="true" />
                        <span>Novo contrato</span>
                    </button>
                </div>

                {carregando ? (
                    <p className={styles.vazio}>Carregando contratos...</p>
                ) : contratosDaPagina.length > 0 ? (
                    <ul className={styles.registros}>
                        {contratosDaPagina.map((contrato) => (
                            <li key={contrato.id}>
                                <Link
                                    to={`/contratos/${contrato.id}`}
                                    className={styles.contrato}
                                    aria-label={`Abrir contrato ${contrato.id} de ${contrato.cliente}`}
                                >
                                    <span className={styles.iconeContrato} aria-hidden="true"><FaRegFileAlt /></span>
                                    <div className={styles.conteudo}>
                                        <div className={styles.cabecalhoContrato}>
                                            <strong className={styles.tituloContrato}>{contrato.titulo}</strong>
                                            <span className={`${styles.status} ${styles[contrato.situacao]}`}>
                                                {situacoesContrato[contrato.situacao]}
                                            </span>
                                        </div>
                                        <div className={styles.informacoes}>
                                            <div className={styles.linhaDetalhes}>
                                                <span><LuScrollText aria-hidden="true" />{contrato.id}</span>
                                                <span><FaUser aria-hidden="true" />Cliente: {contrato.cliente}</span>
                                            </div>
                                            <div className={styles.linhaDetalhes}>
                                                <span><FaRegCalendarAlt aria-hidden="true" />Início: {formatarData(contrato.inicio)}</span>
                                                <span>Término: {formatarData(contrato.termino)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <FaChevronRight className={styles.seta} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.vazio}>Nenhum contrato encontrado.</p>
                )}

                <span className={styles.contagem} role="status">
                    {primeiroItem}-{ultimoItem} de {resultados.length} contratos
                </span>
            </div>

            {formularioAberto && (
                <DialogContrato
                    onClose={() => setFormularioAberto(false)}
                    onSave={salvarContrato}
                />
            )}
        </DefaultCard>
    )
}

export default ListaContratos
