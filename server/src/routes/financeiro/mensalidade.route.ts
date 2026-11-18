import { Router } from 'express'
import { controllerMensalide } from '../../controllers/financeiro/mensalidade.controller.js';

const router = Router()

// rota get pra pegar as mensalidades, podendo filtrar por aluno_id, mes (mm/yyyy) e status
router.get('/', controllerMensalide.obterMensalidades)

// rota patch pra pagar uma mensalidade passando o id nos params
router.patch('/:id/pagar', controllerMensalide.pagarMensalidade)

export default router
