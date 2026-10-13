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

export const listarResponsaveis = async () => {
    const response = await api.get('/responsavel', {skipGlobalErrorToast: true}) //peço as informações para o backend
    return response.data.responsaveis //devolvo a resposta do backend
}