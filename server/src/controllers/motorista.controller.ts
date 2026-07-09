import { Request, Response } from "express"
import { CriarMotoristaSchema } from "../models/motorista.model.js"
import { database } from "../db/postgre.js"
import bcrypt from "bcrypt"
import { gerarCodigo } from "../utils/mandarCodigo.js"

// Função pra verificar email ou cnpj
const verificarEmailouCNPJ = async (dado: string, tipo: string) => {

    // verifica se ambos os dados foram enviados
    if(!dado || !tipo) throw new Error("Algum dos dados está faltante")
        
    try {
            // checando se esse email ja existe no banco de dados
            const query = `SELECT id FROM motorista WHERE ${tipo} = $1`
            const valores = [dado]
            const { rows } = await database.query(query, valores)

            if(rows.length > 0){
                return false
            }
        }catch(erro){
            console.error("Erro ao verificar se usuario já existe, ", erro)
            throw new Error("Erro ao verificar no Banco de Dados", { cause: erro })
        }
        return true
}

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
        let userId: number

        // Verifica se Email ou CNPJ ja estão cadastrados
        try{
            const responseEmail = await verificarEmailouCNPJ(email, "email")
            if(!responseEmail) {
                return res.status(409).json({
                    msg: "Email Já Cadastrado no Movan."
                })
            }
            const responseCnpj = await verificarEmailouCNPJ(cnpj, "cnpj")
            if(!responseCnpj) {
                return res.status(409).json({
                    msg: "CNPJ Já Cadastrado no Movan."
                })
            }
        } catch(erro){
            console.error("Erro ao verificar se dados ja estão cadastrados, erro: ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }

        // transformando em hash a senha original do usuario
        const senhahash = await bcrypt.hash(senha, 10)
        
        //salvando arquivos no banco de dados
        try{
            const query = "INSERT INTO motorista (nome, cnpj, email, senha) VALUES ($1, $2, $3, $4) RETURNING id"
            const valores = [nome, cnpj, email, senhahash]
            
            // finalmente pega os dados e faz o insert no banco de dados
            const { rows } = await database.query(query, valores)
            userId = rows[0].id
        }catch(erro){
            // tratamento de dados, basicamente da uma mensagem no console do servidor com o erro onde nenhum usuario ve e pro usuario manda uma msg bonitinha
            console.error("Erro ao criar usúario, ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }

        try{
            // enviar o email com o codigo pro usuario
            const response = await gerarCodigo(email, "criar", userId)
            if(!response) throw new Error
            return res.status(201).json({
                msg: "Motorista criado com sucesso!"
            })
        }catch(erro){
            // Se não foi possivel enviar o codigo, apaga o usuario
            console.error("Erro na Hora de mandar o codigo, erro:", erro)
            try{
                const query = "DELETE FROM motorista WHERE id = $1"
                const valores = [userId]
                database.query(query, valores)
            }catch(erro){
                console.error("ERRO AO DELETAR USUARIO, ERRO: ", erro)
            }
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }
    }
}