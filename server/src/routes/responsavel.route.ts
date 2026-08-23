import { Router } from "express"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerResponsavel } from "../controllers/responsavel.controller.js";
const router = Router();

// Endpoint para criar responsável
router.post('/criar', middlewareAutenticar, controllerResponsavel.criarResponsavel)

// endpoint para editar responsável.
router.patch('/editar', middlewareAutenticar, controllerResponsavel.editarResponsavel)

// endpoint para excluir responsável
router.delete('/excluir/:id', middlewareAutenticar, controllerResponsavel.excluirResponsavel)

// rota para obter varios dados simples, ou um perfil complexo
router.get('/dados/:id', middlewareAutenticar, controllerResponsavel.obterDados)
router.get('/dados', middlewareAutenticar, controllerResponsavel.obterDados)

export default router