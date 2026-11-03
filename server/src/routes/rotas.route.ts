import { Router } from "express";
import { controllerRotas } from "../controllers/rotas.controller.js";

const router = Router()

router.get('/', controllerRotas.obterRotas)

export default router