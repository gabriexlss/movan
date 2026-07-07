import { Request, Response } from "express"
import { CriarMotoristaSchema } from "../models/motorista.model.js"
import { database } from "../db/postgre.js"
import bcrypt from "bcrypt"

// Criando o Controller do motorista
export const controllerMotorista = {
    // Controller pra criar um novo motorista vulgo usuario
    criarMotorista: async (req: Request, res: Response) => {
        // dados esperados: nome, cnpj, email, senha
        const dadosBrutos = CriarMotoristaSchema.safeParse(req.body)

        //checa se os dados enviados são validos
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Invalidos para criação do motorista",
                erro: dadosBrutos.error.format()
            });
        }
        // separando os dados
        const {nome, cnpj, email, senha} = dadosBrutos.data
        
        try{
            // checando se esse email ja existe no banco de dados
            const query = "SELECT id FROM motorista WHERE email = $1"
            const valores = [email]
            const { rows } = await database.query(query, valores)

            if(rows.length > 0){
                return res.status(409).json({
                    msg: "Este Email já esta cadastrado no movan."
                })
            }
        }catch(erro){
            console.error("Erro ao verificar se usuario já existe, ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }

        // transformando em hash a senha original do usuario
        const senhahash = await bcrypt.hash(senha, 10)
        
        //salvando arquivos no banco de dados
        try{
            const query = "INSERT INTO motorista (nome, cnpj, email, senha) VALUES ($1, $2, $3, $4)"
            const valores = [nome, cnpj, email, senhahash]
            
            // finalmente pega os dados e faz o insert no banco de dados
            await database.query(query, valores)
            return res.status(201).json({
                msg: "Motorista criado com sucesso!"
            })
        }catch(erro){
            // tratamento de dados, basicamente da uma mensagem no console do servidor com o erro onde nenhum usuario ve e pro usuario manda uma msg bonitinha
            console.error("Erro ao criar usúario, ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }
    }
}