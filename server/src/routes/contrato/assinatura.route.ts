import { Router } from "express";
import { controllerContrato } from "../../controllers/contrato.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";
import { receberImagem } from "../../middlewares/receberImagem.middleware.js";

const router = Router()

// Cria ou atualiza a assinatura do motorista.
router.post('/assinatura-motorista', middlewareAutenticar, receberImagem.single('assinatura'), controllerContrato.assinarMotorista)

// O responsável acessa e assina o contrato pelo token do link.
router.get('/assinar/:token', controllerContrato.visualizarContrato)
router.post('/assinar/:token', receberImagem.single('assinatura'), controllerContrato.assinarContrato)

// Revoga o link anterior e cria outro.
router.post('/recriar-link/:id', middlewareAutenticar, controllerContrato.recriarLink)

export default router
