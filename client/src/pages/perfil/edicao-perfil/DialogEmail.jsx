import { useCallback, useState } from 'react'
import { PiEnvelopeSimpleBold } from 'react-icons/pi'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import api from '../../../services/api'

const DialogEmail = ({ valor, onValorChange, onClose }) => {
    const [emailnovo, setEmailNovo] = useState('')
    const navigate = useNavigate()

    const enviarCodigo = useCallback(async () => {
        
        if(!emailnovo){
            toast.error("Preencha o campo de e-mail.")
            return
        }

        try {
            await api.post('motorista/editar/enviar-codigo', { email: emailnovo }, {skipGlobalErrorToast: true}) //mando o email novo para o backend mandar o codigo
            navigate('/codigo-enviado', { replace: true, state: { fluxo: 'atualizar', autoSendVerification: false, emailnovo } })
            toast.success('Código enviado para o seu e-mail.')

        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível enviar o código.')
        }
        
    }, [emailnovo, navigate])


    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar e-mail"
            description="Seu e-mail será usado para acesso, recuperação da conta e comunicações importantes."
            icon={<PiEnvelopeSimpleBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="Digite seu novo e-mail"
                    icon={<PiEnvelopeSimpleBold />}
                    type="email"
                    value={emailnovo}
                    onChange={(event) => setEmailNovo(event.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    autoFocus
                />

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={enviarCodigo}
                >
                    Alterar e-mail
                </button>
            </div>
        </DefaultDialog>
    )
}


export default DialogEmail
