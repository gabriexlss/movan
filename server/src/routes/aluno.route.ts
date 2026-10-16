import { Router } from "express";
import { controllerAluno } from "../controllers/aluno.controller.js";
const router = Router()

// rota post para cadastrar aluno
router.post('/', controllerAluno.criarAluno)

// rota patch para editar um aluno
router.patch('/:id', controllerAluno.editarAluno)

// rota delete para excluir um aluno
router.delete('/:id', controllerAluno.excluirAluno)

// rota get para listar alunos
router.get('/', controllerAluno.obterAluno)

// rota get para obter todos os dados de um aluno
router.get('/:id', controllerAluno.obterAluno)

export default router