import ListaClientes from './ListaClientes'

const responsaveis = [
    { id: 'responsavel-1', nome: 'Bianca Nogueira', email: 'bianca@email.com', cpf: '123.456.789-01', telefone: '(11) 99999-0000', endereco: 'Jardim Nakamura', detalhes: ['(11) 99999-0000', 'bianca@email.com', 'Jardim Nakamura'], badge: '1 aluno' },
    { id: 'responsavel-2', nome: 'Thiago Teixeira', email: 'thiago@email.com', cpf: '234.567.890-12', telefone: '(11) 98888-0000', endereco: 'Jardim Ângela', detalhes: ['(11) 98888-0000', 'thiago@email.com', 'Jardim Ângela'], badge: '4 alunos' },
    { id: 'responsavel-3', nome: 'Carlos Fabrício', email: 'carlos@email.com', cpf: '345.678.901-23', telefone: '(11) 97777-0000', endereco: 'Vila do Sol', detalhes: ['(11) 97777-0000', 'carlos@email.com', 'Vila do Sol'], badge: '2 alunos' },
    { id: 'responsavel-4', nome: 'Ricardo Manuel', email: 'ricardo@email.com', cpf: '456.789.012-34', telefone: '(11) 96666-0000', endereco: 'Jardim São Luís', detalhes: ['(11) 96666-0000', 'ricardo@email.com', 'Jardim São Luís'], badge: '3 alunos' },
]

const Pais = () => {
    return <ListaClientes title="Lista de pais" tipo="responsavel" registros={responsaveis} />
}

export default Pais
