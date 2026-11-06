import api from './api'

//================================
// Criar repsonsável
//================================
export const criarResponsavel = async (valores) => {
    const responsavel = { //guardo o valor mandado pelo formulario e transformo em um objeto com as chaves que o backend espera
        nome: valores.nome,
        email: valores.email,
        cpf: valores.cpf.replace(/\D/g, ''), //removo os caracteres que não são números do cpf
        telefone: valores.telefone.replace(/\D/g, ''), //removo os caracteres que não são números do telefone
        endereco: valores.endereco,
    }

    const response = await api.post('/responsavel', responsavel, {skipGlobalErrorToast: true}) //mando as informações para o backend
    return response.data.responsavel //devolvo a resposta do backend
}

//==============================
//LISTAR RESPONSAVEL
//==============================
export const listarResponsaveis = async () => {
    const response = await api.get('/responsavel', {skipGlobalErrorToast: true}) //peço as informações para o backend
    return response.data.responsaveis //devolvo a resposta do backend
}

//==============================
//OBTER RESPONSAVEL ESPECIFICO
//==============================
export const obterResponsavel = async (id) => {
    const response = await api.get(`/responsavel/${id}`, {skipGlobalErrorToast: true}) //peço os dados de um responsavel especifico para o backend
    return response.data.responsavel //devolvo os dados do responsavel para o cliente
}


//==============================
//ALTERAR RESPONSAVEL
//==============================
export const alterarResponsavel = async (id, valores) => {
    const responsavel = { //guardo o valor mandado pelo formulario e transformo em um objeto com as chaves que o backend espera
        nome: valores.nome,
        email: valores.email,
        cpf: valores.cpf.replace(/\D/g, ''), //removo os caracteres que não são números do cpf
        telefone: valores.telefone.replace(/\D/g, ''), //removo os caracteres que não são números do telefone
        endereco: valores.endereco,
    }

    const response = await api.patch(`/responsavel/${id}`, responsavel, {skipGlobalErrorToast: true}) //mando as informações para o backend
    return response.data.responsavel //devolvo a resposta do backend
}

//==============================
//EXCLUIR RESPONSAVEL
//==============================
export const excluirResponsavel = async (id) => {
    await api.delete(`/responsavel/${id}`, {skipGlobalErrorToast: true}) //mando o id do responsavel para o backend excluir o cadastro
}