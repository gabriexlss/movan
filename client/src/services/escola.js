import api from "./api"

const prepararCoordenadas = (valores) => ({
    latitude: Number(valores.latitude),
    longitude: Number(valores.longitude),
})

//==========================
//CRIAR ESCOLA
//==========================
export const criarEscola = async (valores) => {
    const coordenadas = prepararCoordenadas(valores)
    const escola = { //guardo aqui os valores bonitinhos para criar a escola
        nome: valores.nome,
        endereco: valores.endereco,
        telefone: valores.telefone.replace(/\D/g, ''), //removo os caracteres que não são números do telefone
        ...coordenadas,
    }

    const response = await api.post('/escola', escola, {skipGlobalErrorToast: true}) //mando pro backend para ele criar
    return response.data.escola //devolvo a resposta do backend
}

//==========================
//LISTAR ESCOLA
//==========================
export const listarEscola = async () => { //fução para listar as escolas
    const response = await api.get('escola', {skipGlobalErrorToast: true}) //pego as informações das escolas no banco
    return response.data.escolas //mando a resposta do backend
}

export const obterEscola = async (id) => {
    const response = await api.get(`/escola/${id}`, {skipGlobalErrorToast: true}) //peço os dados de uma escola especifica para o backend
    return response.data.escola //devolvo os dados da escola para o cliente
}

//==========================
//ALTERAR ESCOLA
//==========================
export const alterarEscola = async (id, valores) => {
    const coordenadas = prepararCoordenadas(valores)
    const escola = { //guardo o valor mandado pelo formulario e transformo nas chaves que o backend espera
        nome: valores.nome,
        endereco: valores.endereco,
        telefone: valores.telefone.replace(/\D/g, ''), //removo os caracteres que nao sao numeros do telefone
        ...coordenadas,
    }

    const response = await api.patch(`/escola/${id}`, escola, {skipGlobalErrorToast: true}) //mando os dados alterados para o backend
    return response.data.escola || { ...valores, ...coordenadas } //devolvo a escola alterada ou os valores enviados caso a API nao retorne a escola
}

//==========================
//EXCLUIR ESCOLA
//==========================
export const excluirEscola = async (id) => {
    await api.delete(`/escola/${id}`, {skipGlobalErrorToast: true}) //mando o id da escola para o backend excluir o cadastro
}

