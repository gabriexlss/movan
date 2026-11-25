import { useCallback, useRef, useState } from 'react'
import { PiCheckBold, PiNotePencilBold, PiTagBold } from 'react-icons/pi'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { alterarStatusMensalidade } from '../../../services/financeiro'
import { getApiErrorMessage } from '../../../services/toastManager'
import { formatarDataFinanceira, formatarMoeda, STATUS_MENSALIDADE } from '../../../utils/financeiro'
import CampoEntrada from './CampoEntrada'
import styles from './dialogsFinanceiro.module.css'

const DialogStatusMensalidade = ({ mensalidade, onClose, onSave }) => {
    const [status, setStatus] = useState(mensalidade.status)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState('')
    const envioEmAndamento = useRef(false)

    const fechar = useCallback(() => {
        if (!envioEmAndamento.current) onClose()
    }, [onClose])

    const salvar = async (event) => {
        event.preventDefault()
        if (envioEmAndamento.current || status === mensalidade.status) return

        envioEmAndamento.current = true
        setSalvando(true)
        setErro('')

        try {
            const atualizada = await alterarStatusMensalidade(mensalidade.id, status)
            onSave(atualizada)
        } catch (error) {
            setErro(getApiErrorMessage(error))
        } finally {
            envioEmAndamento.current = false
            setSalvando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={fechar}
            title="Editar mensalidade"
            description={mensalidade.nome_aluno || `Contrato #${mensalidade.contrato_id}`}
            icon={<PiNotePencilBold />}
            className={styles.dialog}
        >
            <form className={styles.form} onSubmit={salvar} aria-busy={salvando}>
                <dl className={styles.detalhesMensalidade}>
                    <div><dt>Vencimento</dt><dd>{formatarDataFinanceira(mensalidade.data_vencimento)}</dd></div>
                    <div><dt>Valor</dt><dd>{formatarMoeda(mensalidade.valor_cobrado)}</dd></div>
                </dl>
                <CampoEntrada
                    label="Status da mensalidade"
                    icon={<PiTagBold />}
                    as="select"
                    value={status}
                    onChange={(event) => {
                        setStatus(event.target.value)
                        setErro('')
                    }}
                    disabled={salvando}
                    autoFocus
                    required
                >
                    {Object.entries(STATUS_MENSALIDADE).map(([valor, { label }]) => (
                        <option key={valor} value={valor}>{label}</option>
                    ))}
                </CampoEntrada>
                {erro && <p className={styles.erroFormulario} role="alert">{erro}</p>}
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={salvando || status === mensalidade.status}
                >
                    <PiCheckBold aria-hidden="true" />
                    {salvando ? 'Salvando...' : 'Salvar alterações'}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogStatusMensalidade
