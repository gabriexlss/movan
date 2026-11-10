import { cpf, cnpj } from "cpf-cnpj-validator"
import { database } from "../../db/postgre.js"

// Identifica e valida o documento antes de usá-lo nas operações da conta.
export const tipoCredencial = (credencial: string): "cnpj" | "cpf" | null => {
    if (credencial.length === 14 && cnpj.isValid(credencial)) return "cnpj"
    if (credencial.length === 11 && cpf.isValid(credencial)) return "cpf"
    return null
}

// Função pra verificar email, cnpj ou cpf
export const verificarEmailouCNPJouCPF = async (dado: string, tipo: "email" | "cnpj" | "cpf") => {
    // verifica se ambos os dados foram enviados
    if (!dado || !tipo) throw new Error("Um dos dados obrigatórios está ausente.")

    try {
        // checando se esse email ja existe no banco de dados
        const query = `SELECT id FROM motorista WHERE ${tipo} = $1`
        const valores = [dado]
        const { rows } = await database.query(query, valores)
        if (rows.length > 0) {
            const id = rows[0].id
            return id
        }
        return undefined
    } catch (erro) {
        throw new Error("Erro ao consultar o banco de dados.", { cause: erro })
    }
}
