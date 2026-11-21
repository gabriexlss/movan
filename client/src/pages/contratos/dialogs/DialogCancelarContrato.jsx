import { useState } from 'react'
import { PiWarningBold } from 'react-icons/pi'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogContrato.module.css'

const DialogCancelarContrato = ({ onClose, onConfirm }) => {
    const [motivo, setMotivo] = useState('')
    const [cancelando, setCancelando] = useState(false)

    const enviar = async (event) => {
        event.preventDefault()
        const motivoLimpo = motivo.trim()
        if (!motivoLimpo || cancelando) return

        setCancelando(true)
        try {
            await onConfirm(motivoLimpo)
        } finally {
            setCancelando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={cancelando ? () => {} : onClose}
            title="Cancelar contrato"
            description="Ao cancelar, eventuais links pendentes serão revogados e esta ação não poderá ser desfeita."
            icon={<PiWarningBold />}
            className={styles.dialog}
        >
            <form className={styles.formulario} onSubmit={enviar} aria-busy={cancelando}>
                <label className={styles.campoClausula}>
                    <span>Motivo do cancelamento</span>
                    <textarea
                        value={motivo}
                        onChange={(event) => setMotivo(event.target.value)}
                        rows={4}
                        placeholder="Informe o motivo do cancelamento do contrato"
                        required
                        data-autofocus="true"
                        disabled={cancelando}
                    />
                </label>
                <div className={styles.acoesDialog}>
                    <button type="button" className={styles.secundario} onClick={onClose} disabled={cancelando}>
                        Voltar
                    </button>
                    <button type="submit" className={styles.perigo} disabled={cancelando || !motivo.trim()}>
                        {cancelando ? 'Cancelando...' : 'Confirmar cancelamento'}
                    </button>
                </div>
            </form>
        </DefaultDialog>
    )
}

export default DialogCancelarContrato
