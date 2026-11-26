import { Request, Response } from "express";
import { AdicionarFinanceiroSchema, EditarFinanceiroSchema, Financeiro, QuerysObterFinanceiroSchema, QuerysSumarioFinaceiroSchema } from "../../models/financeiro/financeiro.model.js";
import { ParamsSchema } from "../../models/utils.model.js";
import { database } from "../../db/postgre.js";
import { possuiCodigoPostgres } from "../../utils/erroBanco.js";
import { Mensalidade } from "../../models/financeiro/mensalidade.model.js";

// controller referente ao financeiro
export const controllerFinanceiro = {
    // adicionar um reigstro MANUAL ao financeiro
    adicionarRegistro: async (req: Request, res: Response) => {
        // recebendo os dados do body
        const dadosBrutos = AdicionarFinanceiroSchema.safeParse(req.body)

        // validação de sempre
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para adicionar um registro ao financeiro.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { titulo, valor, descricao, tipo, data_lancamento } = dadosBrutos.data
        const motoristaID = req.userId

        // operação
        try {
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
        } catch (erro) {
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
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Querys Inválidas",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { mes: data, id } = dadosBrutos.data
        const motoristaID = req.userId

        // se vier a data na query (MM/YYYY ou YYYY), filtramos pelo mês ou pelo ano todo
        let dataInicio: string | undefined = undefined
        let intervalo: '1 month' | '1 year' = '1 month'
        if (data) {
            if (data.includes("/")) {
                const [mes, ano] = data.split("/").map(Number)
                dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`
                intervalo = '1 month'
            } else {
                dataInicio = `${Number(data)}-01-01`
                intervalo = '1 year'
            }
        }

        // operação
        try {
            // montando a query
            let query = `
                SELECT * FROM financeiro
                WHERE motorista_id = $1 
                `
            let parametros = 2
            if (dataInicio) {
                query += `AND data_lancamento >= $${parametros}::date AND data_lancamento < ($${parametros}::date + INTERVAL '${intervalo}') `
                parametros++
            }
            if (id) {
                query += `AND id = $${parametros}`
                parametros++
            }

            const { rows: financeiro } = await database.query<Financeiro>(
                query,
                [
                    motoristaID,
                    ...dataInicio ? [dataInicio] : [],
                    ...id ? [id] : []
                ]
            )

            // devolvendo o usuario
            if (financeiro.length === 0) {
                return res.status(404).json({
                    msg: "Nenhum Registro Encontrado."
                })
            }
            return res.status(200).json({
                msg: "Dados Obtidos com Sucesso.",
                financeiro
            })
        } catch (erro) {
            console.error("Erro no endpoint de consultar dados do financeiro, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    obterValor: async (req: Request, res: Response) => {
        // pega as querys
        const dadosBrutos = QuerysSumarioFinaceiroSchema.safeParse(req.query)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Querys Inválidas",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { mes: data, tipo } = dadosBrutos.data
        const motoristaID = req.userId

        // se vier a data na query (MM/YYYY ou YYYY), filtramos pelo mês ou pelo ano todo
        let dataInicio: string | undefined = undefined
        let intervalo: '1 month' | '1 year' = '1 month'
        if (data) {
            if (data.includes("/")) {
                const [mes, ano] = data.split("/").map(Number)
                dataInicio = `${ano}-${String(mes).padStart(2, "0")}-01`
                intervalo = '1 month'
            } else {
                dataInicio = `${Number(data)}-01-01`
                intervalo = '1 year'
            }
        }

        // operação
        try {
            //montando as querys
            let queryFinanceiro = `
                    SELECT valor, tipo 
                    FROM financeiro 
                    WHERE motorista_id = $1 
                    `
            let queryMensalidade = `
                    SELECT valor_cobrado 
                    FROM mensalidade 
                    WHERE motorista_id = $1 
                    AND status = $2 
                    `
            let parametros = 2
            if (dataInicio) {
                queryFinanceiro += `AND data_lancamento >= $${parametros}::date AND data_lancamento < ($${parametros}::date + INTERVAL '${intervalo}') `
                queryMensalidade += `AND competencia >= $${parametros + 1}::date AND competencia < ($${parametros + 1}::date + INTERVAL '${intervalo}') `
                parametros++
            }
            if (tipo) {
                queryFinanceiro += `AND tipo = $${parametros}`
                parametros++
            }

            // pegando os dados
            const [{ rows: financeiros }, { rows: mensalidades }] = await Promise.all([
                database.query(
                    queryFinanceiro,
                    [
                        motoristaID,
                        ...dataInicio ? [dataInicio] : [],
                        ...tipo ? [tipo] : []
                ]),
                tipo === 'ENTRADA' || tipo === undefined ? database.query<Pick<Mensalidade, 'valor_cobrado'>>(
                    queryMensalidade, 
                    [
                    motoristaID,
                    'PAGA',
                    ...dataInicio ? [dataInicio] : []
                ]) : { rows: [] }
            ]);

            if (financeiros.length === 0 && mensalidades.length === 0) {
                return res.status(200).json({
                    valor: 0.00
                })
            }

            let valor: number = 0.00

            for (const financeiro of financeiros) {
                if (financeiro.tipo === 'SAIDA') {
                    valor -= Number(financeiro.valor)
                } else {
                    valor += Number(financeiro.valor)
                }
            }
            for (const mensalidade of mensalidades) {
                valor += Number(mensalidade.valor_cobrado)
            }
            const valorFinal = Number(valor.toFixed(2))

            return res.status(200).json({
                valorFinal
            })
        } catch (erro) {
            console.error("Erro no endpoint de obter sumario do financeiro, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}