import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

interface dadosToken{
    id: number
}

export const middlewareAutenticar = (req: Request, res: Response, next: NextFunction) => {
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
        req.userId = tokenAberto.id
        next()
        return
    }catch{
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
}