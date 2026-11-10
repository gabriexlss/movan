import { Router } from "express";
import { controllerEscola } from "../controllers/escola.controller.js";

const router = Router()

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