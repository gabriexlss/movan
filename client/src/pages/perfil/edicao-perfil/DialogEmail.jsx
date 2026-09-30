import { useCallback, useEffect, useState } from 'react'
import { PiEnvelopeSimpleBold, PiLockKeyBold, PiShieldCheckBold, PiClockBold } from 'react-icons/pi'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import { useAuth } from '../../../context/useAuth'
import api from '../../../services/api'

const DialogEmail = ({ valor, onValorChange, onClose }) => {
    const [emailnovo, setEmailNovo] = useState('')
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const enviarCodigo = useCallback(async () => {
        
        if(!emailnovo){
            toast.error(emailnovo)
            return
        }

        try {
            await api.post('motorista/editar/enviar-codigo', { email: emailnovo }) //mando o email novo para o backend mandar o codigo
            toast.success('Código enviado para o seu e-mail')
            navigate('/codigo-enviado', { replace: true, state: { fluxo: 'atualizar', autoSendVerification: false, emailnovo } })

        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível enviar o código.')
        }
        
    }, [logout, navigate, user?.email])


    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar E-mail"
            description="Seu e-mail será usado para acesso, recuperação da conta e comunicações importantes."
            icon={<PiEnvelopeSimpleBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                {/* <CampoEdicao
                    label="Digite sua senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                /> */}
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
