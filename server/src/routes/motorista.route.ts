import { Router } from 'express';
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js"
import { Response, Request } from "express"
// Rota pra criar um motorista
router.post('/criar', controllerMotorista.criarMotorista)

// Rota pra logar um motorista
router.post('/login', controllerMotorista.loginMotorista)

router.get('/teste', middlewareAutenticar, (req: Request, res: Response) => {
    const id = req.userId
    const verificado = req.verificado
    return res.status(200).json({
        msg: "deu certo",
        id,
        verificado
    })
})
// Rota para enviar um codigo (ou reenviar) tanto pra criação de conta quanto pra recuperação da conta
router.post('/codigo/:tipo', middlewareAutenticar, controllerMotorista.enviarCodigo)
export default router;