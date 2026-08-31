import { Request, Response } from "express";
import { CriarEscolaSchema, EditarEscolaSchema } from "../models/escola.model.js";
import { database } from "../db/postgre.js";
import { ParamsSchema } from "../models/utils.model.js";

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
        const { nome, endereco, tel, latitude, longitude } = dadosBrutos.data

        // realizando a operação
        try {
            const query = `INSERT INTO escola 
            (nome, endereco, tel, latitude, longitude, motorista_id) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`
            const valores = [nome, endereco, tel, latitude, longitude, motoristaId]

            const escola = await database.query(query, valores)

            return res.status(201).json({
                msg: "Escola criada com sucesso!",
                escola: escola.rows[0]
            })
        } catch (erro) {
            console.error("Erro no endpoint de criar escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    editarEscola: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware
        const motoristaId = req.userId
        // dados esperados: id. dados opcionais: nome, endereço, telefone, hora abertura e hora fechamento, latitude e longitude
        const dadosBrutos = EditarEscolaSchema.safeParse(req.body)

        // pegando ID da escola dos parametros
        const idBruto = ParamsSchema.safeParse(req.params)

        //Validação dos dados
        if(!idBruto.success){
            return res.status(400).json({
                msg: "ID Inválido ou Ausente para editar escola.",
                erro: idBruto.error.format()
            })
        }

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para editar a escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação dos dados
        const { id } = idBruto.data
        const { nome, endereco, tel, latitude, longitude } = dadosBrutos.data

        // iniciando arrays para guardar os dados recebidos.
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checagem para verificar quais campos foram recebidos.
        if (!id) {
            return res.status(400).json({
                msg: "id é necessario para editar uma escola"
            })
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
        if (latitude) {
            campos.push(`latitude = $${valores.length + 1}`)
            valores.push(latitude)
        }
        if (longitude) {
            campos.push(`longitude = $${valores.length + 1}`)
            valores.push(longitude)
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
            UPDATE escola
            SET ${campos.join(', ')}
            WHERE id = $${valores.length + 1} AND motorista_id = $${valores.length + 2} 
            `
            valores.push(id)
            valores.push(motoristaId)
            const escola = await database.query(query, valores)

            if (!escola.rowCount) {
                return res.status(404).json({
                    msg: "Nenhuma Escola Encontrada."
                })
            } else {
                return res.status(200).json({
                    msg: "Escola editada com sucesso!"
                })
            }

        } catch (erro) {
            console.error("Erro no endpoint de editar escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para excluir uma escola.
    excluirEscola: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware de autenticação
        const motoristaId = req.userId
        // dados esperados: id
        const dadosBrutos = ParamsSchema.safeParse(req.params)

        // validação dos dados (sendo o unico dado o id kkkk)
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID Inválido ou Ausente para deletar escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id } = dadosBrutos.data

        try {
            const query = "DELETE FROM escola WHERE id = $1 AND motorista_id = $2"

            const escola = await database.query(query, [id, motoristaId])

            if (!escola.rowCount) {
                return res.status(404).json({
                    msg: "Nenhuma Escola Encontrada."
                })
            } else {
                return res.status(200).json({
                    msg: "Escola Excluida com sucesso."
                })
            }

        } catch (erro) {
            console.error("Erro no endpoint de excluir escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para obter os dados (ou o dado) da escola
    obterEscola: async (req: Request, res: Response) => {
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
                query = "SELECT * FROM escola WHERE motorista_id = $1 AND id = $2"
                valores.push(motoristaId)
                valores.push(id)
                const { rows } = await database.query(query, valores)
                if (rows.length < 1) {
                    resultado = null
                } else {
                    resultado = rows[0]
                }

            } else {
                query = "SELECT id, nome FROM escola WHERE motorista_id = $1 ORDER BY id ASC"
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
                    msg: "Nenhuma Escola Encontrada."
                })
            } else {
                return res.status(200).json({
                    resultado
                })
            }

        } catch (erro) {
            console.error("erro no endpoint de obter escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno no Servidor."
            })
        }
    }
}