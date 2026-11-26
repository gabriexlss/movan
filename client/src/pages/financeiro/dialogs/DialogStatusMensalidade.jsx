import { useCallback, useRef, useState } from 'react'
import { PiCheckBold, PiWarningCircleBold } from 'react-icons/pi'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { pagarMensalidade } from '../../../services/financeiro'
import { getApiErrorMessage } from '../../../services/toastManager'
import { formatarDataFinanceira, formatarMoeda } from '../../../utils/financeiro'
import styles from './dialogsFinanceiro.module.css'

const DialogStatusMensalidade = ({ mensalidade, onClose, onSave }) => {
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState('')
    const envioEmAndamento = useRef(false)

    const fechar = useCallback(() => {
        if (!envioEmAndamento.current) onClose()
    }, [onClose])

    const salvar = async (event) => {
        event.preventDefault()
        if (envioEmAndamento.current) return

        envioEmAndamento.current = true
        setSalvando(true)
        setErro('')

        try {
            const atualizada = await pagarMensalidade(mensalidade.id)
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
            title="Confirmar pagamento"
            description={mensalidade.nome_aluno || `Contrato #${mensalidade.contrato_id}`}
            icon={<PiWarningCircleBold />}
            className={styles.dialog}
        >
            <form className={styles.form} onSubmit={salvar} aria-busy={salvando}>
                <dl className={styles.detalhesMensalidade}>
                    <div><dt>Vencimento</dt><dd>{formatarDataFinanceira(mensalidade.data_vencimento)}</dd></div>
                    <div><dt>Valor</dt><dd>{formatarMoeda(mensalidade.valor_cobrado)}</dd></div>
                </dl>
                <p>Esta mensalidade foi paga?</p>
                {erro && <p className={styles.erroFormulario} role="alert">{erro}</p>}
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={salvando}
                >
                    <PiCheckBold aria-hidden="true" />
                    {salvando ? 'Confirmando...' : 'Sim, foi paga'}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogStatusMensalidade
