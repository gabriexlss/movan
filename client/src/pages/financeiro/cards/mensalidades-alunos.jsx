import { useCallback, useEffect, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import PainelLista from './PainelLista'
import DialogStatusMensalidade from '../dialogs/DialogStatusMensalidade'
import styles from './mensalidades-alunos.module.css'
import { listarMensalidades } from '../../../services/financeiro'
import { getApiErrorMessage } from '../../../services/toastManager'
import { formatarDataFinanceira, STATUS_MENSALIDADE } from '../../../utils/financeiro'

const ITENS_POR_PAGINA = 6

const MensalidadesAlunos = ({ onFinanceiroAtualizado }) => {
    const [pagina, setPagina] = useState(0)
    const [mensalidades, setMensalidades] = useState([])
    const [selecionada, setSelecionada] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')

    const buscarMensalidades = useCallback(async () => {
        try {
            setMensalidades(await listarMensalidades())
        } catch (error) {
            setErro(getApiErrorMessage(error))
        } finally {
            setCarregando(false)
        }
    }, [])

    useEffect(() => {
        const carregamento = window.setTimeout(buscarMensalidades, 0)
        return () => window.clearTimeout(carregamento)
    }, [buscarMensalidades])

    const fecharDialog = useCallback(() => setSelecionada(null), [])

    const atualizarMensalidade = (mensalidadeAtualizada) => {
        setMensalidades((atuais) => atuais.map((mensalidade) => (
            mensalidade.id === mensalidadeAtualizada.id
                ? { ...mensalidade, ...mensalidadeAtualizada }
                : mensalidade
        )))
        onFinanceiroAtualizado?.()
        fecharDialog()
    }

    const totalPaginas = Math.max(1, Math.ceil(mensalidades.length / ITENS_POR_PAGINA))
    const paginaAtual = Math.min(pagina, totalPaginas - 1)
    const mensalidadesDaPagina = mensalidades.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA,
    )

    return (
        <>
            <PainelLista
                title="Mensalidades dos alunos"
                page={paginaAtual}
                totalPages={totalPaginas}
                totalItems={mensalidades.length}
                itemsPerPage={ITENS_POR_PAGINA}
                itemLabel="mensalidades"
                onPageChange={setPagina}
                showAction={false}
            >
                {carregando && <p className={styles.mensagem} role="status">Carregando mensalidades...</p>}
                {erro && (
                    <div className={styles.mensagem} role="alert">
                        <p>{erro}</p>
                        <button type="button" onClick={() => {
                            setCarregando(true)
                            setErro('')
                            buscarMensalidades()
                        }}>Tentar novamente</button>
                    </div>
                )}
                {!carregando && !erro && mensalidades.length === 0 && (
                    <p className={styles.mensagem}>Nenhuma mensalidade encontrada.</p>
                )}
                <ul className={styles.lista}>
                    {mensalidadesDaPagina.map((mensalidade) => {
                        const { id, nome_aluno, contrato_id, data_vencimento, status } = mensalidade
                        const nome = nome_aluno || `Contrato #${contrato_id}`
                        const apresentacao = STATUS_MENSALIDADE[status]

                        return (
                            <li className={styles.linha} key={id}>
                                <button
                                    type="button"
                                    className={`${styles.item} ${styles[apresentacao?.classe] || ''}`}
                                    aria-label={`${status === 'PENDENTE' ? 'Confirmar pagamento da' : 'Mensalidade de'} ${nome}, vencimento ${formatarDataFinanceira(data_vencimento)}, ${apresentacao?.label || status}`}
                                    aria-haspopup={status === 'PENDENTE' ? 'dialog' : undefined}
                                    onClick={() => status === 'PENDENTE' && setSelecionada(mensalidade)}
                                >
                                    <span className={styles.avatar}><FaUser aria-hidden="true" /></span>
                                    <span className={styles.descricao}>
                                        <strong>{nome}</strong>
                                        <span>Vencimento: {formatarDataFinanceira(data_vencimento)}</span>
                                    </span>
                                    <span className={`${styles.status} ${styles[`status-${apresentacao?.classe}`] || ''}`}>
                                        {apresentacao?.label || status}
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </PainelLista>

            {selecionada && (
                <DialogStatusMensalidade
                    mensalidade={selecionada}
                    onClose={fecharDialog}
                    onSave={atualizarMensalidade}
                />
            )}
        </>
    )
}

export default MensalidadesAlunos
