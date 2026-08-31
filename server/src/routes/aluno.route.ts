import { Router } from "express";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerAluno } from "../controllers/aluno.controller.js";
const router = Router()

// rota post para cadastrar aluno
router.post('/', middlewareAutenticar, controllerAluno.criarAluno)

// rota patch para editar um aluno
router.patch('/:id', middlewareAutenticar, controllerAluno.editarAluno)

// rota delete para excluir um aluno
router.delete('/:id', middlewareAutenticar, controllerAluno.excluirAluno)

export default router