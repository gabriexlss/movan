import './DefaultCard.css';
import { Link } from 'react-router-dom';

const DefaultCard = ({ title, children, link }) => {
    return (
        <section className="card">
            <h1 className="card-header">{title}</h1>

            {children}

            {link && (
                <Link to={link} className="BtnVerMensalidade">
                    Ver Detalhes
                </Link>
            )}

        </section>
    )
}

export default DefaultCard