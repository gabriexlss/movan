import { useEffect, useState } from 'react'

import { PiTrashBold, PiWarningBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogsClientes.module.css'

const nomesTipo = {
    escola: 'a escola',
    aluno: 'o aluno',
    responsavel: 'o responsável',
}

const DialogExcluirCliente = ({ tipo, registro, onClose, onConfirm }) => {
    const [segundos, setSegundos] = useState(10);

    useEffect(() => {
        if (segundos <= 0) return undefined;

        const timer = window.setTimeout(() => {
            setSegundos((prev) => prev - 1);
        }, 1000);

        return() => window.clearTimeout(timer);
    }, [segundos]);

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title={`Excluir ${nomesTipo[tipo]}?`}
            description="Esta ação é permanente e não poderá ser desfeita."
            icon={<PiWarningBold />}
            size="small"
            className={`${styles.dialog} ${styles.deleteDialog}`}
        >
            <div className={styles.deleteContent}>
                <p className={styles.deleteNotice}>
                    <PiWarningBold aria-hidden="true" />
                    <span>
                        Você está prestes a excluir <strong>{registro.nome}</strong> e os dados vinculados a este cadastro.
                    </span>
                </p>

                <button
                    type="button"
                    className={`${styles.primaryButton} ${styles.deleteButton}`}
                    disabled={segundos > 0}
                    onClick={onConfirm}
                    data-autofocus="true"
                >
                    {segundos > 0 ? `${segundos}s` : <><PiTrashBold aria-hidden="true" /> Confirmar Exclusão</>}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogExcluirCliente
