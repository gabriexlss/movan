import bcrypt from "bcrypt"
import { database } from "../../db/postgre.js"

// Constante global de query para atualizar a data de uso de codigo
export const queryAtualizarUsoCodigo = "UPDATE cod_verificacao SET data_uso = now() WHERE id = $1"

export const validarCodigo = async (id: number, tipo: "CRIACAO" | "RECUPERACAO" | "ALTERACAO", cod: string, email?: string) => {
    const valores = [id, tipo]

    /* Essa Query gigantesca basicamente pega o codigo mais recente do banco de dados e 
apenas um só dele, E só se tiver o mesmo id do motorista, o mesmo tipo de código 
e se nao for um codigo expirado, ou seja se nao tiver passado 5 minutos */
    const queryCodigoVerificacao = `SELECT id, codigo_hash
    FROM cod_verificacao
    WHERE motorista_id = $1 AND tipo = $2 AND (data_criacao + INTERVAL '5 minutes') > NOW() AND data_uso IS NULL
    ORDER BY data_criacao DESC 
    LIMIT 1`
    try {
        const { rows } = await database.query(queryCodigoVerificacao, valores)

        // Se não receber nenhum resultado, nenhum código foi enviado ao usuario.
        if (rows.length < 1) {
            console.log("Nenhum código encontrado para o motorista:", id, "com o tipo:", tipo, "e código:", cod)
            return null
        }
        // salva o hash de codigo numa constante
        const codigoHash = rows[0].codigo_hash

        // salva o id do codigo numa variavel
        const idCodigo: number = rows[0].id

        // checa se bate.
        const codigoParaValidar = tipo === "ALTERACAO" ? `${cod}:${email}` : cod
        const codigoValido = await bcrypt.compare(codigoParaValidar, codigoHash)

        // se o codigo não for valido, da um não autorizado pro nosso filhão
        if (!codigoValido) {
            return null
        }
        return idCodigo
    } catch (erro) {
        console.error("Erro na hora de buscar hash no banco de dados, erro:", erro)
        throw new Error("Erro interno do servidor ao verificar sua conta.", { cause: erro })
    }
}
