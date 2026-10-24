import { Router } from "express";
import { controllerClausulaPadrao } from "../../controllers/contrato/clausulaPadrao.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";

const router = Router()

// As alterações nas cláusulas do motorista atualizam seus contratos em rascunho.
router.post('/', middlewareAutenticar, controllerClausulaPadrao.criarClausulaPadrao)
router.patch('/:id', middlewareAutenticar, controllerClausulaPadrao.editarClausulaPadrao)
router.delete('/:id', middlewareAutenticar, controllerClausulaPadrao.excluirClausulaPadrao)
router.post('/mover', middlewareAutenticar, controllerClausulaPadrao.moverClausulaPadrao)

// Lista as cláusulas padrão do motorista.
router.get('/', middlewareAutenticar, controllerClausulaPadrao.obterClausulaPadrao)

export default router
