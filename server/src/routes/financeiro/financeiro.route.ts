import { Router } from 'express'
import { controllerFinanceiro } from '../../controllers/financeiro/financeiro.controller.js';
import rotasMensalidade from './mensalidade.route.js';
const router = Router()

// rotas das mensalidades ficam em /financeiro/mensalidade (antes do /:id pra não dar conflito)
router.use('/mensalidade', rotasMensalidade)

// ROTAS CRUD pro financeiro
router.post('/', controllerFinanceiro.adicionarRegistro)

// rota patch para editar um registro financeiro
router.patch('/:id', controllerFinanceiro.editarRegistro)

// rota delete para excluir um registro financeiro
router.delete('/:id', controllerFinanceiro.excluirRegistro)

// rota get para obter os dados do financeiro, com opçoes de query de mm/yyyy ou yyyy e id
router.get('/', controllerFinanceiro.obterRegistros)

// rota get para obter o sumario do financeiro, com opções de query de mm/yyyy ou yyyy e tipo ENTRADA ou SAIDA
router.get('/sumario', controllerFinanceiro.obterValor)

export default router