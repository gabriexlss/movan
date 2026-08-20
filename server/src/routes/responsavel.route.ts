import { Router } from "express"
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerResponsavel } from "../controllers/responsavel.controller.js";
const router = Router();

// Endpoint para criar responsável
router.post('/criar', middlewareAutenticar, controllerResponsavel.criarResponsavel)

// endpoint para editar responsável.
router.patch('/editar', middlewareAutenticar, controllerResponsavel.editarResponsavel)

export default router