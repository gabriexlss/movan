import api from "./api"

//==========================
//CRIAR ALUNO
//==========================
export const criarAluno = async (valores) => {
    const aluno = { //guardo aqui os valores bonitinhos para criar o aluno
        nome: valores.nome,
        data_nasc: valores.dataNascimento,
        ano_escolar: valores.anoEscolar,
        observacao: valores.informacoesGerais,
        endereco: valores.endereco,
        responsavel_id: Number(valores.responsavelId),
        escola_id: Number(valores.escolaId),
        escola_turno_id: Number(valores.escolaTurnoId),
        latitude: Number(valores.latitude),
        longitude: Number(valores.longitude),
    }

    const response = await api.post('/aluno', aluno, {skipGlobalErrorToast: true}) //mando pro backend para ele criar
    return response.data.aluno //devolvo a resposta do backend
}

//==========================
//LISTAR ALUNO
//==========================
export const listarAluno = async () => { //fução para listar os alunos
    const response = await api.get('aluno', {skipGlobalErrorToast: true}) //pego as informações dos alunos no banco
    return response.data.alunos //mando a resposta do backend
}

//==========================
//OBTER ALUNO ESPECIFICO
//==========================
export const obterAluno = async (id) => {
    const response = await api.get(`/aluno/${id}`, {skipGlobalErrorToast: true}) //peço os dados de um aluno especifico para o backend
    return response.data.aluno //devolvo os dados do aluno para o cliente
}

//==========================
//ALTERAR ALUNO
//==========================
export const alterarAluno = async (id, valores) => {
    const aluno = { //guardo o valor mandado pelo formulario e transformo nas chaves que o backend espera
        nome: valores.nome,
        data_nasc: valores.dataNascimento,
        ano_escolar: valores.anoEscolar,
        observacao: valores.informacoesGerais,
        endereco: valores.endereco,
        escola_id: Number(valores.escolaId), //converto o id da escola para numero porque o select devolve uma string
        escola_turno_id: Number(valores.escolaTurnoId),
        latitude: Number(valores.latitude),
        longitude: Number(valores.longitude),
    }

    const response = await api.patch(`/aluno/${id}`, aluno, {skipGlobalErrorToast: true}) //mando os dados alterados para o backend
    return response.data.aluno || valores //devolvo o aluno alterado ou os valores enviados caso a API nao retorne o aluno
}

//==========================
//EXCLUIR ALUNO
//========================
export const excluirAluno = async (id) => {
    await api.delete(`/aluno/${id}`, {skipGlobalErrorToast: true}) //mando o id do aluno para o backend excluir o cadastro
}