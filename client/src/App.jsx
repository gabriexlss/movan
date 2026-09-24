import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

import Header from './components/layout/header'
import Footer from './components/layout/footer'

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

import Perfil from './pages/perfil/perfil'
import Notificacoes from './pages/notificacoes/notificacoes'

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

    return (
        <div className='app'>
            {!logCad && <Header />}

            <Routes>
                <Route path='/error' element={<ErrorPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path='/' element={<HomePage />} />
                    <Route path='/financeiro' element={<Financeiro />} />
                    <Route path='/perfil' element={<Perfil />} />
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

            {!logCad && <Footer />}
        </div>
)
}

export default App
