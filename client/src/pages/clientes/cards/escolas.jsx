import { useEffect, useState } from "react"
import { alterarEscola, criarEscola, excluirEscola, listarEscola } from "../../../services/escola"
import { criarTurnoEscola, listarTurnosEscola } from "../../../services/turnosEscola"
import ListaClientes from "./ListaClientes"
import toast from 'react-hot-toast'

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
        setEscola((listaAtual) => [
            adaptarParaLista(escolaCriada),
            ...listaAtual,
        ])

        const resultados = await Promise.allSettled((valores.turnos || []).map((turno) => (
            criarTurnoEscola({ ...turno, escolaId: escolaCriada.id })
        )))
        setTurnos((listaAtual) => [
            ...listaAtual,
            ...resultados.filter((resultado) => resultado.status === 'fulfilled').map((resultado) => resultado.value),
        ])

        if (resultados.some((resultado) => resultado.status === 'rejected')) {
            toast.error('A escola foi cadastrada, mas alguns turnos não foram salvos. Abra a edição da escola para adicioná-los novamente.')
        }
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
