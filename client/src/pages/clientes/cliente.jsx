import { useEffect, useState } from 'react'
import TituloTela from '../../components/layout/tituloTela'
import { listarEscola } from '../../services/escola'
import { listarResponsaveis } from '../../services/responsaveis'
import { listarTurnosEscola } from '../../services/turnosEscola'
import Alunos from './cards/alunos'
import Escolas from './cards/escolas'
import Pais from './cards/pais'
import styles from './cliente.module.css'

const Cliente = () => {
    const [responsaveis, setResponsaveis] = useState([])
    const [escolas, setEscolas] = useState([])
    const [turnos, setTurnos] = useState([])

    useEffect(() => {
        Promise.all([listarResponsaveis(), listarEscola(), listarTurnosEscola()])
            .then(([dadosResponsaveis, dadosEscolas, dadosTurnos]) => {
                setResponsaveis(dadosResponsaveis)
                setEscolas(dadosEscolas)
                setTurnos(dadosTurnos)
            })
    }, [])

    return (
        <main className={styles.container}>
            <TituloTela title="Veja seus clientes." />

            <Pais responsaveis={responsaveis} onResponsaveisChange={setResponsaveis} />
            <Alunos responsaveis={responsaveis} escolas={escolas} turnos={turnos} />
            <Escolas
                escolas={escolas}
                onEscolasChange={setEscolas}
                turnos={turnos}
                onTurnosChange={setTurnos}
            />
        </main>
    )
}

export default Cliente
