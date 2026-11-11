import { Router } from "express";
import { controllerEscolaTurno } from "../../controllers/escola/turno.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";

const router = Router()

// rota para realizar a criação do turno da escola.
router.post('/', middlewareAutenticar, controllerEscolaTurno.criarTurno)

// rota para editar um turno da escola
router.patch('/:id', middlewareAutenticar, controllerEscolaTurno.editarTurno)

// rota para excluir um turno da escola
router.delete('/:id', middlewareAutenticar, controllerEscolaTurno.excluirTurno)

// rota para obter todos os turnos (não informar o id). Opcional: ?escola_id= para filtrar por escola
router.get('/', middlewareAutenticar, controllerEscolaTurno.obterTurno)

// rota para obter os dados de um turno informando o id
router.get('/:id', middlewareAutenticar, controllerEscolaTurno.obterTurno)

export default router
