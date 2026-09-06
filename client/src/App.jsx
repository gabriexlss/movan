import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

import HomePage from './pages/homePage'
import Header from './components/layout/header'
import Footer from './components/layout/footer'
import TituloTela from './components/layout/tituloTela'
import Login from './pages/login-cad/login/login'
import Cad from './pages/login-cad/cad/cad'
import CadGoogle from './pages/login-cad/auth-screens/CadGoogle'
import RecuperarSenha from './pages/login-cad/auth-screens/RecuperarSenha'
import CodigoEnviado from './pages/login-cad/auth-screens/CodigoEnviado'
import RedefinirSenha from './pages/login-cad/auth-screens/RedefinirSenha'
import LogCadLayout from './pages/login-cad/layout-LogCad/LogCad-layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import VerificationRoute from './components/auth/VerificationRoute'
import GoogleSignupRoute from './components/auth/GoogleSignupRoute'

function App() {

  const location = useLocation();

  const rotasLogCad = [
    '/login',
    '/cadastro',
    '/cadastro-google',
    '/recuperar-senha',
    '/codigo-enviado',
    '/redefinir-senha'
  ]

  const logCad = rotasLogCad.includes(location.pathname)

  return (
    <>
        {!logCad && <Header />}
        {!logCad && <TituloTela title="Olá, Motorista!" />}

        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route path='/' element={<HomePage />} />
            </Route>

            <Route element={<PublicRoute />}>
                <Route element={<LogCadLayout />}>
                <Route path='/login' element={<Login />} />
                <Route path='/cadastro' element={<Cad />} />
                <Route path='/recuperar-senha' element={<RecuperarSenha />} />
                <Route element={<GoogleSignupRoute />}>
                <Route path='/cadastro-google' element={<CadGoogle />} />
                </Route>
                </Route>
            </Route>

            <Route element={<LogCadLayout />}>
                <Route element={<VerificationRoute />}>
                    <Route path='/codigo-enviado' element={<CodigoEnviado />} />
                    <Route path='/redefinir-senha' element={<RedefinirSenha />} />
                </Route>
                </Route>
        </Routes>

        {!logCad && <Footer />}
    </>
    )
}

export default App
