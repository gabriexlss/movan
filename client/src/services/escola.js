import api from "./api"

//==========================
//CRIAR ESCOLA
//==========================
export const criarEscola = async (valores) => {
    const escola = { //guardo aqui os valores bonitinhos para criar a escola
        nome: valores.nome,
        endereco: valores.endereco,
        telefone: valores.telefone.replace(/\D/g, ''), //removo os caracteres que não são números do telefone
        latitude: valores.latitude,
        longitude: valores.longitude,
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

