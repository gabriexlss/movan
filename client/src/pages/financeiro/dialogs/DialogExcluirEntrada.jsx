import { useEffect, useState } from 'react'
import { PiTrashBold, PiWarningBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogsFinanceiro.module.css'

const DialogExcluirEntrada = ({ registro, onClose, onConfirm }) => {
    const [segundos, setSegundos] = useState(10)

    useEffect(() => {
        if (segundos <= 0) return undefined

        const timer = window.setTimeout(() => {
            setSegundos((valorAtual) => valorAtual - 1)
        }, 1000)

        return () => window.clearTimeout(timer)
    }, [segundos])

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Excluir entrada?"
            description="Esta ação é permanente e não poderá ser desfeita."
            icon={<PiWarningBold />}
            size="small"
            className={`${styles.dialog} ${styles.deleteDialog}`}
        >
            <div className={styles.deleteContent}>
                <p className={styles.deleteNotice}>
                    <PiWarningBold aria-hidden="true" />
                    <span>
                        Você está prestes a excluir a entrada <strong>{registro.titulo}</strong>.
                    </span>
                </p>

                <button
                    type="button"
                    className={`${styles.primaryButton} ${styles.deleteButton}`}
                    disabled={segundos > 0}
                    onClick={onConfirm}
                    data-autofocus="true"
                >
                    {segundos > 0
                        ? `${segundos}s`
                        : <><PiTrashBold aria-hidden="true" /> Confirmar exclusão</>}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogExcluirEntrada
