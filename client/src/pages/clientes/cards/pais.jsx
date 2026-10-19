import { useEffect, useState } from 'react'
import ListaClientes from './ListaClientes'
import {
    criarResponsavel,
    listarResponsaveis,
} from '../../../services/responsaveis'
import toast from 'react-hot-toast'

const adaptarParaLista = (responsavel) => ({ //função que pega as informações mandadas pelo backend e deixa formatado para o cliente
    ...responsavel,
    detalhes: [responsavel.telefone, responsavel.email, responsavel.endereco,].filter(Boolean),
})

const Pais = () => {
    const [responsaveis, setResponsaveis] = useState([])

    //============================
    //CARREGAR RESPONSAVEIS 
    //============================
    useEffect(() => { //quando o componete carrega
        const carregarResponsaveis = async () => {
            const dados = await listarResponsaveis() //pego as informações do backend

            setResponsaveis(dados.map(adaptarParaLista)) //falo que as informações do responsavel mostradas são as mandadas pelo backend e formato ela para oque o cliente espera
        }
        carregarResponsaveis() //falo para usar a função de carregar os responsaveis
    }, [])

    //====================
    //SALVAR RESPONSAVEL
    //====================
    const salvarNovoResponsavel = async (valores) => {
        const responsavelCriado = await criarResponsavel(valores) //crio um novo responsavel com as informações mandadas pelo formulario

        setResponsaveis((listaAtual) => [ //falo que a os responsaveis mostrados são a lista atual mais o novo criado
            adaptarParaLista(responsavelCriado), 
            ...listaAtual,
        ])
    }

    return (
        <ListaClientes
            title="Lista de pais"
            tipo="responsavel"
            registros={responsaveis} //falo que os registros mostrados são os responsaveis
            onCriar={salvarNovoResponsavel} //mando a função de salvar o novo responsavel para o componente de lista de clientes
        />
    )
}

export default Pais
