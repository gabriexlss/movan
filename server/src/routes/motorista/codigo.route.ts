import { Router } from "express";
import { controllerCodigo } from "../../controllers/motorista/codigo.controller.js"
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js"
import { middlewareVerificado } from "../../middlewares/verificado.middleware.js";
import { limitarRequisicoes } from "../../middlewares/rateLimit.js";

const router = Router();

// Rota para enviar um codigo (ou reenviar) pra criação da conta do motorista
router.post('/codigo/:tipo', limitarRequisicoes.codigoEmail(), middlewareAutenticar, controllerCodigo.enviarCodigo)

// Rota para verificar a conta do motorista por meio do codigo enviado ao email.
router.post('/verificar-conta', limitarRequisicoes.login(), middlewareAutenticar, controllerCodigo.verificarConta)

// rota que envia um código pro email pra realizar a recuperação de senha do motorista
router.post('/recuperar-conta/enviar-codigo', limitarRequisicoes.codigoEmail(), controllerCodigo.enviarCodigoRecuperarSenha)

// rota que com o código enviado, realiza a recuperação da senha
router.post('/recuperar-conta/recuperar', limitarRequisicoes.login(), controllerCodigo.recuperarSenha)

// rota para enviar um código ao novo email antes de alterá-lo
router.post('/editar/enviar-codigo', limitarRequisicoes.codigoEmail(), middlewareAutenticar, middlewareVerificado, controllerCodigo.enviarCodigoEditarEmail)

export default router;
