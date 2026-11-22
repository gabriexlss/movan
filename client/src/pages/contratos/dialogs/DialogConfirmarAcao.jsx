import { useState } from 'react'
import { PiWarningBold } from 'react-icons/pi'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogContrato.module.css'

const DialogConfirmarAcao = ({
    title,
    description,
    textoConfirmar = 'Confirmar',
    textoProcessando = 'Processando...',
    destrutivo = false,
    onClose,
    onConfirm,
}) => {
    const [processando, setProcessando] = useState(false)

    const confirmar = async () => {
        if (processando) return
        setProcessando(true)
        try {
            await onConfirm()
        } finally {
            setProcessando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={processando ? () => {} : onClose}
            title={title}
            description={description}
            icon={<PiWarningBold />}
            className={styles.dialog}
        >
            <div className={styles.acoesDialog}>
                <button
                    type="button"
                    className={styles.secundario}
                    onClick={onClose}
                    disabled={processando}
                    data-autofocus="true"
                >
                    Voltar
                </button>
                <button
                    type="button"
                    className={destrutivo ? styles.perigo : styles.salvar}
                    onClick={confirmar}
                    disabled={processando}
                    style={destrutivo ? undefined : { marginTop: 0 }}
                >
                    {processando ? textoProcessando : textoConfirmar}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogConfirmarAcao
