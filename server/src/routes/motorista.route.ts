import { Router, Response, Request } from "express";
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js"

// Rota de teste pra checar o cookie.
router.get('/teste', middlewareAutenticar, (req: Request, res: Response) => {
    const id = req.userId
    const verificado = req.verificado
    return res.status(200).json({
        msg: "deu certo",
        id,
        verificado
    })
})

// Rota pra criar um motorista
router.post('/criar', controllerMotorista.criarMotorista)

// Rota pra logar um motorista
router.post('/login', controllerMotorista.loginMotorista)

// Rota para enviar um codigo (ou reenviar) tanto pra criação de conta quanto pra recuperação da conta
router.post('/codigo/:tipo', middlewareAutenticar, controllerMotorista.enviarCodigo)

// Rota para verificar a conta do motorista por meio do codigo enviado ao email.
router.post('/verificar-conta', middlewareAutenticar, controllerMotorista.verificarConta)

// rota que envia um código pro email pra realizar a recuperação de senha do motorista
router.post('/recuperar-conta/enviar-codigo', controllerMotorista.enviarCodigoRecuperarSenha)

// rota que com o código enviado, realiza a recuperação da senha
router.post('/recuperar-conta/recuperar', controllerMotorista.recuperarSenha)

// rota para enviar um código ao novo email antes de alterá-lo
router.post('/editar/enviar-codigo', middlewareAutenticar, controllerMotorista.enviarCodigoEditarEmail)

// rota delete para destruir o cookie de sessão que realiza o login, efetivamente efetuando um logout
router.delete('/logout', controllerMotorista.deslogarConta)

// rota delete para realizar o soft delete da sua conta. a agendando para encerramento permanente após 30 dias.
router.delete('/encerrar-conta', middlewareAutenticar ,controllerMotorista.deletarConta)

// rota patch para realizar a edição de dados do perfil como nome, email, cnpj e senha
router.patch('/editar', middlewareAutenticar, controllerMotorista.editarConta)

// rota get para obter todos os dados do motorista
router.get('/dados', middlewareAutenticar, controllerMotorista.obterDados)

export default router;
