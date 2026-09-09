import { Outlet, useLocation } from 'react-router-dom'

import LogCadHeader from './LogCad-header'
import LogCadToggleSwitch from './LogCadToggleSwitch'
import LogCadFooter from './LogCad-footer'

import styles from './LogCad-layout.module.css'

const LogCadLayout = () => {
    const { pathname } = useLocation()
    const modo = pathname === '/cadastro' ? 'cadastro' : 'login'
    const telaPrincipal = pathname === '/login' || pathname === '/cadastro'

    return (
        <div className={styles['logcad-layout']}>
            <LogCadHeader modo={modo} />
            {telaPrincipal && <LogCadToggleSwitch />}

            <div className={styles['logcad-conteudo']}>
                <Outlet />
            </div>

            <LogCadFooter />
        </div>
    )
}

export default LogCadLayout
