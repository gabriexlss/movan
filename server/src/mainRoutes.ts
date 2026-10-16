import { Router } from 'express';
import rotasMotorista from './routes/motorista.route.js';
import rotasSistema from './routes/system.route.js'
import rotasResponsavel from "./routes/responsavel.route.js"
import rotasEscola from "./routes/escola.route.js"
import rotasAluno from "./routes/aluno.route.js"
import rotasContrato from "./routes/contrato.route.js"
import { middlewareAutenticar } from './middlewares/autenticacao.middleware.js';

const router = Router();

// Rota de teste para verificar se o servidor está funcionando corretamente
router.get('/health', (req, res) => {
    res.status(200).json({ msg: 'OK' });
});

// Rota para os endpoints relacionados aos motoristas(usuario)
router.use('/motorista', rotasMotorista);

// Rota para os endpoints relacionados ao sistema como manutenção e administração
router.use('/system', rotasSistema)

// Rota para os endpoints relacionados ao responsavel
router.use('/responsavel', middlewareAutenticar, rotasResponsavel)

// Rota para os endpoints relacionado as escolas
router.use('/escola', middlewareAutenticar, rotasEscola)

//Rota para os endpoints relacionado aos alunos
router.use('/aluno', middlewareAutenticar, rotasAluno)

// Rota para os endpoints relacionado aos contratos e suas clausulas.
router.use('/contrato', rotasContrato)

export default router;