import { Request, Response } from "express"
import { database } from "../db/postgre.js"

export const controllerSistema = {
    // Rotina de limpeza de usuarios que estão com a conta agendada para deleção tem mais de 30 dias.
    deletarUsuarios: async (req: Request, res: Response) => {
        try{
            const query = `DELETE FROM motorista 
                WHERE data_exclusao IS NOT NULL 
                AND data_exclusao <= CURRENT_DATE - INTERVAL '30 days'`
            const response = await database.query(query)
            return res.status(200).json({
                msg: `Limpeza concluida! ${response.rowCount} usuarios deletados`
            })
        }catch(erro){
            return res.status(500).json({
                msg: `Erro ao fazer limpeza de usuarios deletados, erro: ${erro}`
            })
        }
    }
}