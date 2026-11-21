import { Router } from "express"
import { controllerResponsavel } from "../controllers/responsavel.controller.js";
const router = Router();

// Endpoint para criar responsável
router.post('/', controllerResponsavel.criarResponsavel)

// endpoint para editar responsável.
router.patch('/:id', controllerResponsavel.editarResponsavel)

// endpoint para excluir responsável
router.delete('/:id', controllerResponsavel.excluirResponsavel)

// rota para obter varios dados simples, ou um perfil complexo
router.get('/:id', controllerResponsavel.obterDados)
router.get('/', controllerResponsavel.obterDados)

export default router