import { timingSafeEqual } from "node:crypto"
import { Request, Response, NextFunction } from "express"

export const middlewareCron = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", "no-store")

    // O Express encaminha HEAD para rotas GET; uma consulta HEAD não deve executar a limpeza.
    if (req.method !== "GET") {
        return res.status(405).setHeader("Allow", "GET").json({
            msg: "Método não permitido."
        })
    }

    const segredo = process.env['CRON_SECRET']
    if (!segredo) {
        console.error("CRON_SECRET não configurado para a limpeza agendada.")
        return res.status(500).json({
            msg: "Erro interno do servidor."
        })
    }

    const recebido = Buffer.from(req.get("authorization") ?? "")
    const esperado = Buffer.from(`Bearer ${segredo}`)
    if (recebido.length !== esperado.length || !timingSafeEqual(recebido, esperado)) {
        return res.status(401).json({
            msg: "Credencial do cron ausente ou inválida."
        })
    }

    next()
    return
}
