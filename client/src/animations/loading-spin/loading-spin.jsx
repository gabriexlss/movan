import { CgSpinner } from "react-icons/cg";
import styles from './loading-spin.module.css'

const LoadingSpinner = () => {
    return (
        <div className={styles.loadingSpin}>
            <CgSpinner className={styles.loadingSpinIcon} />
        </div>
    )
}

export default LoadingSpinner