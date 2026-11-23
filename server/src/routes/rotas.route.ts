import { Router } from "express";
import { controllerRotas } from "../controllers/rotas.controller.js";

const router = Router()

// rotas get para obter tanto a rota quanto os pontos dela
router.get('/', controllerRotas.obterRotas)
router.get('/:id/pontos', controllerRotas.obterPontosRota)
router.get('/:id/polyline', controllerRotas.obterPolylineRota)

// rotas para adicionar ou remover pontos específicos de uma rota
router.post('/:id/pontos', controllerRotas.adicionarPontoRota)
router.delete('/:id/pontos/:ponto_id', controllerRotas.excluirPontoRota)

// rota post pra otimizar uma rota.
router.post('/:id/otimizar', controllerRotas.otimizarRota)

// rota post para trocar a posição de dois pontos de uma rota.
router.post('/:id/pontos/mover', controllerRotas.moverPontos)

export default router