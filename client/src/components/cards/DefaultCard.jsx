import styles from './DefaultCard.module.css';
import { Link } from 'react-router-dom';

const DefaultCard = ({
    title,
    children,
    link,
    linkLabel = 'Ver detalhes',
    compactTitle = false,
    headerContent,
    titleClassName = '',
    headerContentClassName = '',
}) => {
    return (
        <section className={styles.card}>
            {headerContent ? (
                <div className={styles['card-header-container']}>
                    <h1 className={`${styles['card-header']} ${compactTitle ? styles.compact : ''} ${titleClassName}`}>
                        {title}
                    </h1>
                    <div className={`${styles['card-header-content']} ${headerContentClassName}`}>{headerContent}</div>
                </div>
            ) : (
                <h1 className={`${styles['card-header']} ${compactTitle ? styles.compact : ''} ${titleClassName}`}>
                    {title}
                </h1>
            )}

            {children}

            {link && (
                <Link to={link} className={styles.BtnVerMensalidade}>
                    {linkLabel}
                </Link>
            )}

        </section>
    )
}

export default DefaultCard
