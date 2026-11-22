import { NavLink } from 'react-router-dom';
import styles from './footer.module.css';

import { GoHome } from 'react-icons/go';
import { MdAltRoute, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { BsFillPeopleFill } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { LuScrollText } from 'react-icons/lu';
import { IoMdExit } from 'react-icons/io';
import { useAuth } from '../../context/useAuth';
import ThemeToggle from '../../theme/ThemeToggle';

const Footer = ({ ocultoNoCelular }) => {
    const { user, logout } = useAuth();

    const navFooter = [
        {to: '/', label: 'Home', icon: GoHome},
        {to: '/financeiro', label: 'Financeiro', icon: MdOutlineAccountBalanceWallet},
        {to: '/contratos', label: 'Contratos', icon: LuScrollText},
        {to: '/clientes', label: 'Clientes', icon: BsFillPeopleFill},
        {to: '/rota', label: 'Rotas', icon: MdAltRoute},
        {to: '/perfil', label: 'Perfil', icon: CgProfile}
    ];

    return (
        <div className={`${styles.footer} ${ocultoNoCelular ? styles.ocultoNoCelular : ''}`}>
            <nav aria-label="Navegação principal">
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
            {user && (
                <div className={styles.conta}>
                    <div className={styles.usuario}>
                        <CgProfile aria-hidden="true" />
                        <span>{user.nome || 'Motorista'}</span>
                    </div>
                    <ThemeToggle comTexto />
                    <button type="button" className={styles.sair} onClick={logout}>
                        <IoMdExit aria-hidden="true" />
                        Sair
                    </button>
                </div>
            )}
        </div>
    )
}

export default Footer
