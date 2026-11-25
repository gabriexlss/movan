import { useEffect, useState } from 'react'
import TituloTela from '../components/layout/tituloTela'
import CardHorarios from '../components/cards/CardHorarios'
import CardRotas from '../components/cards/CardRotas'
import CardMensali from '../components/cards/CardMensali'
import CardFinanc from '../components/cards/CardFinanc'
import CardAluno from '../components/cards/CardAluno'
import { useAuth } from '../context/useAuth'
import { listarAluno } from '../services/aluno'
import { listarEscola } from '../services/escola'
import { listarRotas, obterPontosRota } from '../services/rotas'
import { listarTurnosEscola } from '../services/turnosEscola'
import { obterDiaSemanaAtual } from '../utils/periodoRota'
import styles from './homePage.module.css'

const ESTADO_INICIAL_HOME = {
    carregando: true,
    rotasDoDia: [],
    pontosPorRotaId: {},
    turnosEscola: [],
    escolas: [],
    alunos: [],
    erroRotas: false,
    erroTurnos: false,
    erroEscolas: false,
    erroAlunos: false,
}

const HomePage = () => {
    const { user, isLoading } = useAuth()
    const [dadosHome, setDadosHome] = useState(ESTADO_INICIAL_HOME)

    useEffect(() => {
        let ativo = true

        const carregar = async () => {
            const dia = obterDiaSemanaAtual()
            const [resRotas, resTurnos, resEscolas, resAlunos] = await Promise.allSettled([
                listarRotas({ dia }),
                listarTurnosEscola(),
                listarEscola(),
                listarAluno(),
            ])

            const rotasDoDia = resRotas.status === 'fulfilled' ? (resRotas.value || []) : []
            let erroRotas = resRotas.status !== 'fulfilled'
            let pontosPorRotaId = {}

            if (resRotas.status === 'fulfilled' && rotasDoDia.length > 0) {
                try {
                    const pares = await Promise.all(
                        rotasDoDia.map(async (rota) => [rota.id, await obterPontosRota(rota.id)]),
                    )
                    pontosPorRotaId = Object.fromEntries(pares)
                } catch {
                    erroRotas = true
                }
            }

            if (ativo) {
                setDadosHome({
                    carregando: false,
                    rotasDoDia,
                    pontosPorRotaId,
                    turnosEscola: resTurnos.status === 'fulfilled' ? (resTurnos.value || []) : [],
                    escolas: resEscolas.status === 'fulfilled' ? (resEscolas.value || []) : [],
                    alunos: resAlunos.status === 'fulfilled' ? (resAlunos.value || []) : [],
                    erroRotas,
                    erroTurnos: resTurnos.status !== 'fulfilled',
                    erroEscolas: resEscolas.status !== 'fulfilled',
                    erroAlunos: resAlunos.status !== 'fulfilled',
                })
            }
        }

        carregar()

        return () => {
            ativo = false
        }
    }, [])

    const primeiroNome = user?.nome?.trim().split(/\s+/)[0]
    const nome = primeiroNome || (isLoading ? '' : 'Motorista')

    return (
        <main className={styles.pagina}>
            <TituloTela title={`Olá, ${nome}`} className={styles.titulo} />
            <div className={styles.rotina}>
                <CardHorarios dadosHome={dadosHome} />
                <CardRotas dadosHome={dadosHome} />
            </div>
            <div className={styles.indicadores}>
                <CardMensali className={styles.mensalidades} />
                <CardFinanc className={styles.financeiro} />
                <CardAluno className={styles.alunos} dadosHome={dadosHome} />
            </div>
        </main>
    )

}

export default HomePage
