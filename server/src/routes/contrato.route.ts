import { Router } from "express";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerContrato } from "../controllers/contrato.controller.js";

const router = Router()

// rota post para criar um contrato, já com suas clausulas padrões atribuida a ele.
router.post('/', middlewareAutenticar, controllerContrato.criarContrato)

export default router