import { Router } from "express";
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js"
import { middlewareVerificado } from "../middlewares/verificado.middleware.js";
import { limitarRequisicoes } from "../middlewares/rateLimit.js";

// Rota pra criar um motorista
router.post('/', limitarRequisicoes.cadastro(), controllerMotorista.criarMotorista)

// rota delete para realizar o soft delete da sua conta. a agendando para encerramento permanente após 30 dias.
router.delete('/', limitarRequisicoes.login(), middlewareAutenticar, controllerMotorista.deletarConta)

// rota patch para realizar a edição de nome, email, CPF/CNPJ e senha
router.patch('/', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerMotorista.editarConta)

// rota get para obter todos os dados do motorista
router.get('/', limitarRequisicoes.get(), middlewareAutenticar, controllerMotorista.obterDados)

// Rota pra logar um motorista
router.post('/login', limitarRequisicoes.login(), controllerMotorista.loginMotorista)

// rota delete para destruir o cookie de sessão que realiza o login, efetivamente efetuando um logout
router.delete('/logout', controllerMotorista.deslogarConta)

// Rota para enviar um codigo (ou reenviar) pra criação da conta do motorista
router.post('/codigo/:tipo', limitarRequisicoes.codigoEmail(), middlewareAutenticar, controllerMotorista.enviarCodigo)

// Rota para verificar a conta do motorista por meio do codigo enviado ao email.
router.post('/verificar-conta', limitarRequisicoes.login(), middlewareAutenticar, controllerMotorista.verificarConta)

// rota que envia um código pro email pra realizar a recuperação de senha do motorista
router.post('/recuperar-conta/enviar-codigo', limitarRequisicoes.codigoEmail(), controllerMotorista.enviarCodigoRecuperarSenha)

// rota que com o código enviado, realiza a recuperação da senha
router.post('/recuperar-conta/recuperar', limitarRequisicoes.login(), controllerMotorista.recuperarSenha)

// rota para enviar um código ao novo email antes de alterá-lo
router.post('/editar/enviar-codigo', limitarRequisicoes.codigoEmail(), middlewareAutenticar, middlewareVerificado, controllerMotorista.enviarCodigoEditarEmail)

// rota post para autenticar com o google.
router.post('/google', limitarRequisicoes.login(), controllerMotorista.authGoogle)

// rota post para vincular conta existente com o google
router.post('/google/vincular', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerMotorista.vincularGoogle)

// rota post para criar uma conta, usando o google.
router.post('/google/criar', limitarRequisicoes.cadastro(), controllerMotorista.criarContaGoogle)

// rota delete para desvincular a conta google da conta do usuario logado.
router.delete('/google/desvincular', limitarRequisicoes.login(), middlewareAutenticar, middlewareVerificado, controllerMotorista.desvincularGoogle)

// rota post para comparar uma senha digitada com a senha do motorista logado.
router.post('/comparar-senha', limitarRequisicoes.login(), middlewareAutenticar, controllerMotorista.compararSenha)

export default router;
