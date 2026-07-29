import { Router } from 'express';
import rotasMotorista from './routes/motorista.route.js';
import rotasSistema from './routes/system.route.js'

const router = Router();

// Rota de teste para verificar se o servidor está funcionando corretamente
router.get('/health', (req, res) => {
    res.status(200).json({ msg: 'OK' });
});

// Rota para os endpoints relacionados aos motoristas(usuario)
router.use('/motorista', rotasMotorista);

// Rota para os endpoints relacionados ao sistema como manutenção e administração
router.use('/system', rotasSistema)

export default router;