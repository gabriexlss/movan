import { Router } from "express";
import { controllerEscola } from "../controllers/escola.controller.js";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";

const router = Router()

// rota para realizar a criação da escola.
router.post('/criar', middlewareAutenticar, controllerEscola.criarEscola)

// rota para editar uma escola
router.patch('/editar', middlewareAutenticar, controllerEscola.editarEscola)

export default router