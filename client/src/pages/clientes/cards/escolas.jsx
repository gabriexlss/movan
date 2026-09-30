import ListaClientes from './ListaClientes'

const escolas = [
    { id: 'escola-1', nome: 'ETEC Jardim Ângela', telefone: '(11) 5555-1000', funcionamento: '07:00 às 22:30', endereco: 'Estrada da Baronesa, 1695 · Jardim Nakamura', detalhes: ['Estrada da Baronesa, 1695', 'Jardim Nakamura · (11) 5555-1000'], badge: '12 alunos' },
    { id: 'escola-2', nome: 'EMEF Paulo Freire', telefone: '(11) 5555-2000', funcionamento: '07:00 às 18:00', endereco: 'Rua das Flores, 120 · Jardim São Luís', detalhes: ['Rua das Flores, 120', 'Jardim São Luís · (11) 5555-2000'], badge: '8 alunos' },
    { id: 'escola-3', nome: 'Colégio Caminhos', telefone: '(11) 5555-3000', funcionamento: '07:00 às 19:00', endereco: 'Avenida Brasil, 845 · Vila do Sol', detalhes: ['Avenida Brasil, 845', 'Vila do Sol · (11) 5555-3000'], badge: '6 alunos' },
]

const Escolas = () => {
    return <ListaClientes title="Lista de escolas" tipo="escola" registros={escolas} />
}

export default Escolas
