import { useCallback, useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPencilAlt, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import fotoPlaceholder from '../../../assets/media/img/placeholders/placeholder.jpg'
import DefaultCard from '../../../components/cards/DefaultCard'
import DialogExcluirCliente from '../dialogs/DialogExcluirCliente'
import DialogFormularioCliente from '../dialogs/DialogFormularioCliente'
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

const formatarData = (data) => {
    if (!data) return ''

    const [ano, mes, dia] = data.split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const montarDetalhes = (tipo, registro) => {
    if (tipo === 'responsavel') {
        return [registro.telefone, registro.email, registro.endereco].filter(Boolean)
    }

    if (tipo === 'aluno') {
        return [
            registro.responsavel && `Responsável: ${registro.responsavel}`,
            [registro.anoEscolar, registro.turno, formatarData(registro.dataNascimento)]
                .filter(Boolean)
                .join(' · '),
        ].filter(Boolean)
    }

    return [
        registro.endereco,
        [registro.telefone, registro.funcionamento].filter(Boolean).join(' · '),
    ].filter(Boolean)
}

const ListaClientes = ({ title, tipo, registros, responsaveis = [] }) => {
    const [itens, setItens] = useState(registros)
    const [busca, setBusca] = useState('')
    const [pagina, setPagina] = useState(0)
    const [dialog, setDialog] = useState(null)

    const resultados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase('pt-BR')
        if (!termo) return itens

        return itens.filter((registro) =>
            [registro.nome, ...registro.detalhes, registro.badge]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('pt-BR')
                .includes(termo),
        )
    }, [busca, itens])

    const fecharDialog = useCallback(() => setDialog(null), [])

    const abrirFormulario = (acao, registro = null) => {
        setDialog({ acao, registro })
    }

    const salvarRegistro = (valores) => {
        const registroAtualizado = {
            ...dialog.registro,
            ...valores,
            id: dialog.registro?.id || `${tipo}-${Date.now()}`,
            detalhes: montarDetalhes(tipo, valores),
        }

        setItens((estadoAtual) => (
            dialog.acao === 'editar'
                ? estadoAtual.map((item) => (item.id === registroAtualizado.id ? registroAtualizado : item))
                : [registroAtualizado, ...estadoAtual]
        ))
        setPagina(0)
        fecharDialog()
    }

    const excluirRegistro = () => {
        setItens((estadoAtual) => estadoAtual.filter((item) => item.id !== dialog.registro.id))
        fecharDialog()
    }

    const totalPaginas = Math.max(1, Math.ceil(resultados.length / ITENS_POR_PAGINA))
    const paginaAtual = Math.min(pagina, totalPaginas - 1)
    const registrosDaPagina = resultados.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA,
    )
    const primeiroItem = resultados.length ? paginaAtual * ITENS_POR_PAGINA + 1 : 0
    const ultimoItem = Math.min((paginaAtual + 1) * ITENS_POR_PAGINA, resultados.length)

    return (
        <DefaultCard title={title} titleClassName={styles.tituloCard}>
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
                    <button
                        type="button"
                        className={styles.novo}
                        onClick={() => abrirFormulario('adicionar')}
                        aria-haspopup="dialog"
                    >
                        <FaPlus aria-hidden="true" />
                        <span>{textosAcao[tipo]}</span>
                    </button>
                </div>

                {registrosDaPagina.length > 0 ? (
                    <ul className={styles.registros}>
                        {registrosDaPagina.map((registro) => (
                            <li className={styles.registro} key={registro.id}>
                                <span className={styles.avatar} aria-hidden="true">
                                    <img src={fotoPlaceholder} alt="" />
                                </span>
                                <div className={styles.informacoes}>
                                    <Link
                                        to={`/clientes/${tipo}/${registro.id}`}
                                        state={{ registro }}
                                        className={styles.nomeCliente}
                                    >
                                        {registro.nome}
                                    </Link>
                                    {registro.detalhes.map((detalhe) => <span key={detalhe}>{detalhe}</span>)}
                                </div>
                                <div className={styles.acoes}>
                                    {registro.badge && <span className={styles.badge}>{registro.badge}</span>}
                                    <button
                                        type="button"
                                        className={styles.editar}
                                        aria-label={`Editar ${registro.nome}`}
                                        title={`Editar ${registro.nome}`}
                                        aria-haspopup="dialog"
                                        onClick={() => abrirFormulario('editar', registro)}
                                    >
                                        <FaPencilAlt aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.excluir}
                                        aria-label={`Excluir ${registro.nome}`}
                                        title={`Excluir ${registro.nome}`}
                                        aria-haspopup="dialog"
                                        onClick={() => setDialog({ acao: 'excluir', registro })}
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

            {dialog && dialog.acao !== 'excluir' && (
                <DialogFormularioCliente
                    acao={dialog.acao}
                    tipo={tipo}
                    registro={dialog.registro}
                    responsaveis={responsaveis}
                    onClose={fecharDialog}
                    onSave={salvarRegistro}
                />
            )}

            {dialog?.acao === 'excluir' && (
                <DialogExcluirCliente
                    tipo={tipo}
                    registro={dialog.registro}
                    onClose={fecharDialog}
                    onConfirm={excluirRegistro}
                />
            )}
        </DefaultCard>
    )
}

export default ListaClientes
