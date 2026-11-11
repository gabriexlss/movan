import { Router } from "express";
import { controllerConta } from "../../controllers/motorista/conta.controller.js"
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js"
import { middlewareVerificado } from "../../middlewares/verificado.middleware.js";
import { limitarRequisicoes } from "../../middlewares/rateLimit.js";

const router = Router();

// Rota pra criar um motorista
router.post('/', limitarRequisicoes.cadastro(), controllerConta.criarMotorista)

// rota delete para realizar o soft delete da sua conta. a agendando para encerramento permanente após 30 dias.
router.delete('/', limitarRequisicoes.login(), middlewareAutenticar, controllerConta.deletarConta)

// rota patch para realizar a edição de nome, email, CPF/CNPJ e senha
router.patch('/', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerConta.editarConta)

// rota get para obter todos os dados do motorista
router.get('/', limitarRequisicoes.get(), middlewareAutenticar, controllerConta.obterDados)

// rota post para comparar uma senha digitada com a senha do motorista logado.
router.post('/comparar-senha', limitarRequisicoes.login(), middlewareAutenticar, controllerConta.compararSenha)

export default router;
