import TituloTela from '../components/layout/tituloTela'
import CardHorarios from '../components/cards/CardHorarios'
import CardRotas from '../components/cards/CardRotas'
import CardMensali from '../components/cards/CardMensali'
import CardFinanc from '../components/cards/CardFinanc'
import CardAluno from '../components/cards/CardAluno'

const HomePage = () => {
    return (
        <main className='homePage'>
            <TituloTela title="Olá, Motorista!" />
            <CardHorarios />
            <CardRotas />
            <CardMensali />
            <CardFinanc />
            <CardAluno />
        </main>
    )

}

export default HomePage
