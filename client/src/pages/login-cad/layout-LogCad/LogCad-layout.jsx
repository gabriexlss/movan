import { Outlet, useLocation } from 'react-router-dom'

import LogCadHeader from './LogCad-header'
import LogCadToggleSwitch from './LogCad-toggleSwitch'
import LogCadFooter from './LogCad-footer'

import './LogCad-layout.css'

const LogCadLayout = () => {
    const { pathname } = useLocation()
    const modo = pathname === '/cadastro' ? 'cadastro' : 'login'
    const telaPrincipal = pathname === '/login' || pathname === '/cadastro'

    return (
        <div className={`logcad-layout ${modo}`}>
            <LogCadHeader modo={modo} />
            {telaPrincipal && <LogCadToggleSwitch />}

            <div className="logcad-conteudo">
                <Outlet />
            </div>

            <LogCadFooter />
        </div>
    )
}

export default LogCadLayout
