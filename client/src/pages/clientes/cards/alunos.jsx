import ListaClientes from './ListaClientes'
import { alunos, responsaveis } from '../clientes-data'

const nomesResponsaveis = responsaveis.map((responsavel) => responsavel.nome)

const Alunos = () => {
    return <ListaClientes title="Lista de alunos" tipo="aluno" registros={alunos} responsaveis={nomesResponsaveis} />
}

export default Alunos
