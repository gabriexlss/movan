import { Router } from "express"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerResponsavel } from "../controllers/responsavel.controller.js";
const router = Router();

// Endpoint para criar responsável
router.post('/', middlewareAutenticar, controllerResponsavel.criarResponsavel)

// endpoint para editar responsável.
router.patch('/:id', middlewareAutenticar, controllerResponsavel.editarResponsavel)

// endpoint para excluir responsável
router.delete('/:id', middlewareAutenticar, controllerResponsavel.excluirResponsavel)

// rota para obter varios dados simples, ou um perfil complexo
router.get('/:id', middlewareAutenticar, controllerResponsavel.obterDados)
router.get('/', middlewareAutenticar, controllerResponsavel.obterDados)

export default router