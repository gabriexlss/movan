import { Router } from 'express'
import { controllerFinanceiro } from '../controllers/financeiro.controller.js';
const router = Router()

// ROTAS CRUD pro financeiro
router.post('/', controllerFinanceiro.adicionarRegistro)

export default router