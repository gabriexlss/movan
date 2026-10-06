import { NextFunction, Request, Response } from "express";
import { ContratoParamsSchema } from "../models/utils.model.js";
import { database } from "../db/postgre.js";
import { Contrato } from "../models/contrato.model.js";

export const middlewareContrato = async (req: Request, res: Response, next: NextFunction) => {
    // pega o ID dos parametros.
    const idBruto = ContratoParamsSchema.safeParse(req.params)

    // validações
    if (!idBruto.success) {
        return res.status(400).json({
            msg: "ID inválido ou ausente para acessar o contrato.",
            erro: idBruto.error.format()
        })
    }
    // desestruturação
    const motoristaID = req.userId
    const { contrato_id: contratoID } = idBruto.data

    // verificar se o contrato pode ser editado.
    try {
        const query = "SELECT status FROM contrato WHERE id = $1 AND motorista_id = $2"
        const valores = [contratoID, motoristaID]

        const { rows: contratoDados } = await database.query<Contrato>(query, valores)

        // se não vier nenhum contrato manda embora
        if (contratoDados.length < 1) {
            return res.status(404).json({
                msg: "Contrato não encontrado com o ID fornecido."
            })
        }
        // verifica se o contrato está como rascunho.
        const contratoDado = contratoDados[0]
        if (contratoDado?.status !== "RASCUNHO") {
            return res.status(409).json({
                msg: "Não é possível alterar um contrato que não esteja no status de rascunho."
            })
        }
        // guarda o id do contrato na requisição
        req.contratoID = contratoID
        // verifica e avança.
        next()
        return
    } catch (erro) {
        console.error("Erro ao verificar o status do contrato, erro: ", erro)
        return res.status(500).json({
            msg: "Erro interno do servidor."
        })
    }
}
