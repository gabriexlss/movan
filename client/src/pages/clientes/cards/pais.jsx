import ListaClientes from './ListaClientes'

const responsaveis = [
    { nome: 'Bianca Nogueira', detalhes: ['(11) 99999-0000', 'bianca@email.com', 'Jardim Nakamura'], badge: '1 aluno' },
    { nome: 'Thiago Teixeira', detalhes: ['(11) 98888-0000', 'thiago@email.com', 'Jardim Ângela'], badge: '4 alunos' },
    { nome: 'Carlos Fabrício', detalhes: ['(11) 97777-0000', 'carlos@email.com', 'Vila do Sol'], badge: '2 alunos' },
    { nome: 'Ricardo Manuel', detalhes: ['(11) 96666-0000', 'ricardo@email.com', 'Jardim São Luís'], badge: '3 alunos' },
]

const Pais = () => {
    return <ListaClientes title="Lista de pais" tipo="responsavel" registros={responsaveis} />
}

export default Pais
