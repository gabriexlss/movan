import { Request, Response, NextFunction } from "express"
import { z } from "zod"

const schemaEnv = z.object({
    credencial: z.string("Credencial precisa ser uma string.").min(1, "A credencial não pode estar vazia.")
})
export type env = z.infer<typeof schemaEnv>

export const middlewareSistema = (req: Request, res: Response, next: NextFunction) => {
    // recebe o segredo do sistema por meio do env
    const segredo = process.env['SEGREDO_SISTEMA']

    // checa pra ver se a variavel env existe
    if (!segredo) {
        console.error("Variável de ambiente para acessar as rotas do sistema não definida. Não foi possível concluir a solicitação.")
        return res.status(500).json({
            msg: "Erro interno do servidor."
        })
    }
    // pega a credencial enviada no header e válida pra ver se é minimamente válida
    const credencialBruta = schemaEnv.safeParse(req.headers)

    if (!credencialBruta.success) {
        return res.status(401).json({
            msg: "Credencial ausente ou inválida.",
            erro: credencialBruta.error.format()
        })
    }
    const { credencial } = credencialBruta.data
    // Compara com o segredo que temos.
    if (credencial !== segredo) {
        return res.status(401).json({
            msg: "Credencial inserida inválida."
        })
    }
    // credencial valida, pode passar pra proxima etapa.
    next()
    return
}
