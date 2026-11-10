import { Router } from "express";
import { controllerGoogle } from "../../controllers/motorista/google.controller.js"
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js"
import { middlewareVerificado } from "../../middlewares/verificado.middleware.js";
import { limitarRequisicoes } from "../../middlewares/rateLimit.js";

const router = Router();

// rota post para autenticar com o google.
router.post('/', limitarRequisicoes.login(), controllerGoogle.authGoogle)

// rota post para vincular conta existente com o google
router.post('/vincular', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerGoogle.vincularGoogle)

// rota post para criar uma conta, usando o google.
router.post('/criar', limitarRequisicoes.cadastro(), controllerGoogle.criarContaGoogle)

// rota delete para desvincular a conta google da conta do usuario logado.
router.delete('/desvincular', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerGoogle.desvincularGoogle)

export default router;
