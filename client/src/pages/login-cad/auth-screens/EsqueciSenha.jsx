import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import { useCodeCooldown } from '../../../hooks/useCodeCooldown'
import { formatarTempo, tempoCodigoRestante } from '../../../utils/codeCooldown'
import { mensagemErroApi } from '../../../utils/apiError'
import styles from './AuthScreens.module.css'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const EsqueciSenha = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const [email, setEmail] = useState('') //guarda o email do usuario
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado

    const { tempoRestante, atualizarPrazo } = useCodeCooldown('recuperacao')

    //==========================
    //ESQUECI SENHA
    //==========================
    const handleSubmit = async (event) => { //uso essa função no para enviar os dados do formulario para o backend quando aperto o botão de enviar
        event.preventDefault() //não deixo o navegador atualizar a pagina
        if (enviando || tempoCodigoRestante('recuperacao') > 0) return
        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            const response = await api.post('/motorista/recuperar-conta/enviar-codigo', { email }, { //mando o email pro backend
                skipGlobalErrorToast: true, //vou tratar o erro aqui então impeço que o toast do api.js seja mostrado
            })
            sessionStorage.setItem('movan:recoveryEmail', email) //guardo o email no sessionStorage porque vou usar na tela de enviar codigo
            sessionStorage.setItem('movan:verificationFlow', 'recuperacao')//falo que o fluxo agora é de verificação
            toast.success(response.data?.msg || 'Código de recuperação enviado.') //mando uma mensagem de sucesso do backend, se não tiver mando uma generica
            navigate('/codigo-enviado', { state: { fluxo: 'recuperacao' } }) //mando para a pagina de codigo enviado e falo que o estado de fluxo é de recuperação
        } catch (error) {
            atualizarPrazo()
            toast.error(mensagemErroApi(error, 'Não foi possível enviar o código.'))
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return (
        <section className={styles['auth-screens']}>
            <h2 className={styles['auth-screens__titulo']}>Esqueci minha senha</h2>
            <p className={styles['auth-screens__descricao']}>
                Digite o e-mail cadastrado na sua conta para redefinir a senha. Um código de verificação será enviado para o e-mail informado.
            </p>

            <form
                className={styles['auth-screens__form']}
                onSubmit={handleSubmit}
            >
                <div className={styles['auth-screens__campo']}>
                    <input
                        type="email"
                        id="emailEsqueciSenha"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailEsqueciSenha">E-mail</label>
                </div>

                {tempoRestante > 0 && <p role="status">Você poderá solicitar outro código em {formatarTempo(tempoRestante)}.</p>}

                <button className={styles['auth-screens__botao']} type="submit" disabled={enviando || tempoRestante > 0}>
                    {enviando ? <LoadingSpinner /> : 'Enviar'}
                </button>
            </form>
        </section>
    )
}

export default EsqueciSenha
