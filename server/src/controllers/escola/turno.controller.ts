import { Request, Response } from "express";
import { CriarEscolaTurnoSchema, EditarEscolaTurnoSchema, ObterEscolaTurnoQuerySchema } from "../../models/escola/turno.model.js";
import { database } from "../../db/postgre.js";
import { ParamsSchema } from "../../models/utils.model.js";
import { possuiCodigoPostgres } from "../../utils/erroBanco.js";

export const controllerEscolaTurno = {
    // controller para criar um novo turno da escola
    criarTurno: async (req: Request, res: Response) => {
        // pega id do motorista do middleware
        const motoristaId = req.userId
        // dados esperados: turno, hora_entrada, hora_saida, escola_id
        const dadosBrutos = CriarEscolaTurnoSchema.safeParse(req.body)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para criar o turno da escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // realizar desestruturação dos dados
        const { turno, hora_entrada, hora_saida, escola_id } = dadosBrutos.data

        // realizando a operação, só insere se a escola pertencer ao motorista
        try {
            const query = `INSERT INTO escola_turno (turno, hora_entrada, hora_saida, escola_id)
            SELECT $1, $2, $3, id FROM escola WHERE id = $4 AND motorista_id = $5
            RETURNING *`
            const valores = [turno, hora_entrada, hora_saida, escola_id, motoristaId]

            const { rows } = await database.query(query, valores)

            if (!rows[0]) {
                return res.status(404).json({
                    msg: "Escola não encontrada."
                })
            }

            return res.status(201).json({
                msg: "Turno da escola criado com sucesso.",
                turno: rows[0]
            })
        } catch (erro) {
            console.error("Erro no endpoint de criar turno da escola, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23505")) {
                return res.status(409).json({
                    msg: "Essa escola já possui um turno cadastrado com esse tipo."
                })
            }
            if (possuiCodigoPostgres(erro, "23514")) {
                return res.status(400).json({
                    msg: "Hora de saída deve ser maior que a hora de entrada."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para editar um turno da escola
    editarTurno: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware
        const motoristaId = req.userId
        // dados opcionais: turno, hora_entrada e hora_saida
        const dadosBrutos = EditarEscolaTurnoSchema.safeParse(req.body)

        // pegando ID do turno dos parametros
        const idBruto = ParamsSchema.safeParse(req.params)

        // Validação dos dados
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para editar o turno.",
                erro: idBruto.error.format()
            })
        }

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para editar o turno.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação dos dados
        const { id } = idBruto.data
        const { turno, hora_entrada, hora_saida } = dadosBrutos.data

        // iniciando arrays para guardar os dados recebidos.
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checagem para verificar quais campos foram recebidos.
        if (turno) {
            campos.push(`turno = $${valores.length + 1}`)
            valores.push(turno)
        }
        if (hora_entrada) {
            campos.push(`hora_entrada = $${valores.length + 1}`)
            valores.push(hora_entrada)
        }
        if (hora_saida) {
            campos.push(`hora_saida = $${valores.length + 1}`)
            valores.push(hora_saida)
        }

        // se nenhum campo for recebido, manda embora
        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É necessário informar pelo menos um campo para edição."
            })
        }

        // Okay, agr realizar a operação
        try {
            const query = `
            UPDATE escola_turno
            SET ${campos.join(', ')}
            FROM escola
            WHERE escola_turno.id = $${valores.length + 1}
            AND escola.id = escola_turno.escola_id
            AND escola.motorista_id = $${valores.length + 2}
            `
            valores.push(id)
            valores.push(motoristaId)
            const resultado = await database.query(query, valores)

            if (!resultado.rowCount) {
                return res.status(404).json({
                    msg: "Turno não encontrado."
                })
            }
            return res.status(200).json({
                msg: "Turno editado com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de editar turno da escola, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23505")) {
                return res.status(409).json({
                    msg: "Essa escola já possui um turno cadastrado com esse tipo."
                })
            }
            if (possuiCodigoPostgres(erro, "23514")) {
                return res.status(400).json({
                    msg: "Hora de saída deve ser maior que a hora de entrada."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para excluir um turno da escola
    excluirTurno: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware de autenticação
        const motoristaId = req.userId
        // dados esperados: id
        const dadosBrutos = ParamsSchema.safeParse(req.params)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para excluir o turno.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id } = dadosBrutos.data

        try {
            const query = `
            DELETE FROM escola_turno
            USING escola
            WHERE escola_turno.id = $1
            AND escola.id = escola_turno.escola_id
            AND escola.motorista_id = $2`

            const resultado = await database.query(query, [id, motoristaId])

            if (!resultado.rowCount) {
                return res.status(404).json({
                    msg: "Turno não encontrado."
                })
            }
            return res.status(200).json({
                msg: "Turno excluído com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de excluir turno da escola, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23503")) {
                return res.status(409).json({
                    msg: "Não é possível excluir o turno enquanto houver registros vinculados a ele."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // controller para obter os dados (ou o dado) do turno da escola
    obterTurno: async (req: Request, res: Response) => {
        // pegando motoristaId do middleware.
        const motoristaId = req.userId
        // dados esperados: id (parametro), opcional
        const dadosBrutos = ParamsSchema.partial().safeParse(req.params)
        // filtro opcional pela escola, usado na listagem
        const queryBruta = ObterEscolaTurnoQuerySchema.safeParse(req.query)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID inválido.",
                erro: dadosBrutos.error.format()
            })
        }
        if (!queryBruta.success) {
            return res.status(400).json({
                msg: "ID da escola inválido.",
                erro: queryBruta.error.format()
            })
        }
        // desestruturação
        const { id } = dadosBrutos.data
        const { escola_id } = queryBruta.data

        try {
            if (id) {
                const query = `
                SELECT escola_turno.* FROM escola_turno
                INNER JOIN escola ON escola.id = escola_turno.escola_id
                WHERE escola_turno.id = $1 AND escola.motorista_id = $2`
                const { rows } = await database.query(query, [id, motoristaId])
                if (!rows[0]) {
                    return res.status(404).json({
                        msg: "Turno não encontrado."
                    })
                }

                return res.status(200).json({
                    turno: rows[0]
                })
            }

            const valores: number[] = [motoristaId]
            let query = `
            SELECT escola_turno.* FROM escola_turno
            INNER JOIN escola ON escola.id = escola_turno.escola_id
            WHERE escola.motorista_id = $1`
            if (escola_id) {
                query += " AND escola_turno.escola_id = $2"
                valores.push(escola_id)
            }
            query += " ORDER BY escola_turno.escola_id ASC, escola_turno.hora_entrada ASC"

            const { rows } = await database.query(query, valores)

            return res.status(200).json({
                turnos: rows
            })
        } catch (erro) {
            console.error("Erro no endpoint de obter turno da escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    }
}
