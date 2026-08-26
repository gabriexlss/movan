import { Router } from "express";
import { controllerEscola } from "../controllers/escola.controller.js";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";

const router = Router()

// rota para realizar a criação da escola.
router.post('/criar', middlewareAutenticar, controllerEscola.criarEscola)

// rota para editar uma escola
router.patch('/editar', middlewareAutenticar, controllerEscola.editarEscola)

// rota para excluir uma escola
router.delete('/excluir/:id', middlewareAutenticar, controllerEscola.excluirEscola)

// rota para obter todas as escolas (não  informar o id)
router.get('/dados', middlewareAutenticar, controllerEscola.obterEscola)

//  rota para obter os dados de uma escola informando o id
router.get('/dados/:id', middlewareAutenticar, controllerEscola.obterEscola)

export default router