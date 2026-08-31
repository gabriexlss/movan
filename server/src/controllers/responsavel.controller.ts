import { Request, Response } from "express"
import { CriarResponsavelSchema, EditarResponsavelSchema } from "../models/responsavel.model.js";
import { database } from "../db/postgre.js";
import { cpf } from "cpf-cnpj-validator";
import { ParamsSchema } from "../models/utils.model.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";

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
                msg: "Dados inválidos para criar o responsável.",
                erro: dadosBrutos.error.format()
            })
        }
        // separando os dados em constantes
        const { cpf: dadocpf, nome, endereco, tel, email } = dadosBrutos.data

        // if pra validar se um cpf realmente é um cpf ou se não é so um cara metendo rage bait.
        if (!cpf.isValid(dadocpf)) {
            return res.status(400).json({
                msg: "CPF inválido."
            })
        }
        // testando pra ver se o cpf não está em uso atualmente.
        try{
            const query = "SELECT id FROM responsavel WHERE cpf = $1"
            const CPFemUso = await database.query(query, [dadocpf])

            if(CPFemUso.rowCount){
                return res.status(409).json({
                    msg: "Responsável já cadastrado com esse CPF."
                })
            }
        }catch(erro){
            console.error("erro no endpoint de criar responsável ao verificar unique do cpf, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
        try {
            const query = "INSERT INTO responsavel (cpf, nome, endereco, tel, email, motorista_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
            const valores = [dadocpf, nome, endereco, tel, email, motoristaId]
            // faz o insert no banco de dados e retorna os dados que acabei de inserir
            const { rows } = await database.query(query, valores)
            // pega o valor que retornou e coloca numa constante
            const responsavel = rows[0]
            return res.status(201).json({
                msg: "Responsável criado com sucesso.",
                responsavel
            })
        } catch (erro) {
            console.error("erro no endpoint de criação de responsavel, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23505")) {
                return res.status(409).json({
                    msg: "Responsável já cadastrado com esse CPF."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para editar os dados de um responsavel
    editarResponsavel: async (req: Request, res: Response) => {
        const MotoristaId = req.userId
        // dados esperados: id. dados opcionais: cpf, nome, email, telefone, endereço
        const dadosBrutos = EditarResponsavelSchema.safeParse(req.body)

        // pega o ID dos parametros.
        const idBruto = ParamsSchema.safeParse(req.params)

        // valida dados, se forem invalidos, bye bye
        if(!idBruto.success){
            return res.status(400).json({
                msg: "ID inválido ou ausente para editar o responsável.",
                erro: idBruto.error.format()
            })
        }
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para editar o responsável.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação dos dados
        const { id } = idBruto.data
        const { nome, endereco, tel, email } = dadosBrutos.data

        // iniciando arrays de campos e valores
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checa pra ver se o id do responsavel realmente veio.
        if (!id) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para editar o responsável."
            })
        }

        // checagem para ver quais campos foram enviados.
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
        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É necessário informar pelo menos um campo para edição."
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
            const responsavel = await database.query(query, valores)

            if (!responsavel.rowCount) {
                return res.status(404).json({
                    msg: "Responsável não encontrado."
                })
            } else {
                return res.status(200).json({
                    msg: "Responsável editado com sucesso."
                })
            }
        } catch (erro) {
            console.error("Erro no endpoint de editar responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para deletar responsavel
    excluirResponsavel: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        // dados esperados: id.
        const dadosBrutos = ParamsSchema.safeParse(req.params)

        // validação pra ver se o id está correto
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para excluir o responsável.",
                erro: dadosBrutos.error.format()
            })
        }

        // desestruturação de dados
        const { id } = dadosBrutos.data

        try {
            const query = "DELETE FROM responsavel WHERE id = $1 AND motorista_id = $2"
            const valores = [id, motoristaId]
            // deleta o responsável
            const responsavel = await database.query(query, valores)

            if (!responsavel.rowCount) {
                return res.status(404).json({
                    msg: "Responsável não encontrado."
                })
            } else {
                return res.status(200).json({
                    msg: "Responsável excluído com sucesso."
                })
            }

        } catch (erro) {
            console.error("erro no endpoint de excluir responsável, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23503")) {
                return res.status(409).json({
                    msg: "Não é possível excluir o responsável enquanto houver alunos vinculados a ele."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para obter os dados do responsável.
    obterDados: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        // dados esperados: id
        const dadosBrutos = ParamsSchema.partial().safeParse(req.params)

        // validação pra ver se o id ta ok
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID inválido.",
                erro: dadosBrutos.error.format()
            })
        }
        const { id } = dadosBrutos.data
        try {
            if (id) {
                const query = "SELECT * FROM responsavel WHERE motorista_id = $1 AND id = $2"
                const { rows } = await database.query(query, [motoristaId, id])
                if (!rows[0]) {
                    return res.status(404).json({
                        msg: "Responsável não encontrado."
                    })
                }

                return res.status(200).json({
                    responsavel: rows[0]
                })
            }

            const query = "SELECT id, nome FROM responsavel WHERE motorista_id = $1 ORDER BY id ASC"
            const { rows } = await database.query(query, [motoristaId])

            return res.status(200).json({
                responsaveis: rows
            })

        } catch (erro) {
            console.error("erro no endpoint de obter dado de responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    }
}
