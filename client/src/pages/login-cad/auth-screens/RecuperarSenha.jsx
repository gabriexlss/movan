import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import './AuthScreens.css'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const RecuperarSenha = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const [email, setEmail] = useState('') //guarda o email do usuario
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado

    //==========================
    //RECUPERAR SENHA
    //==========================
    const handleSubmit = async (event) => { //uso essa função no para enviar os dados do formulario para o backend quando aperto o botão de enviar
        event.preventDefault() //não deixo o navegador atualizar a pagina
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
            const errosDeCampo = Object.values(error.response?.data?.erro || {}) //transformo a mensagem de erro do backend em um array de mensagens de erro, caso não tenha erros do backend mando um array vazio
                .flatMap((campo) => campo?._errors || []) //tiro o _errors do campo
            const mensagem = errosDeCampo.join(' ') || error.response?.data?.msg || 'Não foi possível enviar o código.' //coloco a mensagem do backend, se não tiver coloco uma generica
            toast.error(mensagem) //mando a mensagem de erro
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Recuperar senha</h2>
            <p className="auth-screens__descricao">
                Digite seu e-mail de recuperação para redefinir a senha. Um código de verificação será enviado para o e-mail informado.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={handleSubmit}
            >
                <div className="auth-screens__campo">
                    <input
                        type="email"
                        id="emailRecuperacao"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailRecuperacao">E-mail</label>
                </div>

                <button className="auth-screens__botao" type="submit" disabled={enviando}>
                    {enviando ? <LoadingSpinner /> : 'Enviar'}
                </button>
            </form>
        </section>
    )
}

export default RecuperarSenha
