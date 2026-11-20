import { alterarEscola, criarEscola, excluirEscola } from "../../../services/escola"
import { criarTurnoEscola } from "../../../services/turnosEscola"
import ListaClientes from "./ListaClientes"
import toast from 'react-hot-toast'

const adaptarParaLista = (escola) => ({
    ...escola,
    detalhes: [escola.telefone, escola.endereco].filter(Boolean)
})

const Escolas = ({ escolas, onEscolasChange, turnos, onTurnosChange }) => {

    const salvarNovaEscola = async (valores) => {
        const escolaCriada = await criarEscola(valores)
        onEscolasChange((listaAtual) => [
            adaptarParaLista(escolaCriada),
            ...listaAtual,
        ])

        const turnosParaCriar = valores.turnos || (
            valores.turnoInicial?.horaEntrada && valores.turnoInicial?.horaSaida
                ? [valores.turnoInicial]
                : []
        )
        const resultados = await Promise.allSettled(turnosParaCriar.map((turno) => (
            criarTurnoEscola({ ...turno, escolaId: escolaCriada.id })
        )))
        onTurnosChange((listaAtual) => [
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
    const salvarEscolaAlterada = async (id, valores) => {
        const salvo = await alterarEscola(id, valores)
        onEscolasChange((listaAtual) => listaAtual.map((escola) => (
            escola.id === id
                ? adaptarParaLista({ ...escola, ...valores, ...(salvo || {}) })
                : escola
        )))
        return salvo
    }

    //====================
    //EXCLUIR ESCOLA
    //====================
    const excluirEscolaDoBanco = async (id) => {
        await excluirEscola(id)
        onEscolasChange((listaAtual) => listaAtual.filter((item) => item.id !== id))
        onTurnosChange((listaAtual) => listaAtual.filter((turno) => String(turno.escola_id) !== String(id)))
    }

    return (
        <ListaClientes
            title="Lista de escolas"
            tipo="escola"
            registros={escolas}
            turnos={turnos}
            onTurnosChange={onTurnosChange}
            onCriar={salvarNovaEscola}
            onEditar={salvarEscolaAlterada}
            onExcluir={excluirEscolaDoBanco}
        />
    )
}

export default Escolas
