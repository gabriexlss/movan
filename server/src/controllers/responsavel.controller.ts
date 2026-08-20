import { Request, Response } from "express"
import { CriarResponsavelSchema } from "../models/responsavel.model.js";
import { database } from "../db/postgre.js";

export const controllerResponsavel = {
    criarResponsavel: async (req: Request, res: Response) => {
        // dados esperados: cpf, nome, endereco, telefone  e email
        const dadosBrutos  = CriarResponsavelSchema.safeParse(req.body)
        
        // pegando o id do cookie/middleware
        const motoristaId = req.userId

        // se a validação falhar, manda embora
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Invalidos para Criação do motorista",
                erro: dadosBrutos.error.format()
            })
        }
        // separando os dados em constantes
        const { cpf, nome, endereco, tel, email } = dadosBrutos.data

        try{
            const query = "INSERT INTO responsavel (cpf, nome, endereco, tel, email, motorista_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
            const valores = [cpf, nome, endereco, tel, email, motoristaId]
            // faz o insert no banco de dados e retorna os dados que acabei de inserir
            const { rows } = await database.query(query, valores)
            // pega o valor que retornou e coloca numa constante
            const responsavel = rows[0]
            return res.status(201).json({
                msg: "Responsavel criado com sucesso.",
                responsavel
            })
        }catch(erro){
            console.error("erro no endpoint de criação de responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}