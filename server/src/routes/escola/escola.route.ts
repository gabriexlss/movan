import { Router } from "express";
import { controllerEscola } from "../../controllers/escola/escola.controller.js";
import rotasTurno from "./turno.route.js";

const router = Router()

// Mantém as rotas de turno sob /escola/turno (antes das rotas com /:id).
router.use('/turno', rotasTurno)

// rota para realizar a criação da escola.
router.post('/', controllerEscola.criarEscola)

// rota para editar uma escola
router.patch('/:id', controllerEscola.editarEscola)

// rota para excluir uma escola
router.delete('/:id', controllerEscola.excluirEscola)

// rota para obter todas as escolas (não  informar o id)
router.get('/', controllerEscola.obterEscola)

//  rota para obter os dados de uma escola informando o id
router.get('/:id', controllerEscola.obterEscola)

export default router