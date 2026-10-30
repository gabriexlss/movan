import { useRef, useState } from 'react'
import { PiLockKeyBold, PiShieldCheckBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import api from '../../../services/api'
import PasswordRequirements from '../../../components/auth/PasswordRequirements'
import { senhaValida } from '../../../utils/password'
import { useAuth } from '../../../context/useAuth'
import { apiErrorToast, errorToast, successToast } from '../../../services/toastManager'

const DialogSenha = ({ onClose }) => {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [enviando, setEnviando] = useState(false)
    const envioEmCurso = useRef(false)
    const { refreshSession } = useAuth()
    const podeEnviar = Boolean(senhaAtual) && senhaValida(novaSenha) && novaSenha === confirmarSenha

    async function TrocarSenha() {
        if (envioEmCurso.current) return
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            errorToast('ALL_FIELDS_REQUIRED')
            return
        }
        if (novaSenha !== confirmarSenha) {
            errorToast('PASSWORDS_DO_NOT_MATCH')
            return
        }
        if (!senhaValida(novaSenha)) {
            errorToast('PASSWORD_REQUIREMENTS')
            return
        }

        envioEmCurso.current = true
        setEnviando(true)
        try {
            await api.patch('/motorista', { senha: novaSenha, senhaAtual }, {
                skipGlobalErrorToast: true,
                skipAuthExpired: true,
            })
            successToast('PASSWORD_CHANGED')
            onClose()
        } catch (error) {
            // Um 401 pode ser senha incorreta ou sessão inválida; a consulta distingue os casos.
            if (error.response?.status === 401) await refreshSession()
            apiErrorToast(error, 'PASSWORD_CHANGE_FAILED')
        } finally {
            envioEmCurso.current = false
            setEnviando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar senha"
            description="Para sua segurança, use uma senha forte com letras e números."
            icon={<PiShieldCheckBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="Senha atual"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <CampoEdicao
                    label="Nova senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                    autoFocus
                />
                <CampoEdicao
                    label="Confirmar senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    placeholder="Repita sua nova senha"
                    autoComplete="new-password"
                />

                <PasswordRequirements senha={novaSenha} />
                <button type="button" className={styles.primaryButton} onClick={TrocarSenha} disabled={!podeEnviar || enviando}>
                    {enviando ? 'Alterando...' : 'Alterar senha'}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogSenha
