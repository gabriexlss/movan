import { Request, Response } from "express";
import { AdicionarFinanceiroSchema, EditarFinanceiroSchema, Financeiro, QuerysObterFinanceiroSchema } from "../models/financeiro/financeiro.model.js";
import { ParamsSchema } from "../models/utils.model.js";
import { database } from "../db/postgre.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";

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
    },
    // controller para editar um registro financeiro
    editarRegistro: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        const dadosBrutos = EditarFinanceiroSchema.safeParse(req.body)
        const idBruto = ParamsSchema.safeParse(req.params)

        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para editar o registro financeiro.",
                erro: idBruto.error.format()
            })
        }

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para editar o registro financeiro.",
                erro: dadosBrutos.error.format()
            })
        }

        const { id } = idBruto.data
        const { titulo, valor, descricao, tipo, data_lancamento } = dadosBrutos.data

        const campos: string[] = []
        const valores: (string | number)[] = []

        if (titulo) {
            campos.push(`titulo = $${valores.length + 1}`)
            valores.push(titulo)
        }
        if (valor !== undefined) {
            campos.push(`valor = $${valores.length + 1}`)
            valores.push(valor)
        }
        if (descricao !== undefined) {
            campos.push(`descricao = $${valores.length + 1}`)
            valores.push(descricao)
        }
        if (tipo) {
            campos.push(`tipo = $${valores.length + 1}`)
            valores.push(tipo)
        }
        if (data_lancamento) {
            campos.push(`data_lancamento = $${valores.length + 1}`)
            valores.push(data_lancamento)
        }

        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É necessário informar pelo menos um campo para edição."
            })
        }

        try {
            const query = `
            UPDATE financeiro
            SET ${campos.join(', ')}
            WHERE id = $${valores.length + 1} AND motorista_id = $${valores.length + 2}
            RETURNING *
            `
            valores.push(id)
            valores.push(motoristaId)

            const resultado = await database.query<Financeiro>(query, valores)

            if (!resultado.rowCount) {
                return res.status(404).json({
                    msg: "Registro financeiro não encontrado."
                })
            }

            return res.status(200).json({
                msg: "Registro financeiro editado com sucesso.",
                financeiro: resultado.rows[0]
            })
        } catch (erro) {
            console.error("Erro no endpoint de editar registro financeiro, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para excluir um registro financeiro
    excluirRegistro: async (req: Request, res: Response) => {
        const motoristaId = req.userId
        const dadosBrutos = ParamsSchema.safeParse(req.params)

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para excluir o registro financeiro.",
                erro: dadosBrutos.error.format()
            })
        }

        const { id } = dadosBrutos.data

        try {
            const query = "DELETE FROM financeiro WHERE id = $1 AND motorista_id = $2"
            const resultado = await database.query(query, [id, motoristaId])

            if (!resultado.rowCount) {
                return res.status(404).json({
                    msg: "Registro financeiro não encontrado."
                })
            }

            return res.status(200).json({
                msg: "Registro financeiro excluído com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de excluir registro financeiro, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23503")) {
                return res.status(409).json({
                    msg: "Não é possível excluir o registro financeiro enquanto houver outros registros vinculados a ele."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    obterRegistros: async (req: Request, res: Response) => {
        // pega as querys
        const dadosBrutos = QuerysObterFinanceiroSchema.safeParse(req.query)

        // validação
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Querys Inválidas",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { mes: data, id } = dadosBrutos.data
        const motoristaID = req.userId

        // se vier a data na query, filtramos ela
        let dataISO: Date | undefined = undefined
        if(data){
            const [ mes, ano ] = data.split("/").map(Number)
            dataISO = new Date(`${ano}-${String(mes).padStart(2, "0")}-01T00:00:00.000Z`)
        }

        // operação
        try{
            const { rows: financeiro } = await database.query<Financeiro>(
                `
                SELECT * FROM financeiro
                WHERE motorista_id = $1 
                ${dataISO ? "AND data_lancamento >= $2 AND data_lancamento < $2 + INTERVAL '1 month' " : ''}
                ${id ? 'AND id = $3' : ''}
                `,
                [
                    motoristaID,
                    ...dataISO ? [dataISO] : [],
                    ...id ? [id] : []
                ]
            )

            // devolvendo o usuario
            if(financeiro.length === 0){
                return res.status(404).json({
                    msg: "Nenhum Registro Encontrado."
                })
            }
            return res.status(200).json({
                msg: "Dados Obtidos com Sucesso.",
                financeiro
            })
        }catch(erro){
            console.error("Erro no endpoint de consultar dados do financeiro, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}