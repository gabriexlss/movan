import TituloTela from '../../components/layout/tituloTela'
import Alunos from './cards/alunos'
import Escolas from './cards/escolas'
import Pais from './cards/pais'
import styles from './cliente.module.css'

const Cliente = () => {
    return (
        <main className={styles.container}>
            <TituloTela title="Veja seus clientes." />

            <Pais />
            <Alunos />
            <Escolas />
        </main>
    )
}

export default Cliente
