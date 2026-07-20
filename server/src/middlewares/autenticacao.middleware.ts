import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import { database } from "../db/postgre.js"

interface dadosToken{
    id: number
}

export const middlewareAutenticar = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['token']

    if(!token){
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
    const segredoJWT = process.env['SEGREDO_JWT']
        if(!segredoJWT){
            console.error("Segredo JWT Ausente no ENV")
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
    try{
        const tokenAberto = jwt.verify(token, segredoJWT) as dadosToken
        const id = tokenAberto.id
        try{
            const query = "SELECT verificado FROM motorista WHERE id = $1"
            const valores = [id]
            const{ rows } = await database.query(query, valores)
            if(rows.length < 1){
                return res.status(401).json({
                    msg: "Usuario não encontrado"
                })
            }
            req.verificado = rows[0].verificado
        }catch(erro){
            console.error("Erro ao verificar se usuario existe, erro:", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor ao verificar identidade"
            })
        }
        req.userId = id
        next()
        return
    }catch{
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
}