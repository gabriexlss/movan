import { NextFunction, Request, Response } from "express";

export const middlewareVerificado = async (req: Request, res: Response, next: NextFunction) => {
    // pega o status verificado da requisição
    const verificado = req.verificado

    // se for verificado, procede.
    if(verificado){
        next()
        return
    }
    // se nao for verificado, retorna.
    else{
        return res.status(403).json("Sua Conta precisa estar verificada para realizar essa ação.");
    }
} 