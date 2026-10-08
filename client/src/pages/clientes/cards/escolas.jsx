import ListaClientes from './ListaClientes'
import { escolas } from '../clientes-data'

const Escolas = () => {
    return <ListaClientes title="Lista de escolas" tipo="escola" registros={escolas} />
}

export default Escolas
