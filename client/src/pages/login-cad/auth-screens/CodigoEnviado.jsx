import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { apiErrorToast, errorToast, responseSuccessToast, successToast } from '../../../services/toastManager'
import { useAuth } from '../../../context/useAuth'
import styles from './AuthScreens.module.css'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const CodigoEnviado = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const { refreshSession } = useAuth()
    const { state } = useLocation() //pego o estado que foi passado na navegação, caso não tenha estado pego o fluxo do sessionStorage, caso não tenha fluxo no sessionStorage defino como 'recuperacao'
    const [codigo, setCodigo] = useState('') //guarda o código que o usuário digita
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado
    const [reenviando, setReenviando] = useState(false) //uso para o codigo saber se ja estou reenviando
    const [tempoRestante, setTempoRestante] = useState(23)
    const fluxo = state?.fluxo || sessionStorage.getItem('movan:verificationFlow') || 'recuperacao' //pego o fluxo do estado ou do sessionStorage, caso não tenha nenhum defino como 'recuperacao'
    const autoEnvioRealizado = useRef(false)

    const enviarCodigoCadastro = useCallback(async () => {
        return api.post('/motorista/codigo/CRIACAO', {}, {
            skipGlobalErrorToast: true,
        })
    }, [])

    useEffect(() => {
        if (fluxo !== 'cadastro' || state?.autoSendVerification !== true || autoEnvioRealizado.current) return

        autoEnvioRealizado.current = true
        setReenviando(true)

        enviarCodigoCadastro()
            .then(() => {
                setTempoRestante(23)
                successToast('VERIFICATION_CODE_SENT')
            })
            .catch((error) => {
                apiErrorToast(error, 'VERIFICATION_CODE_SEND_FAILED')
            })
            .finally(() => setReenviando(false))
    }, [enviarCodigoCadastro, fluxo, state?.autoSendVerification])


    //==========================
    //REENVIAR CÓDIGO
    //==========================
    useEffect(() => {
        if (tempoRestante === 0) return undefined //se o tempo acabou eu paro a execução do codigo

        const timer = window.setInterval(() => { //ele executa o codigo por 1 vez a cada segundo
            setTempoRestante((tempo) => Math.max(tempo - 1, 0)) //eu tiro 1 segundo do tempo a cada 1 segundo porem se o tempo for menor que 0 ele fica setado como zero para sempre
        }, 1000)//dei o intervalo de 1 segundo

        return () => window.clearInterval(timer) //quando o componente for desmontado eu paro o intervalo de tempo
    }, [tempoRestante])

    const handleReenviar = async () => { //variavel chamada no botão de reenviar
        if (tempoRestante > 0 || reenviando) return //se ainda tiver tempo restante ou se ja estiver reenviando eu paro o codigo

        setReenviando(true) //digo que o processo de reenviar começou

        try {
            const response = fluxo === 'cadastro' //se o fluxo for de cadastro
                ? await enviarCodigoCadastro() //mando o backend enviar denovo um codigo como se fosse um codigo de criação de conta
                : await api.post('/motorista/recuperar-conta/enviar-codigo', { //se o fluxo não for cadastro eu mando o codigo ser enviado como um de recuperação de conta
                    email: sessionStorage.getItem('movan:recoveryEmail'), //pego o email que o usuario digitou na tela de esqueci minha senha e mandei pro backend para ele saber para qual email enviar o codigo
                }, { skipGlobalErrorToast: true }) //recuso que o toast do api.js seja mostrado, vou tratar o erro aqui

            setCodigo('') //limpo o campo de código para o usuário digitar denovo
            setTempoRestante(23) //reinicio o tempo para o usuário poder reenviar denovo caso ele não receba o código
            if (fluxo === 'cadastro') {
                successToast('VERIFICATION_CODE_RESENT')
            } else {
                responseSuccessToast(response, 'RECOVERY_CODE_RESENT')
            }
        } catch (error) {
            apiErrorToast(error, 'VERIFICATION_CODE_RESEND_FAILED')
        } finally {
            setReenviando(false) //falo que o processo de reenviar acabou
        }
    }

    //==========================
    //VALIDAR CÓDIGO
    //==========================
    const handleSubmit = async (event) => { //chamo essa função quando o usuario clica em enviar
        event.preventDefault() //não deixo o navegador atualizar a pagina

        if (!/^\d{6}$/.test(codigo)) { //verifico se o código tem uma quantidade de digitos diferente de 6
            errorToast('VERIFICATION_CODE_FORMAT') //mando uma mensagem de erro caso o código seja inválido
            return
        }

        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            if (fluxo === 'cadastro') { //se o fluxo for de cadastro
                const response = await api.post('/motorista/verificar-conta', { cod: codigo }, { //mando o código pro backend
                    skipGlobalErrorToast: true, //vou tratar o erro aqui então recuso que o toast do api.js seja mostrado
                })
                responseSuccessToast(response, 'ACCOUNT_VERIFIED') //mando uma mensagem de sucesso centralizada
                sessionStorage.removeItem('movan:verificationFlow') //apago o fluxo porque o usuário já verificou a conta
                await refreshSession()
                navigate('/', { replace: true })
            } else {
                sessionStorage.setItem('movan:recoveryCode', codigo) //guardo o código no sessionStorage porque vou usar na tela de redefinir senha
                navigate('/redefinir-senha', { state: { codigo, fluxo: 'recuperacao' } }) //mando para a pagina de redefinir senha e falo que o fluxo é de recuperação
            }
        } catch (error) {
            apiErrorToast(error, 'VERIFICATION_CODE_VALIDATION_FAILED')
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return (
        <section className={styles['auth-screens']}>
            <h2 className={styles['auth-screens__titulo']}>Código enviado ao seu e-mail</h2>
            <p className={styles['auth-screens__descricao']}>
                Insira o código de verificação abaixo.
            </p>

            <form
                className={styles['auth-screens__form']}
                onSubmit={handleSubmit}
            >
                <div className={styles['auth-screens__campo']}>
                    <input
                        type="text"
                        id="codigoVerificacao"
                        name="codigo"
                        value={codigo}
                        onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))} //aqi eu tiro qualquer coisa que não seja numero e limito a quantidade de digitos para 6
                        placeholder=" "
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                    />
                    <label htmlFor="codigoVerificacao">
                        Código de verificação
                    </label>
                </div>

                <div className={styles['auth-screens__codigo-meta']}>
                    <button
                        className={styles['auth-screens__reenviar']}
                        type="button"
                        onClick={handleReenviar}
                        disabled={tempoRestante > 0 || reenviando}
                    >
                        {reenviando ? 'Reenviando...' : 'Reenviar código'}
                    </button>
                    {tempoRestante > 0 && (
                        <span className={styles['auth-screens__tempo']}>
                            0:{String(tempoRestante).padStart(2, '0')}
                        </span>
                    )}
                </div>

                <button className={styles['auth-screens__botao']} type="submit" disabled={enviando}>
                    {enviando ? <LoadingSpinner /> : 'Enviar'}
                </button>
            </form>
        </section>
    )
}

export default CodigoEnviado
