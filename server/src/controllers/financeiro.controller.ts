import { Request, Response } from "express";
import { AdicionarFinanceiroSchema, Financeiro } from "../models/financeiro/financeiro.model.js";
import { database } from "../db/postgre.js";

// controller referente ao financeiro
export const controllerFinanceiro = {
    // adicionar um reigstro MANUAL ao financeiro
    adicionarRegistro: async(req: Request, res: Response) => {
        // recebendo os dados do body
        const dadosBrutos = AdicionarFinanceiroSchema.safeParse(req.body)

        // validação de sempre
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Inválidos para adicionar um registro ao financeiro.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { titulo, valor, descricao, tipo, data_lancamento } = dadosBrutos.data
        const motoristaID = req.userId

        // operação
        try{
            // inserindo no banco de dados, sem tempo irmão kkkkkkk
            const { rows: [financeiro] } = await database.query<Financeiro>(
                `
                INSERT INTO financeiro
                (titulo, valor, tipo, data_lancamento, origem, motorista_id${descricao ? ', descricao' : ''})
                VALUES ($1, $2, $3, $4, $5, $6${descricao ? ', $7' : ''})
                RETURNING *
                `,
                [
                    titulo,
                    valor, 
                    tipo, 
                    data_lancamento ? data_lancamento : new Date().toLocaleDateString('en-CA'), // se vier a data de lançamento usa ela, se não, pega a data atual.
                    "MANUAL", 
                    motoristaID,
                    ...descricao ? [descricao] : []
                ] 
            )

            // retorna
            return res.status(201).json({
                msg: "Registro Financeiro Criado!",
                financeiro
            })
        }catch(erro){
            console.error("erro no endpoint de adicionar registro financeiro, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}