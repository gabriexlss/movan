import { Request, Response } from "express"
import { database } from "../db/postgre.js"
import { Motorista } from "../models/motorista.model.js";
import { deletarPastaR2 } from "../utils/deletarPastaR2.js";

export const controllerSistema = {
    // Rotina de limpeza de usuarios que estão com a conta agendada para deleção tem mais de 30 dias.
    deletarUsuarios: async (req: Request, res: Response) => {
        let usuariosDeletados: number = 0
        let arquivosDeletados: number = 0
        // deletando as assinaturas do bucket do r2
        try {
            // pego todos os IDs dos usuarios que vão ser excluidos
            const { rows: usuarios } = await database.query<Motorista>(
                "SELECT id FROM motorista WHERE excluido_em IS NOT NULL AND excluido_em <= now() - INTERVAL '30 days'"
            )
            // faço um For maroto pra deletar cada usuario na constante usuarios
            for (const usuario of usuarios) {
                const key = `motoristas/${usuario.id}`

                // chamo a função god feita pelo chatgpt ja que o maldito cloudflare não aceita deletar uma pasta toda
                arquivosDeletados += await deletarPastaR2(key)

                // agr sim excluo do banco de dados
                await database.query(`DELETE FROM motorista WHERE id = $1`, [usuario.id])
                usuariosDeletados++
            }
        } catch (erro) {
            console.error("Erro na limpeza de usuários:", erro)
            return res.status(500).json({
                msg: `Erro interno durante a limpeza. ${usuariosDeletados} usuários excluídos e ${arquivosDeletados} arquivos excluídos.`,
            })
        }
        return res.status(200).json({
            msg: `Limpeza concluída! ${usuariosDeletados} usuários excluídos e ${arquivosDeletados} arquivos excluídos.`
        })
    }
}
