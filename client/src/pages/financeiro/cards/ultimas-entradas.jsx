import { useCallback, useEffect, useState } from 'react'
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
import {
    listarRegistros,
    criarRegistro,
    alterarRegistro,
    excluirRegistro,
} from '../../../services/financeiro'
import styles from './ultimas-entradas.module.css'
import { apiErrorToast } from '../../../services/toastManager'

const ITENS_POR_PAGINA = 4

const formatarValor = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
}).format(Number(valor) || 0)

const formatarData = (data) => {
    if (!data) return ''

    const [ano, mes, dia] = data.substring(0, 10).split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const obterIcone = (entrada) => {
    const assunto = String(entrada.titulo || '').toLocaleLowerCase('pt-BR')

    if (entrada.tipo === 'Receita') return FaMoneyBillWave
    if (assunto.includes('combustível')) return FaGasPump
    if (assunto.includes('manutenção')) return FaTools
    return FaBus
}

const UltimasEntradas = ({ onFinanceiroAtualizado }) => {
    const [itens, setItens] = useState([])
    const [pagina, setPagina] = useState(0)
    const [dialog, setDialog] = useState(null)
    const [salvando, setSalvando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)

    const buscarEntradas = useCallback(async () => {
        try {
            const registros = await listarRegistros()

            const registrosFormatados = registros.map(registro => ({
                id: registro.id,
                titulo: registro.titulo,
                descricao: registro.descricao,
                valor: Number(registro.valor),
                data: registro.data_lancamento,
                tipo: registro.tipo === 'ENTRADA' ? 'Receita' : 'Despesa',
            }))

            registrosFormatados.sort((a, b) =>
                new Date(b.data) - new Date(a.data)
            )

            setItens(registrosFormatados)

            return true
        } catch (error) {
            console.error('Erro ao buscar entradas financeiras:', error)
            return false
        }
    }, [])

    useEffect(() => {
        buscarEntradas()
    }, [buscarEntradas])

    const fecharDialog = useCallback(() => setDialog(null), [])

    const salvarEntrada = async (valores) => {
        if (salvando) return
        setSalvando(true)
        try {
            const dados = {
                ...dialog.registro,
                ...valores,
                descricao: dialog.registro?.descricao ||
                    (valores.tipo === 'Receita'
                        ? 'Receita financeira'
                        : 'Despesa financeira'),
            }

            if (dialog.acao === 'editar') {
                await alterarRegistro(dialog.registro.id, dados)
            } else {
                await criarRegistro(dados)
            }

            await buscarEntradas()
            onFinanceiroAtualizado?.()
            setPagina(0)
            fecharDialog()

        } catch (error) {
            console.error('Erro ao salvar registro financeiro:', error)
        } finally {
            setSalvando(false)
        }
    }

    const confirmarExclusao = async () => {
        if (excluindo) return
        setExcluindo(true)
        try {
            await excluirRegistro(dialog.registro.id)

            setItens((atuais) => atuais.filter((entrada) => entrada.id !== dialog.registro.id))
            onFinanceiroAtualizado?.()
            setPagina(0)
            fecharDialog()

        } catch (error) {
            apiErrorToast(error, 'UNEXPECTED_ERROR')
        } finally {
            setExcluindo(false)
        }
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
                    onConfirm={confirmarExclusao}
                />
            )}
        </>
    )
}

export default UltimasEntradas
