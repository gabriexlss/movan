import { Router } from 'express';
const router = Router();
import { controllerMotorista } from "../controllers/motorista.controller.js"

// Rota pra criar um motorista
router.post('/criar', controllerMotorista.criarMotorista)

// Rota pra logar um motorista
router.post('/login', controllerMotorista.loginMotorista)

export default router;