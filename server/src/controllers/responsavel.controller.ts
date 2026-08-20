import { Request, Response } from "express"
import { CriarResponsavelSchema, EditarResponsavelSchema } from "../models/responsavel.model.js";
import { database } from "../db/postgre.js";

export const controllerResponsavel = {
    // controller para criar um novo responsavel
    criarResponsavel: async (req: Request, res: Response) => {
        // dados esperados: cpf, nome, endereco, telefone  e email
        const dadosBrutos = CriarResponsavelSchema.safeParse(req.body)

        // pegando o id do cookie/middleware
        const motoristaId = req.userId

        // se a validação falhar, manda embora
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Invalidos para Criação do responsavel",
                erro: dadosBrutos.error.format()
            })
        }
        // separando os dados em constantes
        const { cpf, nome, endereco, tel, email } = dadosBrutos.data

        try {
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
        } catch (erro) {
            console.error("erro no endpoint de criação de responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para editar os dados de um responsavel
    editarResponsavel: async (req: Request, res: Response) => {
        const MotoristaId = req.userId
        // dados esperados: id. dados opcionais: cpf, nome, email, telefone, endereço
        const dadosBrutos = EditarResponsavelSchema.safeParse(req.body)

        // valida dados, se forem invalidos, bye bye
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para edição do responsavel.",
                erro: dadosBrutos.error.format()
            })
        }
        const { id, cpf, nome, endereco, tel, email } = dadosBrutos.data

        // iniciando arrays de campos e valores
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checa pra ver se o id do responsavel realmente veio.
        if (!id) {
            return res.status(400).json({
                msg: "id do responsável é obrigatorio para edita-lo"
            })
        }

        // checagem para ver quais campos foram enviados.
        if (cpf) {
            campos.push(`cpf = $${valores.length + 1}`)
            valores.push(cpf)
        }
        if (nome) {
            campos.push(`nome = $${valores.length + 1}`)
            valores.push(nome)
        }
        if (endereco) {
            campos.push(`endereco = $${valores.length + 1}`)
            valores.push(endereco)
        }
        if (tel) {
            campos.push(`tel = $${valores.length + 1}`)
            valores.push(tel)
        }
        if (email) {
            campos.push(`email = $${valores.length + 1}`)
            valores.push(email)
        }

        // se nao tiver nenhum campo para edição, manda embora.
        if (campos.length < 2) {
            return res.status(400).json({
                msg: "É necessario enviar pelo menos um valor para enviar."
            })
        }

        // Ok, agora organizar array e enviar.
        try {
            const query = `UPDATE responsavel
                SET ${campos.join(", ")}
                WHERE id = $${valores.length + 1} AND motorista_id = $${valores.length + 2}
                `
            valores.push(id)
            valores.push(MotoristaId)
            await database.query(query, valores)

            return res.status(200).json({
                msg: "Responsavel Editado com Sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de editar responsavel, erro: ", erro)
            return res.status(500).json("Erro Interno do Servidor.")
        }
    },

}