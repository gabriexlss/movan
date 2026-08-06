import './DefaultCard.css';
import { Link } from 'react-router-dom';

const DefaultCard = ({ title, children, link, compactTitle = false }) => {
    return (
        <section className="card">
            <h1 className={`card-header ${compactTitle ? "compact" : ""}`}>{title}</h1>

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