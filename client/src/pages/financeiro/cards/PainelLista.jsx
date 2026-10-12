import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import DefaultCard from '../../../components/cards/DefaultCard'
import styles from './PainelLista.module.css'

const PainelLista = ({ title, page, totalPages, onPageChange, children, showAction = true }) => (
    <DefaultCard
        title={title}
        headerContent={
            <>
                <nav
                    className={`${styles.paginacao} ${!showAction ? styles['paginacao--direita'] : ''}`}
                    aria-label={`Páginas de ${title}`}
                >
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

                {showAction && (
                    <button type="button" className={styles.alterar}>
                        <FaPlus aria-hidden="true" />
                        <span>Alterar / Adicionar</span>
                    </button>
                )}
            </>
        }
    >
        <div className={styles.conteudo}>
            {children}
        </div>
    </DefaultCard>
)

export default PainelLista
