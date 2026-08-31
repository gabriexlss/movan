import { Request, Response } from "express";
import { database } from "../db/postgre.js";
import { ParamsSchema } from "../models/utils.model.js";
import { CriarAlunoSchema, EditarAlunoSchema } from "../models/aluno.model.js";

export const controllerAluno = {
    // controller para criar um novo aluno
    criarAluno: async (req: Request, res: Response) => {
        // pega id do motorista do controller
        const motoristaId = req.userId
        // dados esperados: nome, endereço, telefone, latitude, longitude, data de nascimento, observação opcional e turno, além de escola  id e responsavel id
        const dadosBrutos = CriarAlunoSchema.safeParse(req.body)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar Aluno.",
                erro: dadosBrutos.error.format()
            })
        }
        // realizar desestruturação dos dados
        const { nome, data_nasc, ano_escolar, observacao, responsavel_id, escola_id, latitude, longitude, turno } = dadosBrutos.data

        // Verificando se as chaves estrangeiras existem no banco.
        try {
            // verificando se essas chaves existem.
            const queryBuscarResponsavel = "SELECT id FROM responsavel WHERE id = $1 AND motorista_id = $2"
            const queryBuscarEscola = "SELECT id FROM escola WHERE id = $1 AND motorista_id = $2"

            // inicia um Promise all pra executar todos os await de uma vez, para poupar tempo.
            const [responsavel, escola] = await Promise.all([
                database.query(queryBuscarResponsavel, [responsavel_id, motoristaId]),
                database.query(queryBuscarEscola, [escola_id, motoristaId])
            ])

            if (!responsavel.rowCount) {
                return res.status(404).json({
                    msg: "Responsável não encontrado para cadastrar aluno."
                })
            }

            if (!escola.rowCount) {
                return res.status(404).json({
                    msg: "Escola não encontrado para cadastrar aluno."
                })
            }

        } catch (erro) {
            console.error("Erro no endpoint de cadastrar aluno ao verificar chaves estrangeiras, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
        // Iniciando Operação.
        try {
            const query = `INSERT INTO aluno 
            (nome, data_nasc, ano_escolar, responsavel_id, escola_id, latitude, longitude, motorista_id, turno${observacao ? ', observacao' : ''}) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${observacao ? ', $10' : ''})
            RETURNING *`
            const valores = [nome, data_nasc, ano_escolar, responsavel_id, escola_id, latitude, longitude, motoristaId, turno]
            if (observacao) valores.push(observacao)

            const aluno = await database.query(query, valores)

            return res.status(201).json({
                msg: "Aluno criado com sucesso!",
                aluno: aluno.rows[0]
            })
        } catch (erro) {
            console.error("Erro no endpoint de criar aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    editarAluno: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware
        const motoristaId = req.userId
        // dados esperados: id. dados opcionais: nome, endereço, telefone, hora abertura e hora fechamento, latitude e longitude
        const dadosBrutos = EditarAlunoSchema.safeParse(req.body)

        // pegando ID do aluno dos parametros
        const idBruto = ParamsSchema.safeParse(req.params)

        //Validação dos dados
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID Inválido ou Ausente para editar aluno.",
                erro: idBruto.error.format()
            })
        }

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para editar o aluno.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação dos dados
        const { id } = idBruto.data
        const { nome, data_nasc, ano_escolar, observacao, latitude, longitude, escola_id, turno } = dadosBrutos.data

        // iniciando arrays para guardar os dados recebidos.
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checagem para verificar quais campos foram recebidos.
        if (!id) {
            return res.status(400).json({
                msg: "id é necessario para editar uma aluno"
            })
        }
        if (nome) {
            campos.push(`nome = $${valores.length + 1}`)
            valores.push(nome)
        }
        if (data_nasc) {
            campos.push(`data_nasc = $${valores.length + 1}`)
            valores.push(data_nasc)
        }
        if (observacao !== undefined) {
            campos.push(`observacao = $${valores.length + 1}`)
            valores.push(observacao)
        }
        if (ano_escolar) {
            campos.push(`ano_escolar = $${valores.length + 1}`)
            valores.push(ano_escolar)
        }
        if (latitude !== undefined) {
            campos.push(`latitude = $${valores.length + 1}`)
            valores.push(latitude)
        }
        if (longitude !== undefined) {
            campos.push(`longitude = $${valores.length + 1}`)
            valores.push(longitude)
        }
        if (turno) {
            campos.push(`turno = $${valores.length + 1}`)
            valores.push(turno)
        }
        try {
            if (escola_id) {
                // verificar se escola existe
                const query = "SELECT id FROM escola WHERE id = $1 AND motorista_id = $2"
                const escola = await database.query(query, [escola_id, motoristaId])
                if (!escola.rowCount) {
                    return res.status(404).json({
                        msg: "Escola não encontrado com o id fornecido para editar."
                    })
                } else {
                    campos.push(`escola_id = $${valores.length + 1}`)
                    valores.push(escola_id)
                }
            }
        } catch (erro) {
            console.error("Erro no endpoint de cadastrar aluno ao verificar chaves estrangeiras, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
        // se nenhum campo for recebido, manda embora
        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É necessario pelo menos um campo para realizar a edição."
            })
        }

        // Okay, agr realizar a operação
        try {
            const query = `
            UPDATE aluno
            SET ${campos.join(', ')}
            WHERE id = $${valores.length + 1} AND motorista_id = $${valores.length + 2} 
            `
            valores.push(id)
            valores.push(motoristaId)
            const aluno = await database.query(query, valores)

            if (!aluno.rowCount) {
                return res.status(404).json({
                    msg: "Nenhum Aluno Encontrado.",
                    id: id
                })
            } else {
                return res.status(200).json({
                    msg: "Aluno editado com sucesso!"
                })
            }

        } catch (erro) {
            console.error("Erro no endpoint de editar aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para excluir um aluno.
    excluirAluno: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware de autenticação
        const motoristaId = req.userId
        // dados esperados: id
        const dadosBrutos = ParamsSchema.safeParse(req.params)

        // validação dos dados (sendo o unico dado o id kkkk)
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID Inválido ou Ausente para deletar aluno.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id } = dadosBrutos.data

        try {
            const query = "DELETE FROM aluno WHERE id = $1 AND motorista_id = $2"

            const aluno = await database.query(query, [id, motoristaId])

            if (!aluno.rowCount) {
                return res.status(404).json({
                    msg: "Nenhum aluno Encontrado."
                })
            } else {
                return res.status(200).json({
                    msg: "Aluno Excluido com sucesso."
                })
            }

        } catch (erro) {
            console.error("Erro no endpoint de excluir aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para obter os dados (ou o dado) do aluno
    obterAluno: async (req: Request, res: Response) => {
        // pegando motoristaId do middleware.
        const motoristaId = req.userId
        // dados esperados: id, opcional
        const dadosBrutos = ParamsSchema.partial().safeParse(req.params)

        // validação do id
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Id inválido.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id } = dadosBrutos.data

        // IFs para montar a query e os valores dependendo se há ID ou não.
        let query: string
        const valores: number[] = []
        let resultado

        try {
            if (id) {
                query = "SELECT * FROM aluno WHERE motorista_id = $1 AND id = $2"
                valores.push(motoristaId)
                valores.push(id)
                const { rows } = await database.query(query, valores)
                if (rows.length < 1) {
                    resultado = null
                } else {
                    resultado = rows[0]
                }

            } else {
                query = "SELECT id, nome FROM aluno WHERE motorista_id = $1 ORDER BY id ASC"
                valores.push(motoristaId)
                const { rows } = await database.query(query, valores)
                if (rows.length < 1) {
                    resultado = null
                } else {
                    resultado = rows
                }
            }
            if (!resultado) {
                return res.status(404).json({
                    msg: "Nenhuma Aluno Encontrada."
                })
            } else {
                return res.status(200).json({
                    resultado
                })
            }

        } catch (erro) {
            console.error("erro no endpoint de obter aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno no Servidor."
            })
        }
    }
}