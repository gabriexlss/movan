import ListaClientes from './ListaClientes'
import { responsaveis } from '../clientes-data'

const Pais = () => {
    return <ListaClientes title="Lista de pais" tipo="responsavel" registros={responsaveis} />
}

export default Pais
