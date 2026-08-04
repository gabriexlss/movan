import { NavLink } from 'react-router-dom';
import './footer.css';

import { GoHome } from 'react-icons/go';
import { MdAltRoute, MdOutlineAccountBalanceWallet } from 'react-icons/md';
import { BsFillPeopleFill } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';

const footer = () => {

    const navFooter = [
        {to: '/', label: 'Home', icon: GoHome},
        {to: '/financeiro', label: 'Financeiro', icon: MdOutlineAccountBalanceWallet},
        {to: '/rota', label: 'Rota', icon: MdAltRoute},
        {to: '/clientes', label: 'Clientes', icon: BsFillPeopleFill},
        {to: '/perfil', label: 'Perfil', icon: CgProfile}
    ];

    return (
        <footer className="footer">
            <nav>
                {navFooter.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                        <NavLink key={item.to} to={item.to} className="footer-link">
                            <Icon className="footer-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </footer>
    )
}

export default footer