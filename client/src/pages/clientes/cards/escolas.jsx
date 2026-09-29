import ListaClientes from './ListaClientes'

const escolas = [
    { nome: 'ETEC Jardim Ângela', detalhes: ['Estrada da Baronesa, 1695', 'Jardim Nakamura · (11) 5555-1000'], badge: '12 alunos' },
    { nome: 'EMEF Paulo Freire', detalhes: ['Rua das Flores, 120', 'Jardim São Luís · (11) 5555-2000'], badge: '8 alunos' },
    { nome: 'Colégio Caminhos', detalhes: ['Avenida Brasil, 845', 'Vila do Sol · (11) 5555-3000'], badge: '6 alunos' },
]

const Escolas = () => {
    return <ListaClientes title="Lista de escolas" tipo="escola" registros={escolas} />
}

export default Escolas
