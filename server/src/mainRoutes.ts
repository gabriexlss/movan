import { Router } from 'express';
import rotasMotorista from './routes/motorista/motorista.route.js';
import rotasSistema from './routes/system.route.js'
import rotasResponsavel from "./routes/responsavel.route.js"
import rotasEscola from "./routes/escola/escola.route.js"
import rotasAluno from "./routes/aluno.route.js"
import rotasContrato from "./routes/contrato/contrato.route.js"
import { middlewareAutenticar } from './middlewares/autenticacao.middleware.js';
import rotasRota from './routes/rotas.route.js'
import { otimizarRota } from './services/otimizarRota.js';
import { database } from './db/postgre.js';

const router = Router();

// Rota de teste para verificar se o servidor está funcionando corretamente
router.get('/health', (req, res) => {
    res.status(200).json({ 'msg-code': 'OK' });
});
router.post('/teste', middlewareAutenticar,async (req, res) => {
    const cliente = await database.connect()
    try{
        await cliente.query('BEGIN')
        await otimizarRota({ rotaID: 61, req, coordenadasMotorista: { latitude: -23.7019403 ,longitude: -46.7671673 }, cliente})
        await cliente.query('COMMIT')
        return res.status(200).json()
    }catch(erro){
        await cliente.query('ROLLBACK')
        console.error(erro)
        if(erro instanceof Error){
            switch(erro.message){
                case 'ALUNO_NOT_FOUND':
                    return res.status(404).json({
                        msg: "Aluno não encontrado."
                    })
                case 'ROTA_NOT_FOUND': 
                return res.status(404).json({
                    msg: "Rota não encontrada."
                })
            }
        }
        return res.status(500).json()
    }finally{
        cliente.release()
    }
})

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

// rota para os endpoints relacionados as rotas. (puts, os dois são rotas)
router.use('/rota', middlewareAutenticar, rotasRota)

export default router;
