import { useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPencilAlt, FaPlus, FaSearch, FaTrash, FaUser } from 'react-icons/fa'
import DefaultCard from '../../../components/cards/DefaultCard'
import styles from './cards-clientes.module.css'

const ITENS_POR_PAGINA = 4

const textosAcao = {
    responsavel: 'Novo responsável',
    aluno: 'Novo aluno',
    escola: 'Nova escola',
}

const nomesPlural = {
    responsavel: 'responsáveis',
    aluno: 'alunos',
    escola: 'escolas',
}

const ListaClientes = ({ title, tipo, registros }) => {
    const [busca, setBusca] = useState('')
    const [pagina, setPagina] = useState(0)

    const resultados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        if (!termo) return registros

        return registros.filter((registro) =>
            [registro.nome, ...registro.detalhes, registro.badge]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('pt-BR')
                .includes(termo),
        )
    }, [busca, registros])

    const totalPaginas = Math.max(1, Math.ceil(resultados.length / ITENS_POR_PAGINA))
    const paginaAtual = Math.min(pagina, totalPaginas - 1)
    const registrosDaPagina = resultados.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA,
    )
    const primeiroItem = resultados.length ? paginaAtual * ITENS_POR_PAGINA + 1 : 0
    const ultimoItem = Math.min((paginaAtual + 1) * ITENS_POR_PAGINA, resultados.length)

    return (
        <DefaultCard title={title}>
            <div className={styles.listaClientes}>
                <div className={styles.toolbar}>
                    <label className={styles.busca}>
                        <FaSearch aria-hidden="true" />
                        <span className={styles.somenteLeitor}>Buscar {nomesPlural[tipo]}</span>
                        <input
                            type="search"
                            value={busca}
                            onChange={(event) => {
                                setBusca(event.target.value)
                                setPagina(0)
                            }}
                            placeholder={`Buscar ${tipo === 'responsavel' ? 'por nome, telefone ou e-mail' : 'por nome'}`}
                        />
                    </label>
                    <button type="button" className={styles.novo}>
                        <FaPlus aria-hidden="true" />
                        <span>{textosAcao[tipo]}</span>
                    </button>
                </div>

                {registrosDaPagina.length > 0 ? (
                    <ul className={styles.registros}>
                        {registrosDaPagina.map(({ nome, detalhes, badge }) => (
                            <li className={styles.registro} key={nome}>
                                <span className={styles.avatar} aria-hidden="true">
                                    <FaUser />
                                </span>
                                <div className={styles.informacoes}>
                                    <strong>{nome}</strong>
                                    {detalhes.map((detalhe) => <span key={detalhe}>{detalhe}</span>)}
                                </div>
                                <div className={styles.acoes}>
                                    {badge && <span className={styles.badge}>{badge}</span>}
                                    <button
                                        type="button"
                                        className={styles.editar}
                                        aria-label={`Editar ${nome}`}
                                        title={`Editar ${nome}`}
                                    >
                                        <FaPencilAlt aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.excluir}
                                        aria-label={`Excluir ${nome}`}
                                        title={`Excluir ${nome}`}
                                    >
                                        <FaTrash aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.vazio}>Nenhum resultado encontrado.</p>
                )}

                <footer className={styles.rodapeLista}>
                    <span aria-live="polite">
                        {primeiroItem}-{ultimoItem} de {resultados.length} {nomesPlural[tipo]}
                    </span>
                    <nav className={styles.paginacao} aria-label={`Páginas de ${title}`}>
                        <button
                            type="button"
                            aria-label="Página anterior"
                            onClick={() => setPagina(paginaAtual - 1)}
                            disabled={paginaAtual === 0}
                        >
                            <FaChevronLeft aria-hidden="true" />
                        </button>
                        <span>{paginaAtual + 1} / {totalPaginas}</span>
                        <button
                            type="button"
                            aria-label="Próxima página"
                            onClick={() => setPagina(paginaAtual + 1)}
                            disabled={paginaAtual + 1 >= totalPaginas}
                        >
                            <FaChevronRight aria-hidden="true" />
                        </button>
                    </nav>
                </footer>
            </div>
        </DefaultCard>
    )
}

export default ListaClientes
