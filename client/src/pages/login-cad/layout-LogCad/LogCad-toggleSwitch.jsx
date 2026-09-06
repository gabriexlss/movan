import { NavLink, useLocation } from 'react-router-dom'

import './LogCad-toggleSwitch.css'

const LogCadToggleSwitch = () => {
    const { pathname } = useLocation();
    const modo = pathname === '/cadastro' ? 'cadastro' : 'login';

    return (
        <nav className={`logcad-toggle ${modo}`}>
            <span className="toggle-indicador" />

            <NavLink to="/login">
                Entrar
            </NavLink>

            <NavLink to="/cadastro">
                Cadastrar
            </NavLink>
        </nav>
    )
}

export default LogCadToggleSwitch