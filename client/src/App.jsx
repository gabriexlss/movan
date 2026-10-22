import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

import Header from './components/layout/header'
import Footer from './components/layout/footer'
import ScrollToTop from './components/layout/ScrollToTop'

import HomePage from './pages/homePage'
import Login from './pages/login-cad/login/login'
import Cad from './pages/login-cad/cad/cad'
import CadGoogle from './pages/login-cad/auth-screens/CadGoogle'
import EsqueciSenha from './pages/login-cad/auth-screens/EsqueciSenha'
import CodigoEnviado from './pages/login-cad/auth-screens/CodigoEnviado'
import RedefinirSenha from './pages/login-cad/auth-screens/RedefinirSenha'
import VerificarEmail from './pages/login-cad/auth-screens/VerificarEmail'
import LogCadLayout from './pages/login-cad/layout-LogCad/LogCad-layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import VerificationRoute from './components/auth/VerificationRoute'
import GoogleSignupRoute from './components/auth/GoogleSignupRoute'
import ErrorPage from './pages/errors/errorPage'
import Financeiro from './pages/financeiro/financeiro'
import Cliente from './pages/clientes/cliente'
import ClienteDetalhes from './pages/clientes/detalhes/ClienteDetalhes'
import Perfil from './pages/perfil/perfil'
import Notificacoes from './pages/notificacoes/notificacoes'
import Contratos from './pages/contratos/contratos'
import ClausulasContrato from './pages/contratos/ClausulasContrato'
import LinkContrato from './pages/contratos/LinkContrato'
import AssinaturaContrato from './pages/contratos/AssinaturaContrato'
import Rotas from './pages/rotas/rota'

function App() {

    const location = useLocation();

    const rotasLogCad = [
        '/login',
        '/cadastro',
        '/cadastro-google',
        '/esqueci-senha',
        '/codigo-enviado',
        '/redefinir-senha',
        '/error',
        '/verificar-email'
    ]

    const logCad = rotasLogCad.includes(location.pathname)
    const fluxoContrato = location.pathname.startsWith('/contratos/') || location.pathname === '/contrato/assinatura'

    return (
        <div className='app'>
            <ScrollToTop />
            {!logCad && <Header />}

            <Routes>
                <Route path='/error' element={<ErrorPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/financeiro' element={<Financeiro />} />
                    <Route path='/rota' element={<Rotas />} />
                    <Route path='/clientes' element={<Cliente />} />
                    <Route path='/clientes/:tipo/:id' element={<ClienteDetalhes />} />
                    <Route path='/perfil' element={<Perfil />} />
                    <Route path='/contratos' element={<Contratos />} />
                    <Route path='/contratos/clausulas' element={<ClausulasContrato />} />
                    <Route path='/contratos/link' element={<LinkContrato />} />
                    <Route path='/contrato/assinatura' element={<AssinaturaContrato />} />
                    <Route path='/notificacoes' element={<Notificacoes />} />
                </Route>

                <Route element={<PublicRoute />}>
                    <Route element={<LogCadLayout />}>
                        <Route path='/login' element={<Login />} />
                        <Route path='/cadastro' element={<Cad />} />
                        <Route path='/esqueci-senha' element={<EsqueciSenha />} />
                        <Route element={<GoogleSignupRoute />}>
                            <Route path='/cadastro-google' element={<CadGoogle />} />
                        </Route>
                    </Route>
                </Route>

                <Route element={<LogCadLayout />}>
                    <Route element={<VerificationRoute />}>
                        <Route path='/codigo-enviado' element={<CodigoEnviado />} />
                        <Route path='/redefinir-senha' element={<RedefinirSenha />} />
                        <Route path='/verificar-email' element={<VerificarEmail />} />
                    </Route>
                </Route>
            </Routes>

            {!logCad && !fluxoContrato && <Footer />}
        </div>
)
}

export default App
