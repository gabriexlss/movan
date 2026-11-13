import ListaContratos from './cards/ListaContratos'
import styles from './contratos.module.css'

const Contratos = () => {
    return (
        <main className={styles.container} aria-label="Contratos">
            <ListaContratos />
        </main>
    )
}

export default Contratos
