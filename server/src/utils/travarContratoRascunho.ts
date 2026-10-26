import type { PoolClient } from "pg";
import type { Contrato } from "../models/contrato/contrato.model.js";

// O middleware valida o acesso, mas o status pode mudar antes de chegar ao controller.
// Essa trava mantém o contrato em rascunho até a transação terminar.
export const travarContratoRascunho = async (cliente: PoolClient, contratoID: number, motoristaID: number): Promise<boolean> => {
    const { rows: [contrato] } = await cliente.query<Pick<Contrato, 'status'>>(
        "SELECT status FROM contrato WHERE id = $1 AND motorista_id = $2 FOR UPDATE",
        [contratoID, motoristaID]
    )
    return contrato?.status === 'RASCUNHO'
}
