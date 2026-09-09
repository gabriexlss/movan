import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../../services/api'
import styles from './AuthScreens.module.css'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const RedefinirSenha = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const { state } = useLocation() //pego o estado que foi passado na navegação, caso não tenha estado pego o fluxo do sessionStorage, caso não tenha fluxo no sessionStorage defino como 'recuperacao'
    const [senha, setSenha] = useState('') //guarda a senha do usuario
    const [confirmarSenha, setConfirmarSenha] = useState('') //guarda a confirmação da senha do usuario
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado
    const email = state?.email || sessionStorage.getItem('movan:recoveryEmail') //pego o email do estado ou do sessionStorage, caso não tenha nenhum defino como undefined
    const codigo = state?.codigo || sessionStorage.getItem('movan:recoveryCode') //pego o código do estado ou do sessionStorage, caso não tenha nenhum defino como undefined

    //==========================
    //REDEFINIR SENHA
    //==========================
    const handleSubmit = async (event) => { //chamo essa função quando o usuario clica em enviar
        event.preventDefault() //não deixo o navegador atualizar a pagina

        if (senha !== confirmarSenha) { //se a senha de confirmação for diferente da senha
            toast.error('As senhas precisam ser iguais.') //mando uma mensagem de erro
            return //cancelo o envio do formulario
        }

        if (!email || !codigo) { //se não tiver email ou código no estado ou no sessionStorage
            toast.error('Solicite um novo código de recuperação.') //mando uma mensagem de erro
            navigate('/recuperar-senha', { replace: true }) //mando o usuário para a tela de recuperar senha
            return //cancelo o envio do formulario
        }

        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            const response = await api.post('/motorista/recuperar-conta/recuperar', { //as seguintes informações pro backend
                email, //email do usuario
                cod: codigo, //codigo de recuperação do usuario
                senha, //nova senha do usuario (não to encriptando a senha pq o backend vai fazer isso)
            }, {
                skipGlobalErrorToast: true, //o erro sera tratado aqui então não deixo as mensagens do api.js aparecerem
            })
            toast.success(response.data?.msg || 'Senha alterada com sucesso.') //mando uma mensagem de sucesso do backend, se não tiver mando uma generica
            sessionStorage.removeItem('movan:recoveryEmail') //tiro o email do sessionStorage porque o usuário já redefiniu a senha
            sessionStorage.removeItem('movan:recoveryCode') //tiro o código do sessionStorage porque o usuário já redefiniu a senha
            sessionStorage.removeItem('movan:verificationFlow')
            navigate('/login', { replace: true }) //mando o usuário para a tela de login
        } catch (error) {
            const errosDeCampo = Object.values(error.response?.data?.erro || {}) //transformo o erro do backend em um array de mensagens de erro, caso não tenha erros do backend mando um array vazio
                .flatMap((campo) => campo?._errors || []) //tiro o _errors do campo, caso não tenha nada ele so manda um array vazio
            const mensagem = errosDeCampo.join(' ') || error.response?.data?.msg || 'Não foi possível alterar a senha.' //junto as mensagens de erro, caso não tenha mensagens de erro do backend mando uma generica
            toast.error(mensagem) //mando a mensagem
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return (
        <section className={styles['auth-screens']}>
            <h2 className={styles['auth-screens__titulo']}>Redefinir senha</h2>
            <p className={styles['auth-screens__descricao']}>
                Insira sua nova senha nos campos abaixo.
            </p>

            <form
                className={styles['auth-screens__form']}
                onSubmit={handleSubmit}
            >
                <div className={styles['auth-screens__campo']}>
                    <input
                        type="password"
                        id="novaSenha"
                        name="novaSenha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="novaSenha">Nova senha</label>
                </div>

                <div className={styles['auth-screens__campo']}>
                    <input
                        type="password"
                        id="confirmarNovaSenha"
                        name="confirmarNovaSenha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="confirmarNovaSenha">
                        Confirmar nova senha
                    </label>
                </div>

                <button className={styles['auth-screens__botao']} type="submit" disabled={enviando}>
                    {enviando ? <LoadingSpinner /> : 'Redefinir'}
                </button>
            </form>
        </section>
    )
}

export default RedefinirSenha
