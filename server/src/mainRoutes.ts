import { Router } from 'express';

// Exemplo de importação de rota
// import exampleRoute from './routes/example.route.js';

const router = Router();

// Exemplo de teste de rota
router.use('/health', (req, res) => {
    res.status(200).json({ message: 'OK' });
});

export default router;
