import styles from './DefaultCard.module.css';
import { Link } from 'react-router-dom';

<<<<<<< HEAD
const DefaultCard = ({ title, children, link, compactTitle = false, headerContent, titleClassName = '' }) => {
    const titleClasses = `${styles['card-header']} ${compactTitle ? styles.compact : ''} ${titleClassName}`

=======
const DefaultCard = ({ title, children, link, compactTitle = false }) => {
>>>>>>> main
    return (
        <section className={styles.card}>
            {headerContent ? (
                <header className={styles['card-header-container']}>
                    <h1 className={titleClasses}>{title}</h1>
                    {headerContent}
                </header>
            ) : (
                <h1 className={titleClasses}>{title}</h1>
            )}

            {children}

            {link && (
                <Link to={link} className={styles.BtnVerMensalidade}>
                    Ver detalhes
                </Link>
            )}

        </section>
    )
}

export default DefaultCard
