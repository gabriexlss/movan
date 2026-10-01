import { Router } from "express";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerContrato } from "../controllers/contrato.controller.js";
import { middlewareContrato } from "../middlewares/contrato.middleware.js";

const router = Router()

// rota post para criar um contrato, já com suas clausulas padrões atribuida a ele.
router.post('/', middlewareAutenticar, controllerContrato.criarContrato)

// rota patch para editar um contrato SOMENTE se ele for rascunho.
router.patch('/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.editarContrato)

export default router