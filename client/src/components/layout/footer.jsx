import { NavLink } from 'react-router-dom';
import styles from './footer.module.css';

import { GoHome } from 'react-icons/go';
import { MdAltRoute, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { BsFillPeopleFill } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { LuScrollText } from 'react-icons/lu';

const footer = () => {

    const navFooter = [
        {to: '/', label: 'Home', icon: GoHome},
        {to: '/financeiro', label: 'Financeiro', icon: MdOutlineAccountBalanceWallet},
        {to: '/contratos', label: 'Contratos', icon: LuScrollText},
        {to: '/clientes', label: 'Clientes', icon: BsFillPeopleFill},
        {to: '/rota', label: 'Rotas', icon: MdAltRoute},
        {to: '/perfil', label: 'Perfil', icon: CgProfile}
    ];

    return (
        <footer className={styles.footer}>
            <nav>
                {navFooter.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `${styles['footer-link']} ${isActive ? styles.active : ''}`}
                        >
                            <Icon className={styles['footer-icon']} aria-hidden="true" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </footer>
    )
}

export default footer
