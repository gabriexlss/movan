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
// cria uma clausula personalizada para um contrato, ou seja, só existe para aquele contrato em especifico.
router.post('/:contrato_id/clausula', middlewareAutenticar, middlewareContrato, controllerClausula.criarClausula)

// edita uma clausula (personalizada ou do motorista) pela ordem, somente se ela for editavel e o contrato estiver em rascunho.
router.patch('/:contrato_id/clausula/:id', middlewareAutenticar, middlewareContrato, controllerClausula.editarClausula)

// exclui uma clausula pela ordem, somente se ela for editavel e o contrato estiver em rascunho.
router.delete('/:contrato_id/clausula/:id', middlewareAutenticar, middlewareContrato, controllerClausula.excluirClausula)

// -----------CLAUSULAS PADROES-----------------
// cria uma clausula padrão pra um motorista e atualiza todas as clausulas em contratos "rascunhos"
router.post('/clausula/padrao', middlewareAutenticar, controllerClausula.criarClausulaPadrao)

// edita uma clausula padrão por meio da ordem e atualiza todas as clausulas em contratos "rascunhos"
router.patch('/clausula/padrao/:id', middlewareAutenticar, controllerClausula.editarClausulaPadrao)

// exclui permanentemente uma clausula padrão  se não estiver sendo usada em nenhum lugar ou marca apenas como excluida se estiver sendo usada em algum lugar e ai sim atualiza todas as clausulas em contratos "rascunhos"
router.delete('/clausula/padrao/:id', middlewareAutenticar, controllerClausula.excluirClausulaPadrao)

export default router
