import { useCallback, useState } from 'react'
import {
    FaBus,
    FaGasPump,
    FaMoneyBillWave,
    FaPencilAlt,
    FaTools,
    FaTrash,
} from 'react-icons/fa'
import DialogExcluirEntrada from '../dialogs/DialogExcluirEntrada'
import DialogFormularioEntrada from '../dialogs/DialogFormularioEntrada'
import PainelLista from './PainelLista'
import styles from './ultimas-entradas.module.css'

const entradas = [
    { id: 'entrada-1', titulo: 'Mensalidade - Aluno João', descricao: 'Mensalidade escolar', valor: 450, data: '2026-06-13', tipo: 'Receita' },
    { id: 'entrada-2', titulo: 'Combustível', descricao: 'Abastecimento do veículo', valor: 250, data: '2026-06-13', tipo: 'Despesa' },
    { id: 'entrada-3', titulo: 'Mensalidade - Aluno Maria', descricao: 'Mensalidade escolar', valor: 450, data: '2026-06-12', tipo: 'Receita' },
    { id: 'entrada-4', titulo: 'Manutenção', descricao: 'Revisão do veículo', valor: 250, data: '2026-06-11', tipo: 'Despesa' },
    { id: 'entrada-5', titulo: 'Mensalidade - Aluno Caio', descricao: 'Mensalidade escolar', valor: 450, data: '2026-06-10', tipo: 'Receita' },
    { id: 'entrada-6', titulo: 'Seguro do veículo', descricao: 'Parcela mensal', valor: 380, data: '2026-06-09', tipo: 'Despesa' },
    { id: 'entrada-7', titulo: 'Mensalidade - Aluno Bia', descricao: 'Mensalidade escolar', valor: 450, data: '2026-06-08', tipo: 'Receita' },
    { id: 'entrada-8', titulo: 'Combustível', descricao: 'Abastecimento', valor: 220, data: '2026-06-07', tipo: 'Despesa' },
]

const ITENS_POR_PAGINA = 4

const formatarValor = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
}).format(valor)

const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const obterIcone = (entrada) => {
    const assunto = entrada.titulo.toLocaleLowerCase('pt-BR')

    if (entrada.tipo === 'Receita') return FaMoneyBillWave
    if (assunto.includes('combustível')) return FaGasPump
    if (assunto.includes('manutenção')) return FaTools
    return FaBus
}

const UltimasEntradas = () => {
    const [itens, setItens] = useState(entradas)
    const [pagina, setPagina] = useState(0)
    const [dialog, setDialog] = useState(null)

    const fecharDialog = useCallback(() => setDialog(null), [])

    const salvarEntrada = (valores) => {
        const entradaAtualizada = {
            ...dialog.registro,
            ...valores,
            id: dialog.registro?.id || `entrada-${Date.now()}`,
            descricao: valores.tipo === 'Receita' ? 'Receita financeira' : 'Despesa financeira',
        }

        setItens((estadoAtual) => (
            dialog.acao === 'editar'
                ? estadoAtual.map((item) => (item.id === entradaAtualizada.id ? entradaAtualizada : item))
                : [entradaAtualizada, ...estadoAtual]
        ))
        setPagina(0)
        fecharDialog()
    }

    const excluirEntrada = () => {
        setItens((estadoAtual) => estadoAtual.filter((item) => item.id !== dialog.registro.id))
        fecharDialog()
    }

    const totalPaginas = Math.max(1, Math.ceil(itens.length / ITENS_POR_PAGINA))
    const paginaAtual = Math.min(pagina, totalPaginas - 1)
    const entradasDaPagina = itens.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA,
    )

    return (
        <>
            <PainelLista
                title="Últimas entradas"
                page={paginaAtual}
                totalPages={totalPaginas}
                totalItems={itens.length}
                itemsPerPage={ITENS_POR_PAGINA}
                itemLabel="entradas"
                onPageChange={setPagina}
                onAction={() => setDialog({ acao: 'adicionar', registro: null })}
                actionLabel="Nova entrada"
            >
                <ul className={styles.lista}>
                    {entradasDaPagina.map((entrada) => {
                        const Icone = obterIcone(entrada)

                        return (
                            <li className={styles.item} key={entrada.id}>
                                <span className={`${styles.icone} ${entrada.tipo === 'Receita' ? styles.receita : styles.despesa}`}>
                                    <Icone aria-hidden="true" />
                                </span>
                                <div className={styles.descricao}>
                                    <strong>{entrada.titulo}</strong>
                                    <span>{entrada.descricao}</span>
                                </div>
                                <div className={styles.valores}>
                                    <strong className={entrada.tipo === 'Receita' ? styles.valorReceita : styles.valorDespesa}>
                                        {formatarValor(entrada.valor)}
                                    </strong>
                                    <span>{formatarData(entrada.data)}</span>
                                    <span className={`${styles.tag} ${entrada.tipo === 'Receita' ? styles.tagReceita : styles.tagDespesa}`}>
                                        {entrada.tipo}
                                    </span>
                                </div>
                                <div className={styles.acoes}>
                                    <button
                                        type="button"
                                        className={styles.editar}
                                        aria-label={`Editar ${entrada.titulo}`}
                                        title={`Editar ${entrada.titulo}`}
                                        aria-haspopup="dialog"
                                        onClick={() => setDialog({ acao: 'editar', registro: entrada })}
                                    >
                                        <FaPencilAlt aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.excluir}
                                        aria-label={`Excluir ${entrada.titulo}`}
                                        title={`Excluir ${entrada.titulo}`}
                                        aria-haspopup="dialog"
                                        onClick={() => setDialog({ acao: 'excluir', registro: entrada })}
                                    >
                                        <FaTrash aria-hidden="true" />
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </PainelLista>

            {dialog && dialog.acao !== 'excluir' && (
                <DialogFormularioEntrada
                    acao={dialog.acao}
                    registro={dialog.registro}
                    onClose={fecharDialog}
                    onSave={salvarEntrada}
                />
            )}

            {dialog?.acao === 'excluir' && (
                <DialogExcluirEntrada
                    registro={dialog.registro}
                    onClose={fecharDialog}
                    onConfirm={excluirEntrada}
                />
            )}
        </>
    )
}

export default UltimasEntradas
