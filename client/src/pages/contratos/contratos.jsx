import ListaContratos from './cards/ListaContratos'
import TituloTela from '../../components/layout/tituloTela'
import styles from './contratos.module.css'

const Contratos = () => {
    return (
        <main className={styles.container} aria-label="Contratos">
            <TituloTela title="Contratos"></TituloTela>
            <ListaContratos />
        </main>
    )
}

export default Contratos
