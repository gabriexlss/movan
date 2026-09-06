import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

const GoogleSignupRoute = () => {
    const { isAuthenticated, isLoading } = useAuth()
    const dadosGoogle = sessionStorage.getItem('movan:googleSignup')//pego os dados do google do sessionStorage (se ele tiver os dados eu permito acesse rotas de cadastro que envolvam o google, já que isso significa que ele ja passou por algum processo envolvendo google login)

    if (isLoading) {
        return null
    }

    if (isAuthenticated) { //se o usario estiver logado
        return <Navigate to="/" replace /> //manda pra pagina inicial
    }

    return dadosGoogle ? <Outlet /> : <Navigate to="/cadastro" replace /> //se tiver os dados do google no sessionStorage ele deixa passar, caso não tenha manda para o cadastro normal
}

export default GoogleSignupRoute
