import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import './AuthScreens.css'

const CodigoEnviado = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const { state } = useLocation() //pego o estado que foi passado na navegação, caso não tenha estado pego o fluxo do sessionStorage, caso não tenha fluxo no sessionStorage defino como 'recuperacao'
    const [codigo, setCodigo] = useState('') //guarda o código que o usuário digita
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado
    const fluxo = state?.fluxo || sessionStorage.getItem('movan:verificationFlow') || 'recuperacao' //pego o fluxo do estado ou do sessionStorage, caso não tenha nenhum defino como 'recuperacao'

    //==========================
    //VALIDAR CÓDIGO
    //==========================
    const handleSubmit = async (event) => { //chamo essa função quando o usuario clica em enviar
        event.preventDefault() //não deixo o navegador atualizar a pagina

        if (!/^\d{6}$/.test(codigo)) { //verifico se o código tem uma quantidade de digitos diferente de 6
            toast.error('Digite um código válido com seis dígitos.') //mando uma mensagem de erro caso o código seja inválido
            return
        }

        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            if (fluxo === 'cadastro') { //se o fluxo for de cadastro
                const response = await api.post('/motorista/verificar-conta', { cod: codigo }, { //mando o código pro backend
                    skipGlobalErrorToast: true, //vou tratar o erro aqui então recuso que o toast do api.js seja mostrado
                })
                toast.success(response.data?.msg || 'Conta verificada com sucesso.') //mando uma mensagem de sucesso do backend, se não tiver mando uma generica
                sessionStorage.removeItem('movan:verificationFlow') //apago o fluxo porque o usuário já verificou a conta
                navigate('/login', { replace: true }) //mando para a pagina de login
            } else {
                sessionStorage.setItem('movan:recoveryCode', codigo) //guardo o código no sessionStorage porque vou usar na tela de redefinir senha
                navigate('/redefinir-senha', { state: { codigo, fluxo: 'recuperacao' } }) //mando para a pagina de redefinir senha e falo que o fluxo é de recuperação
            }
        } catch (error) {
            const errosDeCampo = Object.values(error.response?.data?.erro || {}) //transformo o erro do backend em um array de mensagens de erro, caso não tenha erros do backend mando um array vazio
                .flatMap((campo) => campo?._errors || []) //tiro o _errors do campo, caso não tenha nada ele so manda um array vazio
            const mensagem = errosDeCampo.join(' ') || error.response?.data?.msg || 'Não foi possível validar o código.' //junto as mensagens de erro, caso não tenha mensagens de erro do backend mando uma generica
            toast.error(mensagem) //mando a mensagem pro usuário
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Código enviado ao seu e-mail</h2>
            <p className="auth-screens__descricao">
                Insira o código de verificação no campo abaixo.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={handleSubmit}
            >
                <div className="auth-screens__campo">
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

                <div className="auth-screens__codigo-meta">
                    <span className="auth-screens__reenviar">Reenviar código</span>
                    <span className="auth-screens__tempo">0:23</span> {/* aqui seria um timer que, quando ele zerar se transformaria num botão que reenviaria o código. não tenho ideia de como fazer isso */}
                </div>

                <button className="auth-screens__botao" type="submit" disabled={enviando}>
                    {enviando ? 'Validando...' : 'Enviar'}
                </button>
            </form>
        </section>
    )
}

export default CodigoEnviado
