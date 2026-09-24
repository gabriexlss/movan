import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import styles from './PainelLista.module.css'

const PainelLista = ({ title, page, totalPages, onPageChange, children }) => (
    <section className={styles.card}>
        <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>

            <nav className={styles.paginacao} aria-label={`Páginas de ${title}`}>
                <button
                    type="button"
                    className={styles.seta}
                    aria-label="Página anterior"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                >
                    <FaChevronLeft aria-hidden="true" />
                </button>
                <span aria-live="polite">{page + 1}</span>
                <button
                    type="button"
                    className={styles.seta}
                    aria-label="Próxima página"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page + 1 === totalPages}
                >
                    <FaChevronRight aria-hidden="true" />
                </button>
            </nav>

            <button type="button" className={styles.alterar}>
                <FaPlus aria-hidden="true" />
                <span>Alterar / Adicionar</span>
            </button>
        </header>
        {children}
    </section>
)

export default PainelLista
