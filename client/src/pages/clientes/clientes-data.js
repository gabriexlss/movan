export const responsaveis = [
    {
        id: 'responsavel-1',
        nome: 'Bianca Nogueira',
        email: 'bianca@email.com',
        cpf: '123.456.789-01',
        telefone: '(11) 99999-0000',
        endereco: 'Rua das Acácias, 125 · Jardim Nakamura',
        informacoesGerais: 'Responsável financeira pelos alunos vinculados.',
        situacaoContrato: 'ativo',
        detalhes: ['(11) 99999-0000', 'bianca@email.com', 'Jardim Nakamura'],
        badge: '2 alunos',
        contratos: [
            { id: 'CTR-2026-001', nome: 'Transporte escolar 2026', situacao: 'ativo', valor: 'R$ 900,00/mês', vencimento: 'Dia 10' },
        ],
    },
    {
        id: 'responsavel-2',
        nome: 'Thiago Teixeira',
        email: 'thiago@email.com',
        cpf: '234.567.890-12',
        telefone: '(11) 98888-0000',
        endereco: 'Rua das Palmeiras, 84 · Jardim Ângela',
        informacoesGerais: 'Prefere receber avisos e cobranças por e-mail.',
        situacaoContrato: 'pendente',
        detalhes: ['(11) 98888-0000', 'thiago@email.com', 'Jardim Ângela'],
        badge: '2 alunos',
        contratos: [
            { id: 'CTR-2026-002', nome: 'Transporte escolar 2026', situacao: 'pendente', valor: 'R$ 900,00/mês', vencimento: 'Dia 15' },
        ],
    },
    {
        id: 'responsavel-3',
        nome: 'Carlos Fabrício',
        email: 'carlos@email.com',
        cpf: '345.678.901-23',
        telefone: '(11) 97777-0000',
        endereco: 'Avenida do Sol, 310 · Vila do Sol',
        informacoesGerais: 'Contato principal por telefone.',
        situacaoContrato: 'atrasado',
        detalhes: ['(11) 97777-0000', 'carlos@email.com', 'Vila do Sol'],
        badge: '1 aluno',
        contratos: [
            { id: 'CTR-2026-003', nome: 'Transporte escolar 2026', situacao: 'atrasado', valor: 'R$ 450,00/mês', vencimento: 'Dia 5' },
        ],
    },
    {
        id: 'responsavel-4',
        nome: 'Ricardo Manuel',
        email: 'ricardo@email.com',
        cpf: '456.789.012-34',
        telefone: '(11) 96666-0000',
        endereco: 'Rua São Luís, 42 · Jardim São Luís',
        informacoesGerais: 'Responsável autorizado para buscar a aluna.',
        situacaoContrato: 'ativo',
        detalhes: ['(11) 96666-0000', 'ricardo@email.com', 'Jardim São Luís'],
        badge: '1 aluno',
        contratos: [
            { id: 'CTR-2026-004', nome: 'Transporte escolar 2026', situacao: 'ativo', valor: 'R$ 450,00/mês', vencimento: 'Dia 10' },
        ],
    },
]

export const escolas = [
    {
        id: 'escola-1',
        nome: 'ETEC Jardim Ângela',
        telefone: '(11) 5555-1000',
        funcionamento: '07:00 às 22:30',
        endereco: 'Estrada da Baronesa, 1695 · Jardim Nakamura · São Paulo - SP, 04941-175',
        detalhes: ['Estrada da Baronesa, 1695', 'Jardim Nakamura · (11) 5555-1000'],
        badge: '2 alunos',
    },
    {
        id: 'escola-2',
        nome: 'EMEF Paulo Freire',
        telefone: '(11) 5555-2000',
        funcionamento: '07:00 às 18:00',
        endereco: 'Rua das Flores, 120 · Jardim São Luís · São Paulo - SP',
        detalhes: ['Rua das Flores, 120', 'Jardim São Luís · (11) 5555-2000'],
        badge: '2 alunos',
    },
    {
        id: 'escola-3',
        nome: 'Colégio Caminhos',
        telefone: '(11) 5555-3000',
        funcionamento: '07:00 às 19:00',
        endereco: 'Avenida Brasil, 845 · Vila do Sol · São Paulo - SP',
        detalhes: ['Avenida Brasil, 845', 'Vila do Sol · (11) 5555-3000'],
        badge: '2 alunos',
    },
]

export const alunos = [
    { id: 'aluno-1', nome: 'Bruno Nogueira', dataNascimento: '2021-03-14', turno: 'Manhã', anoEscolar: 'Infantil 3', informacoesGerais: 'Embarque autorizado somente com o responsável cadastrado.', responsavelId: 'responsavel-1', responsavel: 'Bianca Nogueira', escolaId: 'escola-1', detalhes: ['Responsável: Bianca Nogueira', '5 anos · Infantil 3'] },
    { id: 'aluno-2', nome: 'Beatriz Nogueira', dataNascimento: '2023-06-08', turno: 'Tarde', anoEscolar: 'Infantil 1', informacoesGerais: 'Utiliza cadeirinha infantil durante o transporte.', responsavelId: 'responsavel-1', responsavel: 'Bianca Nogueira', escolaId: 'escola-1', detalhes: ['Responsável: Bianca Nogueira', '3 anos · Infantil 1'] },
    { id: 'aluno-3', nome: 'João Teixeira', dataNascimento: '2019-01-22', turno: 'Manhã', anoEscolar: '2º ano', informacoesGerais: '', responsavelId: 'responsavel-2', responsavel: 'Thiago Teixeira', escolaId: 'escola-2', detalhes: ['Responsável: Thiago Teixeira', '7 anos · 2º ano'] },
    { id: 'aluno-4', nome: 'Mariana Teixeira', dataNascimento: '2017-09-11', turno: 'Tarde', anoEscolar: '4º ano', informacoesGerais: '', responsavelId: 'responsavel-2', responsavel: 'Thiago Teixeira', escolaId: 'escola-2', detalhes: ['Responsável: Thiago Teixeira', '9 anos · 4º ano'] },
    { id: 'aluno-5', nome: 'Lucas Fabrício', dataNascimento: '2020-05-17', turno: 'Integral', anoEscolar: '1º ano', informacoesGerais: 'Possui alergia alimentar informada pelo responsável.', responsavelId: 'responsavel-3', responsavel: 'Carlos Fabrício', escolaId: 'escola-3', detalhes: ['Responsável: Carlos Fabrício', '6 anos · 1º ano'] },
    { id: 'aluno-6', nome: 'Ana Manuel', dataNascimento: '2018-12-03', turno: 'Manhã', anoEscolar: '3º ano', informacoesGerais: '', responsavelId: 'responsavel-4', responsavel: 'Ricardo Manuel', escolaId: 'escola-3', detalhes: ['Responsável: Ricardo Manuel', '8 anos · 3º ano'] },
]

export const clientesPorTipo = {
    aluno: alunos,
    escola: escolas,
    responsavel: responsaveis,
}

export const buscarCliente = (tipo, id) => (
    clientesPorTipo[tipo]?.find((registro) => registro.id === id) || null
)
