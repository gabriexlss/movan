import { Router } from "express";
import { middlewareAutenticar } from "../middlewares/autenticacao.middleware.js";
import { controllerContrato } from "../controllers/contrato.controller.js";
import { middlewareContrato } from "../middlewares/contrato.middleware.js";
import { controllerClausula } from "../controllers/clausula.controller.js";

const router = Router()

// ----------CONTRATO--------------

// rota post para criar um contrato, já com suas clausulas padrões atribuida a ele.
router.post('/', middlewareAutenticar, controllerContrato.criarContrato)

// rota patch para editar um contrato SOMENTE se ele for rascunho.
router.patch('/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.editarContrato)

// rota delete para excluir um contrato em rascunho.
router.delete('/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.excluirContrato)

// -----------CLAUSULAS-----------------


// -----------CLAUSULAS PADROES-----------------
// cria uma clausula padrão pra um motorista
router.post('/clausula/padrao', middlewareAutenticar, controllerClausula.criarClausulaPadrao)

// edita uma clausula padrão por meio da ordem.
router.patch('/clausula/padrao/:id', middlewareAutenticar, controllerClausula.editarClausulaPadrao)

export default router