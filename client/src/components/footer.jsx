import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

import {ReactComponent as iconHome} from '../assets/media/icons/icon-home.svg';
import {ReactComponent as iconFinanceiro} from '../assets/media/icons/icon-carteira.svg';
import {ReactComponent as iconClientes} from '../assets/media/icons/icon-clientes.svg';
import {ReactComponent as iconRotas} from '../assets/media/icons/icon-routes.svg';
import {ReactComponent as iconPerfil} from '../assets/media/icons/icon-perfil.svg';

const footer = () => {

    const navFooter = [
        {to: '/', label: 'Home', icon: iconHome},
        {to: '/financeiro', label: 'Financeiro', icon: iconFinanceiro},
        {to: '/rota', label: 'Rota', icon: iconRotas},
        {to: '/clientes', label: 'Clientes', icon: iconClientes},
        {to: '/perfil', label: 'Perfil', icon: iconPerfil}
    ];

    return (
        <footer className="footer">
            <nav>
                {navFooter.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                        <Link key={item.to} to={item.to} className="footer-link">
                            <Icon className="footer-icon" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </footer>
    )
}

export default footer