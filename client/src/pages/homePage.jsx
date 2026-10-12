import TituloTela from '../components/layout/tituloTela'
import CardHorarios from '../components/cards/CardHorarios'
import CardRotas from '../components/cards/CardRotas'
import CardMensali from '../components/cards/CardMensali'
import CardFinanc from '../components/cards/CardFinanc'
import CardAluno from '../components/cards/CardAluno'
import { useAuth } from '../context/useAuth'

const HomePage = () => {
    const { user, isLoading } = useAuth()
    const primeiroNome = user?.nome?.trim().split(/\s+/)[0]
    const nome = primeiroNome || (isLoading ? '' : 'Motorista')

    return (
        <main className='homePage'>
            <TituloTela title={`Olá, ${nome}`} />
            <CardHorarios />
            <CardRotas />
            <CardMensali />
            <CardFinanc />
            <CardAluno />
        </main>
    )

}

export default HomePage
