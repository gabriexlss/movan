import { Router } from "express";
import { controllerEscola } from "../controllers/escola.controller.js";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";

const router = Router()

// rota para realizar a criação da escola.
router.post('/criar', middlewareAutenticar, controllerEscola.criarEscola)

export default router