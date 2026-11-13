import { Router } from "express";
import { controllerClausula } from "../../controllers/contrato/clausula.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";
import { middlewareContrato } from "../../middlewares/contrato.middleware.js";

// Recebe contrato_id da rota /contrato/:contrato_id/clausula.
const router = Router({ mergeParams: true })

// Cria uma cláusula personalizada para o contrato em rascunho.
router.post('/', middlewareAutenticar, middlewareContrato, controllerClausula.criarClausula)

// Edita ou exclui uma cláusula editável do contrato em rascunho.
router.patch('/:id', middlewareAutenticar, middlewareContrato, controllerClausula.editarClausula)
router.delete('/:id', middlewareAutenticar, middlewareContrato, controllerClausula.excluirClausula)

// Troca a posição de duas cláusulas do contrato.
router.post('/mover', middlewareAutenticar, middlewareContrato, controllerClausula.moverClausula)

export default router
