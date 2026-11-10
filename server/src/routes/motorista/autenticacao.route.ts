import { Router } from "express";
import { controllerAutenticacao } from "../../controllers/motorista/autenticacao.controller.js"
import { limitarRequisicoes } from "../../middlewares/rateLimit.js";

const router = Router();

// Rota pra logar um motorista
router.post('/login', limitarRequisicoes.login(), controllerAutenticacao.loginMotorista)

// rota delete para destruir o cookie de sessão que realiza o login, efetivamente efetuando um logout
router.delete('/logout', controllerAutenticacao.deslogarConta)

export default router;
