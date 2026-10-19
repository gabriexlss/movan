import { useEffect, useState } from "react"
import { criarEscola, listarEscola } from "../../../services/escola"
import ListaClientes from "./ListaClientes"

const adaptarParaLista = (escola) => ({
    ...escola,
    detalhes: [escola.telefone, escola.endereco].filter(Boolean)
})

const Escolas = () => {
    const [escola, setEscola] = useState([])

    useEffect(() => { 
        const carregarEscola = async () => {
            const dados = await listarEscola()

            setEscola(dados.map(adaptarParaLista))
        }
        carregarEscola()
    }, [])

    const salvarNovaEscola = async (valores) => {
        const escolaCriada = await criarEscola(valores)

        setEscola((listaAtual) => [
            adaptarParaLista(escolaCriada),
            ...listaAtual,
        ])
    }

    return (
        <ListaClientes
            title="Lista de escolas"
            tipo="escola"
            registros={escola}
            onCriar={salvarNovaEscola}
        />
    )
}

export default Escolas