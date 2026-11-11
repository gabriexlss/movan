import { Router } from "express";
import { controllerRotas } from "../controllers/rotas.controller.js";

const router = Router()

// rotas get para obter tanto a rota quanto os pontos dela
router.get('/', controllerRotas.obterRotas)
router.get('/:id/pontos', controllerRotas.obterPontosRota)

// rota post pra otimizar uma rota.
router.post('/:id/otimizar', controllerRotas.otimizarRota)

export default router