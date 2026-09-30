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
    const [senhaAtual, setSenhaAtual] = useState('')
    const [emailnovo, setEmailNovo] = useState('')
    const [codigo, setCodigo] = useState('')
    const [tempoRestante, setTempoRestante] = useState(30)
    const [reenviando, setReenviando] = useState(false)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const enviarCodigo = useCallback(async () => {
        const emailAtual = user?.email //email atual é o email do usuario logado que esta guardado

        if (!emailAtual) { //se não tiver email logado
            toast.error('Erro ao pegar as informações do usuário. Por favor, tente logar novamente.')
            await logout() //faço logout porque alguma coisa esta errada com a sessão do usuario
            return
        }

        setReenviando(true)

        try {
            await api.post('motorista/editar/enviar-codigo', { email: emailnovo }) //mando o email novo para o backend mandar o codigo
            setTempoRestante(30) //reseto o timer
            toast.success('Código enviado para o seu e-mail')
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível enviar o código.')
        } finally {
            setReenviando(false)
        }
    }, [logout, navigate, user?.email])


    useEffect(() => {
        const envioInicial = window.setTimeout(enviarCodigo, 0) //essa constante serve para mandar o codigo assim que abrir o dialog, mas com um pequeno delay para não dar erro de estado

        return () => window.clearTimeout(envioInicial) //limpo o timeout caso o usuario feche o dialog antes do envio do codigo
    }, [enviarCodigo])


    useEffect(() => {
        if (tempoRestante === 0) return undefined //se o tempo acabar não faz nada

        const timer = window.setInterval(() => { //executa a cada 1 segundo
            setTempoRestante((tempo) => Math.max(tempo - 1, 0)) //a cada segundo tiro 1 do timer
        }, 1000) //aqui digo que o tempo para a execução é de 1000 milisegundos, ou seja 1 segundo

        return () => window.clearInterval(timer) //caso o usuario feche o dialog antes do tempo acabar, limpo o timer para não dar erro de estado
    }, [tempoRestante])

    async function handleAlterarEmail() {
        if (!/^\d{6}$/.test(codigo)) {
            toast.error('Código inválido')
            return
        }
    }

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
                    label="Confirmar código"
                    icon={<PiShieldCheckBold />}
                    value={codigo}
                    onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Código enviado por e-mail"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    suffix={tempoRestante > 0 ? (
                        <>
                            <PiClockBold aria-hidden="true" />
                            <span aria-label={`Tempo restante: ${tempoRestante} segundos`}>
                                0:{String(tempoRestante).padStart(2, '0')}
                            </span>
                        </>
                    ) : (
                        <button
                            type="button"
                            className={styles.resendButton}
                            onClick={enviarCodigo}
                            disabled={reenviando}
                        >
                            {reenviando ? 'Enviando...' : 'Reenviar código'}
                        </button>
                    )}
                />
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
                    onClick={handleAlterarEmail}
                >
                    Alterar e-mail
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogEmail
