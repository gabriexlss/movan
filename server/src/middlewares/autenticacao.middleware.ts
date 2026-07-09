import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"

interface dadosToken{
    id: string
}

export const middlewareAutenticar = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['token']

    if(!token){
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }

    try{
        const tokenAberto = jwt.verify(token, `${process.env['SEGREDO_JWT']}`) as dadosToken
        req.userId = tokenAberto.id
        next()
        return
    }catch{
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
}