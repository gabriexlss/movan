import { Router } from "express";
import { controllerClausula } from "../../controllers/clausula.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";

const router = Router()

// As alterações nas cláusulas do motorista atualizam seus contratos em rascunho.
router.post('/', middlewareAutenticar, controllerClausula.criarClausulaPadrao)
router.patch('/:id', middlewareAutenticar, controllerClausula.editarClausulaPadrao)
router.delete('/:id', middlewareAutenticar, controllerClausula.excluirClausulaPadrao)
router.post('/mover', middlewareAutenticar, controllerClausula.moverClausulaPadrao)

// Lista as cláusulas padrão do motorista.
router.get('/', middlewareAutenticar, controllerClausula.obterClausulaPadrao)

export default router
