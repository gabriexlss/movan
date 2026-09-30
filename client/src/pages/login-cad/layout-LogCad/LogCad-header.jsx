import styles from './LogCad-header.module.css'

const LogCadHeader = ({ modo }) => {
    return (
        <div className={`${styles['LogCad-header-container']} ${styles[modo]}`}>
            <h1 className={styles['titulo-header']}>MO<span className={styles[modo]}>VAN</span></h1>
            <p>Seu caminho mais seguro<br/>na palma da sua mão</p>
        </div>
    )
}

export default LogCadHeader
