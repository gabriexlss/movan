import { useState } from 'react'
import { toast } from  'react-hot-toast'
import { useNavigate } from 'react-router-dom'
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
import api from '../../../services/api'


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
    const navigate = useNavigate()
    const { logout } = useAuth() //função de logout para deslogar o usuario apos excluir a conta

//======================
//TRATAR EXCLUSÃO
//======================
const handleSubmit = async (event) => {
    event.preventDefault(); //não deixo atualizar a pagina
    
    if(!senhaAtual) { //se não tiver confirmado
        toast.error("Senha não indentificada, por favor insira uma senha")
        return;
    }

    try{
        const response = await api.delete('/motorista', {
            data: { senha: senhaAtual }, //mando para o backend a senha para confirmar a exclusão da conta
            skipGlobalErrorToast: true, //falo para a api não mostrar o toast de erro global, porque vou tratar o erro de forma diferente aqui
            skipAuthExpired: true, //falo para a api não mandar o evento de sessão expirada, porque vou tratar o erro de forma diferente aqui
        })
        toast.success(response.data.msg || 'Conta excluída com sucesso, caso não logue em 30 dias a conta será excluída permanentemente.')
        await logout() //chamo a função de logout para deslogar o usuario apos excluir a cont
        }catch(error){
            if(error.response?.status === 401) {
                toast.error(error.response.data?.msg || 'Senha incorreta. Por favor, tente novamente.')
                return;
            }
            toast.error(error.response?.data?.msg || 'Não foi possível excluir a conta. Por favor, tente novamente mais tarde.')
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
                        onClick={handleSubmit}
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
