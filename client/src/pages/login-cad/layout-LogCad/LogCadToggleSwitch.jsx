import { NavLink, useLocation } from 'react-router-dom'

import styles from './LogCadToggleSwitch.module.css'

const LogCadToggleSwitch = () => {
    
    const { pathname } = useLocation();
    const modo = pathname === '/cadastro' ? 'cadastro' : 'login';

    return (
        <nav className={`${styles['logcad-toggle']} ${styles[modo]}`}>
            <span className={styles['toggle-indicador']} />

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
