import { Router } from 'express'
import { controllerFinanceiro } from '../controllers/financeiro.controller.js';
const router = Router()

// ROTAS CRUD pro financeiro
router.post('/', controllerFinanceiro.adicionarRegistro)

// rota patch para editar um registro financeiro
router.patch('/:id', controllerFinanceiro.editarRegistro)

// rota delete para excluir um registro financeiro
router.delete('/:id', controllerFinanceiro.excluirRegistro)

export default router