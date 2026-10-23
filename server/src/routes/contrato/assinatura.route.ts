import { Router } from "express";
import { controllerAssinatura } from "../../controllers/contrato/assinatura.controller.js";
import { middlewareAutenticar } from "../../middlewares/autenticacao.middleware.js";
import { receberImagem } from "../../middlewares/receberImagem.middleware.js";
import { middlewareAssinatura } from "../../middlewares/assinatura.middleware.js";

const router = Router()

// Cria ou atualiza a assinatura do motorista.
router.post('/assinatura-motorista', middlewareAutenticar, receberImagem.single('assinatura'), controllerAssinatura.assinarMotorista)

// O responsável acessa e assina o contrato pelo token do link.
router.get('/assinar/:token', middlewareAssinatura, controllerAssinatura.visualizarContrato)
router.post('/assinar/:token', middlewareAssinatura, receberImagem.single('assinatura'), controllerAssinatura.assinarContrato)

// Revoga o link anterior e cria outro.
router.post('/recriar-link/:id', middlewareAutenticar, controllerAssinatura.recriarLink)

export default router
