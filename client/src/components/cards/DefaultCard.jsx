import styles from './DefaultCard.module.css';
import { Link } from 'react-router-dom';

const DefaultCard = ({ title, children, link, compactTitle = false }) => {
    return (
        <section className={styles.card}>
            <h1 className={`${styles['card-header']} ${compactTitle ? styles.compact : ''}`}>{title}</h1>

            {children}

            {link && (
                <Link to={link} className={styles.BtnVerMensalidade}>
                    Ver Detalhes
                </Link>
            )}

        </section>
    )
}

export default DefaultCard
