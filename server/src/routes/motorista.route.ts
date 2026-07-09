import { Router } from 'express';
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"

// Rota pra criar um motorista
router.post('/criar', controllerMotorista.criarMotorista)

export default router;