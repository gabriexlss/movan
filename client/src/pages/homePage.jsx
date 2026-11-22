import TituloTela from '../components/layout/tituloTela'
import CardHorarios from '../components/cards/CardHorarios'
import CardRotas from '../components/cards/CardRotas'
import CardMensali from '../components/cards/CardMensali'
import CardFinanc from '../components/cards/CardFinanc'
import CardAluno from '../components/cards/CardAluno'
import { useAuth } from '../context/useAuth'
import styles from './homePage.module.css'

const HomePage = () => {
    const { user, isLoading } = useAuth()
    const primeiroNome = user?.nome?.trim().split(/\s+/)[0]
    const nome = primeiroNome || (isLoading ? '' : 'Motorista')

    return (
        <main className={styles.pagina}>
            <TituloTela title={`Olá, ${nome}`} className={styles.titulo} />
            <div className={styles.rotina}>
                <CardHorarios />
                <CardRotas />
            </div>
            <div className={styles.indicadores}>
                <CardMensali className={styles.mensalidades} />
                <CardFinanc className={styles.financeiro} />
                <CardAluno className={styles.alunos} />
            </div>
        </main>
    )

}

export default HomePage
