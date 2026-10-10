import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { apiErrorToast, errorToast, responseSuccessToast } from '../../../services/toastManager'
import { useAuth } from '../../../context/useAuth'

const ButtonGoogle = () => {
    const navigate = useNavigate() //me deixa mandar o usuario para outra pagina
    const { refreshSession } = useAuth() //serve para atualizar a sessão do usuario, basicamente eu uso isso para informar o app que o usuario logou com o google

    //=======================
    //LOGIN COM GOOGLE
    //=======================
    const handleSuccess = async ({ credential }) => { //função que ocorre quando o login funciona, o credential é o token que o google devolve para a gente
        if (!credential) { //verifico se o google devolveu um token
            errorToast('GOOGLE_TOKEN_MISSING') //caso não tenha devolvido mando erro
            return //paro a função aqui
        }

        try {
            const response = await api.post('/motorista/google', { token: credential }, { //mando o token pro backend para ele verificar se o usuario ja existe
                skipGlobalErrorToast: true,
            })

            if (response.data?.CREATION_REQUIRED) { //caso o backend informe que o usuario não esta cadastrado
                sessionStorage.setItem('movan:googleSignup', JSON.stringify(response.data.dadosGoogle)) //guardo as informações do google no sessionStorage para usar na tela de cadastro
                navigate('/cadastro-google') //mando o usuario para a tela de cadastro google
                return //paro a função
            }

            await refreshSession() //atualizo a sessão do usuario para ele ficar logado
            responseSuccessToast(response, 'GOOGLE_LOGIN_SUCCESS') //mando uma mensagem de sucesso centralizada
            navigate('/', { replace: true }) //mando o usuario para a tela inicial
        } catch (error) {
            apiErrorToast(error, 'GOOGLE_AUTH_FAILED')
        }
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess} //a bilioteca do google chama a função caso ela considerar que o login pode ocorrer
            onError={() => errorToast('GOOGLE_AUTH_FAILED')} //a bilioteca do google chama a função caso ela considerar que o login não pode ocorrer
        />
    )
}

export default ButtonGoogle
//aparentemente isso é o botão do google mas não posso ter certeza
