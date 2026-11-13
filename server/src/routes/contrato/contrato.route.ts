import { Router } from "express";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";
import { controllerContrato } from "../../controllers/contrato/contrato.controller.js";
import { middlewareContrato } from "../../middlewares/contrato.middleware.js";
import rotasAssinatura from "./assinatura.route.js";
import rotasClausula from "./clausula.route.js";
import rotasClausulaPadrao from "./clausulaPadrao.route.js";

const router = Router()

// Mantém as rotas de assinatura e cláusulas sob /contrato.
router.use(rotasAssinatura)
router.use('/clausula/padrao', rotasClausulaPadrao)
router.use('/:contrato_id/clausula', rotasClausula)

// rota post para criar um contrato, já com suas clausulas padrões atribuida a ele.
router.post('/', middlewareAutenticar, controllerContrato.criarContrato)

// rota patch para editar um contrato SOMENTE se ele for rascunho.
router.patch('/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.editarContrato)

// rota delete para excluir um contrato em rascunho.
router.delete('/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.excluirContrato)

// rota get para obter varios contratos resumidos
router.get('/', middlewareAutenticar, controllerContrato.obterContrato)

// rota get para obter um contrato detalhado.
router.get('/:id', middlewareAutenticar, controllerContrato.obterContrato)

// rota post para concluir o contrato e gerar o link pro responsavel assinar
router.post('/finalizar-contrato/:contrato_id', middlewareAutenticar, middlewareContrato, controllerContrato.concluirContrato)

// rota post para cancelar um contrato ativo ou aguardando assinatura
router.post('/cancelar-contrato/:contrato_id', middlewareAutenticar, controllerContrato.cancelarContrato)

export default router
