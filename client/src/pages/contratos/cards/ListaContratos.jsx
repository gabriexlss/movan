import { useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPlus, FaRegCalendarAlt, FaRegFileAlt, FaSearch, FaUser } from 'react-icons/fa'
import { IoFilterSharp } from 'react-icons/io5'
import { LuScrollText } from 'react-icons/lu'
import DefaultCard from '../../../components/cards/DefaultCard'
import { contratos, formatarData, situacoesContrato } from '../contratos-data'
import DialogContrato from '../dialogs/DialogContrato'
import styles from './listaContratos.module.css'

const ITENS_POR_PAGINA = 5

const ListaContratos = () => {
    const [itens, setItens] = useState(contratos)
    const [busca, setBusca] = useState('')
    const [situacao, setSituacao] = useState('todos')
    const [pagina, setPagina] = useState(0)
    const [filtroAberto, setFiltroAberto] = useState(false)
    const [formularioAberto, setFormularioAberto] = useState(false)

    const termo = busca.trim().toLocaleLowerCase('pt-BR')
    const resultados = itens.filter((contrato) => (
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
            id: `C-${String(itens.length + 1).padStart(3, '0')}`,
            situacao: 'ativo',
        }

        setItens((estadoAtual) => [novoContrato, ...estadoAtual])
        setBusca('')
        setSituacao('todos')
        setPagina(0)
        setFiltroAberto(false)
        setFormularioAberto(false)
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

                {contratosDaPagina.length > 0 ? (
                    <ul className={styles.registros}>
                        {contratosDaPagina.map((contrato) => (
                            <li key={contrato.id} className={styles.contrato}>
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
