import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { apiErrorToast, errorToast, responseSuccessToast } from '../../../services/toastManager'
import PasswordRequirements from '../../../components/auth/PasswordRequirements'
import { senhaValida } from '../../../utils/password'
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
            errorToast('PASSWORDS_DIFFERENT') //mando uma mensagem de erro
            return //cancelo o envio do formulario
        }

        if (!email || !codigo) { //se não tiver email ou código no estado ou no sessionStorage
            errorToast('RECOVERY_CODE_REQUIRED') //mando uma mensagem de erro
            navigate('/esqueci-senha', { replace: true }) //mando o usuário para a tela de esqueci minha senha
            return //cancelo o envio do formulario
        }

        if (enviando) return
        if (!senhaValida(senha)) {
            errorToast('PASSWORD_REQUIREMENTS')
            return
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
            responseSuccessToast(response, 'PASSWORD_CHANGED') //mando uma mensagem de sucesso centralizada
            sessionStorage.removeItem('movan:recoveryEmail') //tiro o email do sessionStorage porque o usuário já redefiniu a senha
            sessionStorage.removeItem('movan:recoveryCode') //tiro o código do sessionStorage porque o usuário já redefiniu a senha
            sessionStorage.removeItem('movan:verificationFlow')
            navigate('/login', { replace: true }) //mando o usuário para a tela de login
        } catch (error) {
            apiErrorToast(error, 'PASSWORD_CHANGE_FAILED')
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

                <PasswordRequirements senha={senha} />

                <button className={styles['auth-screens__botao']} type="submit" disabled={enviando || !senhaValida(senha) || senha !== confirmarSenha}>
                    {enviando ? <LoadingSpinner /> : 'Redefinir'}
                </button>
            </form>
        </section>
    )
}

export default RedefinirSenha
