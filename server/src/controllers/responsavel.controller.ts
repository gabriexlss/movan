import { Request, Response } from "express"
import { CriarResponsavelSchema, EditarResponsavelSchema, DeletarResponsavelSchema, ObterResponsavelSchema } from "../models/responsavel.model.js";
import { database } from "../db/postgre.js";
import { cpf } from "cpf-cnpj-validator";

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
        const { cpf: dadocpf, nome, endereco, tel, email } = dadosBrutos.data

        // if pra validar se um cpf realmente é um cpf ou se não é so um cara metendo rage bait.
        if (!cpf.isValid(dadocpf)) {
            return res.status(400).json({
                msg: "CPF Digitado não é um CPF válido."
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
        const { id, cpf: cpfdado, nome, endereco, tel, email } = dadosBrutos.data

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
        if (cpfdado) {
            if (!cpf.isValid(cpfdado)) {
                return res.status(400).json({
                    msg: "CPF Digitado não é um CPF válido."
                })
            }
            campos.push(`cpf = $${valores.length + 1}`)
            valores.push(cpfdado)
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
        if (campos.length < 1) {
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
            const responsavel = await database.query(query, valores)

            if (!responsavel.rowCount) {
                return res.status(404).json({
                    msg: "Nenhum Responsável encontrado."
                })
            } else {
                return res.status(200).json({
                    msg: "Responsavel Editado com Sucesso."
                })
            }
        } catch (erro) {
            console.error("Erro no endpoint de editar responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para deletar responsavel
    excluirResponsavel: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        // dados esperados: id.
        const dadosBrutos = DeletarResponsavelSchema.safeParse(req.params)

        // validação pra ver se o id está correto
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Invalidos para deletar responsavel",
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
                    msg: "Nenhum Responsável encontrado."
                })
            } else {
                return res.status(200).json({
                    msg: "Responsável deletado com sucesso."
                })
            }

        } catch (erro) {
            console.error("erro no endpoint de excluir responsável, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para obter os dados do responsável.
    obterDados: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        // dados esperados: id
        const dadosBrutos = ObterResponsavelSchema.safeParse(req.params)

        // validação pra ver se o id ta ok
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para obter dados do responsável.",
                erro: dadosBrutos.error.format()
            })
        }
        const { id } = dadosBrutos.data
        try {
            const querycomID = "SELECT * FROM responsavel WHERE motorista_id = $1 AND id = $2"
            const querysemID = "SELECT id, nome FROM responsavel WHERE motorista_id = $1"
            let resultado
            if (id) {
                const { rows } = await database.query(querycomID, [motoristaId, id])
                if (rows.length < 1) {
                    resultado = null
                } else {
                    resultado = rows[0]
                }
            } else {
                const { rows } = await database.query(querysemID, [motoristaId])
                if (rows.length < 1) {
                    resultado = null
                } else {
                    resultado = rows
                }
            }
            if (!resultado) {
                return res.status(404).json({
                    msg: "Nenhum Respnsável Encontrado."
                })
            } else {
                return res.status(200).json({
                    responsavel: resultado
                })
            }

        } catch (erro) {
            console.error("erro no endpoint de obter dado de responsavel, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
    }
}