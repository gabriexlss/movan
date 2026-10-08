import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { database } from "../db/postgre.js"
import { Motorista } from "../models/motorista.model.js";

interface dadosToken {
    id: number
}

export const middlewareAutenticar = async (req: Request, res: Response, next: NextFunction) => {
    // pega o cookie da requisição
    const token = req.cookies['token']

    // se o cookie nao estiver presente, retorna imediatamente
    if (!token) {
        return res.status(401).json({
            msg: "Acesso negado. Faça login para continuar."
        })
    }
    // verifica a assinatura do jwt dentro do cookie
    const segredoJWT = process.env['SEGREDO_JWT']
    if (!segredoJWT) {
        console.error("Segredo JWT ausente nas variáveis de ambiente.")
        return res.status(500).json({
            msg: "Ocorreu um erro interno no servidor."
        })
    }
    try {
        const tokenAberto = jwt.verify(token, segredoJWT) as dadosToken
        const id = tokenAberto.id
        try {
            // query verifica se o id do motorista existe e se sua conta não está agendada pra ser excluida.
            const query = "SELECT email_verificado FROM motorista WHERE id = $1"
            const valores = [id]
            const { rows } = await database.query<Motorista>(query, valores)
            if (rows.length < 1) {
                return res.status(404).json({
                    msg: "Usuário não encontrado."
                })
            }
            const usuario = rows[0]
            // verifica se a conta não está excluida.
            if (usuario?.excluido_em) {
                return res.status(401).clearCookie("token", {
                    httpOnly: true,
                    secure: process.env['NODE_ENV'] === 'production',
                    sameSite: 'strict'
                }).json({
                    msg: "Não é possivel obter dados de conta excluida."
                })
            }

            // pega o verificado e coloca dentro da requisição atual
            req.verificado = usuario?.email_verificado ?? false
        } catch (erro) {
            console.error("Erro ao verificar se o usuário existe, erro:", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
    } catch {
        return res.status(401).json({
            msg: "Acesso negado. Faça login para continuar."
        })
    }
}
