import { Request, Response } from "express";
import { CriarEscolaSchema } from "../models/escola.model.js";
import { database } from "../db/postgre.js";

export const controllerEscola = {
    // controller para criar uma nova escola
    criarEscola: async (req: Request, res: Response) => {
        // pega id do motorista do controller
        const motoristaId = req.userId
        // dados esperados: nome, endereço, telefone, hora_abertura, hora_fechamento, latitude, longitude
        const dadosBrutos = CriarEscolaSchema.safeParse(req.body)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // realizar desestruturação dos dados
        const { nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude } = dadosBrutos.data

        // realizando a operação
        try{
            const query = `INSERT INTO escola 
            (nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude, motorista_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`
            const valores = [nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude, motoristaId]

            const escola = await database.query(query, valores)

            return res.status(201).json({
                msg: "Escola criada com sucesso!",
                escola: escola.rows[0]
            })
        }catch(erro){
            console.error("Erro no endpoint de criar escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}