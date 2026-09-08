import { Router } from "express";
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js"
import { middlewareVerificado } from "../middlewares/verificado.middleware.js";

// Rota pra criar um motorista
router.post('/', controllerMotorista.criarMotorista)

// rota delete para realizar o soft delete da sua conta. a agendando para encerramento permanente após 30 dias.
router.delete('/', middlewareAutenticar, controllerMotorista.deletarConta)

// rota patch para realizar a edição de dados do perfil como nome, email, cnpj e senha
router.patch('/', middlewareAutenticar, middlewareVerificado, controllerMotorista.editarConta)

// rota get para obter todos os dados do motorista
router.get('/', middlewareAutenticar, middlewareVerificado, controllerMotorista.obterDados)

// Rota pra logar um motorista
router.post('/login', controllerMotorista.loginMotorista)

// rota delete para destruir o cookie de sessão que realiza o login, efetivamente efetuando um logout
router.delete('/logout', controllerMotorista.deslogarConta)

// Rota para enviar um codigo (ou reenviar) tanto pra criação de conta quanto pra recuperação da conta
router.post('/codigo/:tipo', middlewareAutenticar, controllerMotorista.enviarCodigo)

// Rota para verificar a conta do motorista por meio do codigo enviado ao email.
router.post('/verificar-conta', middlewareAutenticar, controllerMotorista.verificarConta)

// rota que envia um código pro email pra realizar a recuperação de senha do motorista
router.post('/recuperar-conta/enviar-codigo', controllerMotorista.enviarCodigoRecuperarSenha)

// rota que com o código enviado, realiza a recuperação da senha
router.post('/recuperar-conta/recuperar', controllerMotorista.recuperarSenha)

// rota para enviar um código ao novo email antes de alterá-lo
router.post('/editar/enviar-codigo', middlewareAutenticar, middlewareVerificado, controllerMotorista.enviarCodigoEditarEmail)

// rota post para autenticar com o google.
router.post('/google', controllerMotorista.authGoogle)

// rota post para vincular conta existente com o google
router.post('/google/vincular', middlewareAutenticar, middlewareVerificado, controllerMotorista.vincularGoogle)

// rota post para criar uma conta, usando o google.
router.post('/google/criar', controllerMotorista.criarContaGoogle)

// rota delete para desvincular a conta google da conta do usuario logado.
router.delete('/google/desvincular', middlewareAutenticar, controllerMotorista.desvincularGoogle)

export default router;
