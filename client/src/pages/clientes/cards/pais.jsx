import ListaClientes from './ListaClientes'
import {
    criarResponsavel,
    alterarResponsavel,
    excluirResponsavel,
} from '../../../services/responsaveis'
const adaptarParaLista = (responsavel) => ({ //função que pega as informações mandadas pelo backend e deixa formatado para o cliente
    ...responsavel,
    detalhes: [responsavel.telefone, responsavel.email, responsavel.endereco,].filter(Boolean),
})

const Pais = ({ responsaveis, onResponsaveisChange }) => {

    //====================
    //SALVAR RESPONSAVEL
    //====================
    const salvarNovoResponsavel = async (valores) => {
        const responsavelCriado = await criarResponsavel(valores) //crio um novo responsavel com as informações mandadas pelo formulario

        onResponsaveisChange((listaAtual) => [
            adaptarParaLista(responsavelCriado),
            ...listaAtual,
        ])
    }

    //====================
    //ALTERAR RESPONSAVEL
    //====================
    const salvarResponsavelAlterado = async (id, valores) => {
        const salvo = await alterarResponsavel(id, valores)
        onResponsaveisChange((listaAtual) => listaAtual.map((responsavel) => (
            responsavel.id === id
                ? adaptarParaLista({ ...responsavel, ...valores, ...(salvo || {}) })
                : responsavel
        )))
        return salvo
    }

    //====================
    //EXCLUIR RESPONSAVEL
    //====================
    const excluirResponsavelDoBanco = async (id) => {
        await excluirResponsavel(id)
        onResponsaveisChange((listaAtual) => listaAtual.filter((responsavel) => responsavel.id !== id))
    }

    return (
        <ListaClientes
            title="Lista de pais"
            tipo="responsavel"
            registros={responsaveis} //falo que os registros mostrados são os responsaveis
            onCriar={salvarNovoResponsavel} //mando a função de salvar o novo responsavel para o componente de lista de clientes
            onEditar={salvarResponsavelAlterado}
            onExcluir={excluirResponsavelDoBanco}
        />
    )
}

export default Pais
