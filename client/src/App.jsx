import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

import HomePage from './pages/homePage'
import Header from './components/layout/header'
import Footer from './components/layout/footer'
import TituloTela from './components/layout/tituloTela'
import Login from './pages/login-cad/login/login'
import Cad from './pages/login-cad/cad/cad'
import LogCadLayout from './pages/login-cad/layout-LogCad/LogCad-layout'

function App() {

  const location = useLocation();

  const logCad = 
    location.pathname === '/login' ||
    location.pathname === '/cadastro';

  return (
    <>
        {!logCad && <Header />}
        {!logCad && <TituloTela title="Olá, Motorista!" />}

        <Routes>
            <Route path='/' element={<HomePage />} />

            <Route element={<LogCadLayout />}>
                <Route path='/login' element={<Login />} />
                <Route path='/cadastro' element={<Cad />} />
            </Route>
        </Routes>

        {!logCad && <Footer />}
    </>
  )
}

export default App
