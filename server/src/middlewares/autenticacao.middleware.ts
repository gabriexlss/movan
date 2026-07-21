import { Request, Response, NextFunction} from "express"
import jwt from "jsonwebtoken"
import { database } from "../db/postgre.js"

interface dadosToken{
    id: number
}

export const middlewareAutenticar = async (req: Request, res: Response, next: NextFunction) => {
    // pega o cookie da requisição
    const token = req.cookies['token']

    // se o cookie nao estiver presente, retorna imediatamente
    if(!token){
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
    // verifica a assinatura do jwt dentro do cookie
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
            // query verifica se o id do motorista existe e se sua conta não está agendada pra ser excluida.
            const query = "SELECT verificado FROM motorista WHERE id = $1 AND data_exclusao IS NULL"
            const valores = [id]
            const{ rows } = await database.query(query, valores)
            if(rows.length < 1){
                return res.status(401).json({
                    msg: "Usuario não encontrado"
                })
            }
            // pega o verificado e coloca dentro da requisição atual
            req.verificado = rows[0].verificado
        }catch(erro){
            console.error("Erro ao verificar se usuario existe, erro:", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor ao verificar identidade"
            })
        }
        // pega o id e coloca dentro da requisição atual
        req.userId = id
        // avança pro proximo modulo.
        next()

        /* esse return aqui embaixo foi colocado só pro vscode não
        encher o saco falando que: "nem todos os caminhos de código retornam um valor"
        mas efetivamente o código nunca chega nesse return pois ja acaba ali mesmo no next() */
        return
    }catch{
        return res.status(401).json({
            msg: "Acesso Negado. Você Precisa Estar Logado para Acessar Isso."
        })
    }
}