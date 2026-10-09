import { useRef, useState } from 'react'
import { PiLockKeyBold, PiShieldCheckBold } from 'react-icons/pi'
import { toast } from 'react-hot-toast'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import api from '../../../services/api'
import PasswordRequirements from '../../../components/auth/PasswordRequirements'
import { senhaValida } from '../../../utils/password'
import { mensagemErroApi } from '../../../utils/apiError'
import { useAuth } from '../../../context/useAuth'

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
            toast.error('Por favor, preencha todos os campos.')
            return
        }
        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não coincidem.')
            return
        }
        if (!senhaValida(novaSenha)) {
            toast.error('A nova senha deve atender a todos os requisitos.')
            return
        }

        envioEmCurso.current = true
        setEnviando(true)
        try {
            await api.patch('/motorista', { senha: novaSenha, senhaAtual }, {
                skipGlobalErrorToast: true,
                skipAuthExpired: true,
            })
            toast.success('Senha alterada com sucesso.')
            onClose()
        } catch (error) {
            // Um 401 pode ser senha incorreta ou sessão inválida; a consulta distingue os casos.
            if (error.response?.status === 401) await refreshSession()
            toast.error(mensagemErroApi(error, 'Não foi possível alterar a senha.'))
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
