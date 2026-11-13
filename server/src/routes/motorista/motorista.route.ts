import { Router } from "express";
import rotasConta from "./conta.route.js";
import rotasAutenticacao from "./autenticacao.route.js";
import rotasCodigo from "./codigo.route.js";
import rotasGoogle from "./google.route.js";

const router = Router();

// Mantém as rotas de conta, autenticação, códigos e google sob /motorista.
router.use(rotasConta)
router.use(rotasAutenticacao)
router.use(rotasCodigo)
router.use('/google', rotasGoogle)

export default router;
