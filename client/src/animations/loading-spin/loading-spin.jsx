import { CgSpinner } from "react-icons/cg";
import styles from './loading-spin.module.css'

const LoadingSpinner = ({ fullPage = false }) => {
    return (
        <div
            className={`${styles.loadingSpin}${fullPage ? ` ${styles.fullPage}` : ''}`}
            role="status"
            aria-label="Carregando"
        >
            <CgSpinner className={styles.loadingSpinIcon} aria-hidden="true" />
        </div>
    )
}

export default LoadingSpinner
