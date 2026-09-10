import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const VerificationRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth() //vou usar essas variaveis para saber se o usuario esta logado, se ta carregando e se o usuario ja verificou o cadastro
    const { state } = useLocation()
    const fluxo = state?.fluxo || sessionStorage.getItem('movan:verificationFlow') //eu pego o fluxo do estado caso exista, caso não exista eu pego do sessionStorage, caso não exista nenhum dos dois o fluxo vai ser undefined
    const cadastroNaoVerificado = fluxo === 'cadastro' && isAuthenticated && user?.verificado === false //vai ser true se o fluxo for de cadastro, o usuario estiver logado e o usuario não tiver verificado o cadastro, essa variavel vai ser true

    if (isLoading) {//se a sessão ta carregando paro o codigo aqui
        return null
    }

    if (!fluxo || (isAuthenticated && !cadastroNaoVerificado)) { //se eu não tenho fluxo ou o usuario esta logado e não precisse verificar o cadastro
        return <Navigate to={isAuthenticated ? '/' : '/login'} replace /> //caso o usuario esteja logado vai pra pagina inicial, se não tiver logado vai para login
    }

    return <Outlet />
}

export default VerificationRoute
