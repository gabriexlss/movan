import { Router } from 'express';
import rotasMotorista from './routes/motorista.route.js';

const router = Router();

// Rota de teste para verificar se o servidor está funcionando corretamente
router.get('/health', (req, res) => {
    res.status(200).json({ message: 'OK' });
});

// Rota para os endpoints relacionados aos motoristas(usuario)
router.use('/motorista', rotasMotorista);

export default router;