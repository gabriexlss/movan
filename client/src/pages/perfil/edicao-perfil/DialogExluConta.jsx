import { useState } from 'react'
import { toast } from  'react-hot-toast'
import {
    PiIdentificationCardBold,
    PiLockKeyBold,
    PiReceiptBold,
    PiTrashBold,
    PiUserBold,
    PiUsersBold,
    PiWarningBold,
    PiWarningOctagonBold,
} from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import { useAuth } from '../../../context/useAuth'


const dadosExcluidos = [
    { texto: 'Seu perfil e dados atuais', Icone: PiUserBold },
    { texto: 'Dados financeiros e históricos', Icone: PiIdentificationCardBold },
    { texto: 'Cadastro de responsáveis e crianças', Icone: PiUsersBold },
    { texto: 'Contratos e mensalidades', Icone: PiReceiptBold },
]



const DialogExluConta = ({ onClose }) => {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [confirmacao, setConfirmacao] = useState('')
    const podeConfirmar = senhaAtual.trim().length > 0 && confirmacao === 'EXCLUIR'
    const { logout:sair } = useAuth()

//======================
//TRATAR EXCLUSÃO
//======================
const handleSubmit = async (event) => {
    event.preventDefault(); //não deixo atualizar a pagina
    
    if(!senha) { //se não tiver senha
        toast.error("Senha não indentificada, por favor insira uma senha")
    }

    try{
        const response = await api.delete('/motorista', {
            senha
        })
        await sair;
    
    }catch{

    }
}

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Atenção - esta ação é permanente!"
            description="Ao excluir sua conta, seus dados, informações e históricos serão removidos. Após o prazo de restauração, não poderão ser recuperados."
            icon={<PiWarningBold />}
            size="medium"
            className={`${styles.dialog} ${styles.deleteDialog}`}
        >
            <div className={styles.deleteContent}>
                <section className={styles.deletedData} aria-label="O que será excluído">
                    <h3>O que será excluído</h3>
                    <ul>
                        {dadosExcluidos.map(({ texto, Icone }) => (
                            <li key={texto}>
                                <Icone aria-hidden="true" />
                                <span>{texto}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <div className={styles.deleteConfirmation}>
                    <h3>Para confirmar, siga os passos abaixo:</h3>
                    <ol className={styles.confirmationSteps}>
                        <li>
                            <span className={styles.stepNumber} aria-hidden="true">1</span>
                            <CampoEdicao
                                label="Digite sua senha atual"
                                icon={<PiLockKeyBold />}
                                type="password"
                                value={senhaAtual}
                                onChange={(event) => setSenhaAtual(event.target.value)}
                                placeholder="********"
                                autoComplete="current-password"
                            />
                        </li>
                        <li>
                            <span className={styles.stepNumber} aria-hidden="true">2</span>
                            <CampoEdicao
                                label={'Digite “EXCLUIR” para confirmar'}
                                icon={<PiTrashBold />}
                                value={confirmacao}
                                onChange={(event) => setConfirmacao(event.target.value)}
                                placeholder="EXCLUIR"
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </li>
                    </ol>
                </div>

                <div className={styles.cancellationNotice}>
                    <PiWarningOctagonBold aria-hidden="true" />
                    <p>
                        Se você tem mensalidades pendentes ou contratos ativos,
                        eles serão cancelados automaticamente.
                    </p>
                </div>

                <div className={styles.deleteActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                        data-autofocus="true"
                    >
                        Cancelar
                    </button>

                    <p className={styles.restorationNotice}>
                        <PiWarningBold aria-hidden="true" />
                        <span>Você poderá restaurar sua conta em até 30 dias após a exclusão.</span>
                    </p>

                    <button
                        type="button"
                        className={`${styles.primaryButton} ${styles.deleteButton}`}
                        onClick={onClose}
                        disabled={!podeConfirmar}
                    >
                        <PiTrashBold aria-hidden="true" />
                        Excluir minha conta
                    </button>
                </div>
            </div>
        </DefaultDialog>
    )
}

export default DialogExluConta
