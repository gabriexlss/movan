import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa'
import DefaultCard from '../../../components/cards/DefaultCard'
import styles from './PainelLista.module.css'

const PainelLista = ({
    title,
    page,
    totalPages,
    totalItems,
    itemsPerPage,
    itemLabel,
    onPageChange,
    onAction,
    actionLabel = 'Nova entrada',
    children,
    showAction = true,
}) => {
    const primeiroItem = totalItems ? page * itemsPerPage + 1 : 0
    const ultimoItem = Math.min((page + 1) * itemsPerPage, totalItems)

    return (
        <DefaultCard
            title={title}
            titleClassName={styles.tituloCard}
            headerContent={showAction ? (
                <button
                    type="button"
                    className={styles.novo}
                    onClick={onAction}
                    aria-haspopup="dialog"
                >
                    <FaPlus aria-hidden="true" />
                    <span>{actionLabel}</span>
                </button>
            ) : null}
        >
            <div className={styles.painelLista}>
                <div className={styles.conteudo}>{children}</div>

                <footer className={styles.rodapeLista}>
                    <span aria-live="polite">
                        {primeiroItem}-{ultimoItem} de {totalItems} {itemLabel}
                    </span>
                    <nav className={styles.paginacao} aria-label={`Páginas de ${title}`}>
                        <button
                            type="button"
                            aria-label="Página anterior"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 0}
                        >
                            <FaChevronLeft aria-hidden="true" />
                        </button>
                        <span>{page + 1} / {totalPages}</span>
                        <button
                            type="button"
                            aria-label="Próxima página"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page + 1 >= totalPages}
                        >
                            <FaChevronRight aria-hidden="true" />
                        </button>
                    </nav>
                </footer>
            </div>
        </DefaultCard>
    )
}

export default PainelLista
