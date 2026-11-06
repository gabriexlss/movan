import { useEffect, useState } from "react"
import { alterarEscola, criarEscola, excluirEscola, listarEscola } from "../../../services/escola"
import { criarTurnoEscola, listarTurnosEscola } from "../../../services/turnosEscola"
import ListaClientes from "./ListaClientes"

const adaptarParaLista = (escola) => ({
    ...escola,
    detalhes: [escola.telefone, escola.endereco].filter(Boolean)
})

const Escolas = () => {
    const [escola, setEscola] = useState([])
    const [turnos, setTurnos] = useState([])

    useEffect(() => { 
        const carregarEscola = async () => {
            const [dados, dadosTurnos] = await Promise.all([listarEscola(), listarTurnosEscola()])
            setEscola(dados.map(adaptarParaLista))
            setTurnos(dadosTurnos)
        }
        carregarEscola()
    }, [])

    const salvarNovaEscola = async (valores) => {
        const escolaCriada = await criarEscola(valores)
        const turnoInicial = valores.turnoInicial

        if (turnoInicial?.horaEntrada && turnoInicial?.horaSaida) {
            const turnoCriado = await criarTurnoEscola({
                ...turnoInicial,
                escolaId: escolaCriada.id,
            })
            setTurnos((listaAtual) => [...listaAtual, turnoCriado])
        }

        setEscola((listaAtual) => [
            adaptarParaLista(escolaCriada),
            ...listaAtual,
        ])
    }

    //====================
    //ALTERAR ESCOLA
    //====================
    const salvarEscolaAlterada = (id, valores) => alterarEscola(id, valores) //mando os dados alterados para o backend

    //====================
    //EXCLUIR ESCOLA
    //====================
    const excluirEscolaDoBanco = async (id) => {
        await excluirEscola(id)
        setEscola((listaAtual) => listaAtual.filter((item) => item.id !== id))
        setTurnos((listaAtual) => listaAtual.filter((turno) => String(turno.escola_id) !== String(id)))
    }

    return (
        <ListaClientes
            title="Lista de escolas"
            tipo="escola"
            registros={escola}
            turnos={turnos}
            onTurnosChange={setTurnos}
            onCriar={salvarNovaEscola}
            onEditar={salvarEscolaAlterada}
            onExcluir={excluirEscolaDoBanco}
        />
    )
}

export default Escolas