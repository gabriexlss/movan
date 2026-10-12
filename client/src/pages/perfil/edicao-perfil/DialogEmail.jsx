import { useCallback, useState } from 'react'
import { PiEnvelopeSimpleBold } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import api from '../../../services/api'
import { useCodeCooldown } from '../../../hooks/useCodeCooldown'
import { formatarTempo, tempoCodigoRestante } from '../../../utils/codeCooldown'
import { apiErrorToast, errorToast, responseSuccessToast } from '../../../services/toastManager'

const DialogEmail = ({ onClose }) => {
    const [emailnovo, setEmailNovo] = useState('')
    const [enviando, setEnviando] = useState(false)
    const { tempoRestante, atualizarPrazo } = useCodeCooldown('atualizar')
    const navigate = useNavigate()

    const enviarCodigo = useCallback(async () => {
        
        if (enviando || tempoCodigoRestante('atualizar') > 0) return
        if(!emailnovo){
            errorToast('EMAIL_REQUIRED')
            return
        }

        setEnviando(true)
        try {
            const response = await api.post('/motorista/editar/enviar-codigo', { email: emailnovo }, {skipGlobalErrorToast: true}) //mando o email novo para o backend mandar o codigo
            navigate('/codigo-enviado', { replace: true, state: { fluxo: 'atualizar', autoSendVerification: false, emailnovo } })
            responseSuccessToast(response, 'EMAIL_CHANGE_CODE_SENT')

        } catch (error) {
            atualizarPrazo()
            apiErrorToast(error, 'VERIFICATION_CODE_SEND_FAILED')
        } finally {
            setEnviando(false)
        }
        
    }, [emailnovo, navigate, enviando, atualizarPrazo])


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

                {tempoRestante > 0 && <p role="status">Você poderá solicitar outro código em {formatarTempo(tempoRestante)}.</p>}

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={enviarCodigo}
                    disabled={enviando || tempoRestante > 0}
                >
                    {enviando ? 'Enviando...' : 'Alterar e-mail'}
                </button>
            </div>
        </DefaultDialog>
    )
}


export default DialogEmail
