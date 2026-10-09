import { Router, Request, Response } from "express"
import { middlewareSistema } from "../middlewares/sistema.middleware.js"
import { middlewareCron } from "../middlewares/cron.middleware.js"
import { controllerSistema } from "../controllers/sistema.controller.js"
const router = Router()

// Rota de teste pra checar a credencial.
router.get('/teste', middlewareSistema, (req: Request, res: Response) => {
    return res.status(200).json({
        msg: "Credencial validada com sucesso.",
    })
})

// Rota para realizar o delete definitivo para usuarios que deletaram suas contas tem mais de 30 dias.
router.delete('/limpeza-usuarios', middlewareSistema, controllerSistema.deletarUsuarios)

// A Vercel executa o cron via GET, autenticado pelo header Authorization com CRON_SECRET ent fiz isso aq.
router.get('/limpeza-usuarios', middlewareCron, controllerSistema.deletarUsuarios)

export default router
