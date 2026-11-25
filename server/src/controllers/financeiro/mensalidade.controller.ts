import { PoolClient } from "pg";
import { Contrato } from "../../models/contrato/contrato.model.js";
import { Request, Response } from "express";
import { database } from "../../db/postgre.js";
import { ParamsSchema } from "../../models/utils.model.js";
import { AlterarStatusMensalidadeSchema, Mensalidade, QuerysObterMensalidadeSchema } from "../../models/financeiro/mensalidade.model.js";

interface criarMensalidadeProps{
    contratoID: number,
    motoristaID: number,
    cliente: PoolClient
}

export const controllerMensalide = {
    // função para criar uma mensalidade assim que o contrato for assinado.
    criarMensalidade: async ({ contratoID, motoristaID, cliente }: criarMensalidadeProps): Promise<void> => {

        // pega os dados do contrato
        const { rows: [contrato] } = await cliente.query<Contrato>(
            `
            SELECT * FROM contrato
            WHERE id = $1 AND motorista_id = $2
            `,
            [contratoID, motoristaID]
        )
        if(!contrato){
            throw new Error("CONTRATO_NOT_FOUND")
        }
        // transforma as datas q vem em string pra Date.
        const dataInicio = new Date(contrato.data_inicio)
        const dataFim = new Date(contrato.data_fim)

        // cria as constantes pra guardar os arrays q vou usar pra inserir isso no bd, to tentando fazer de um jeito mais dificil, mas mais eficiente.
        const mensalidadeQuery: string[] = []
        const mensalidadeValores: (string | number | Date)[] = []

        // defino o placeholder inicial como 1, tipo $1
        let placeholder = 1

        // inicio um for que vai durar desde o mes de inicio até o mes do fim do contrato
        for(let i = dataInicio.getMonth() + 2; i <= dataFim.getMonth() + 2; i++){
            // dou um push no array com a query
            mensalidadeQuery.push(
                `($${placeholder}, $${placeholder + 1}, $${placeholder + 2}, $${placeholder + 3}, $${placeholder + 4}, $${placeholder + 5})`
            )
            // atualizo o placeholder
            placeholder += 6

            // crio uma nova data pra competencia que é a data do vencimento menos sete dias
            const competencia = new Date(Date.UTC(dataInicio.getFullYear(), i - 1, contrato.dia_vencimento - 7, 3, 0, 0));
            // crio a data do vencimento
            const dataVencimento = new Date(Date.UTC(dataInicio.getFullYear(), i - 1, contrato.dia_vencimento, 3, 0, 0))

            // dou um push no array dos valores
            mensalidadeValores.push(
                competencia,
                contrato.valor_mensal,
                dataVencimento,
                "PENDENTE",
                contratoID,
                motoristaID
            )
        }

        await cliente.query(
            `
            INSERT INTO mensalidade
            (competencia, valor_cobrado, data_vencimento, status, contrato_id, motorista_id)
            VALUES ${mensalidadeQuery.join(', ')}
            `,
            mensalidadeValores
        )
        return
    },
    // endpoint pra pagar uma mensalidade usando o id dos params
    pagarMensalidade: async (req: Request, res: Response) => {
        // pega o id dos params
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação de sempre
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID inválido ou ausente para pagar a mensalidade.",
                erro: idBruto.error.format()
            })
        }

        // desestruturação
        const { id } = idBruto.data
        const motoristaID = req.userId

        // operação
        try {
            // já tenta atualizar direto só se estiver pendente e for desse motorista
            const { rows: [mensalidade] } = await database.query<Mensalidade>(
                `
                UPDATE mensalidade
                SET status = 'PAGA'
                WHERE id = $1 AND motorista_id = $2 AND status = 'PENDENTE'
                RETURNING *
                `,
                [id, motoristaID]
            )

            // se não atualizou nada, vê o que rolou (não existe, já foi paga ou foi cancelada)
            if (!mensalidade) {
                const { rows: [existente] } = await database.query<Pick<Mensalidade, "status">>(
                    `
                    SELECT status FROM mensalidade
                    WHERE id = $1 AND motorista_id = $2
                    `,
                    [id, motoristaID]
                )

                if (!existente) {
                    return res.status(404).json({
                        msg: "Mensalidade não encontrada."
                    })
                }
                if (existente.status === "PAGA") {
                    return res.status(409).json({
                        msg: "Essa mensalidade já foi paga."
                    })
                }
                return res.status(409).json({
                    msg: "Não é possível pagar uma mensalidade cancelada."
                })
            }

            // retorna a mensalidade atualizada
            return res.status(200).json({
                msg: "Mensalidade paga com sucesso.",
                mensalidade
            })
        } catch (erro) {
            console.error("Erro no endpoint de pagar mensalidade, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    alterarStatusMensalidade: async (req: Request, res: Response) => {
        const params = ParamsSchema.safeParse(req.params)
        const dados = AlterarStatusMensalidadeSchema.safeParse(req.body)

        if (!params.success || !dados.success) {
            return res.status(400).json({
                msg: "Dados inválidos para alterar o status da mensalidade.",
                erro: !params.success ? params.error.format() : !dados.success ? dados.error.format() : undefined
            })
        }

        try {
            const { rows: [mensalidade] } = await database.query<Mensalidade>(
                `
                UPDATE mensalidade
                SET status = $1,
                    cancelada_em = CASE WHEN $1 = 'CANCELADA' THEN COALESCE(cancelada_em, now()) ELSE NULL END,
                    motivo_cancelamento = CASE WHEN $1 = 'CANCELADA' THEN motivo_cancelamento ELSE NULL END
                WHERE id = $2 AND motorista_id = $3
                RETURNING *
                `,
                [dados.data.status, params.data.id, req.userId]
            )

            if (!mensalidade) {
                return res.status(404).json({ msg: "Mensalidade não encontrada." })
            }

            return res.status(200).json({
                msg: "Status da mensalidade atualizado com sucesso.",
                mensalidade
            })
        } catch (erro) {
            console.error("Erro ao alterar o status da mensalidade: ", erro)
            return res.status(500).json({ msg: "Erro Interno do Servidor." })
        }
    },
    // endpoint pra listar as mensalidades com filtros opcionais de aluno_id, mes e status
    obterMensalidades: async (req: Request, res: Response) => {
        // pega as querys
        const dadosBrutos = QuerysObterMensalidadeSchema.safeParse(req.query)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Querys Inválidas.",
                erro: dadosBrutos.error.format()
            })
        }

        // desestruturação
        const { aluno_id, mes, status } = dadosBrutos.data
        const motoristaID = req.userId

        // monto a query base só com os dados da mensalidade
        let query = `
        SELECT mensalidade.*, aluno.nome AS nome_aluno
        FROM mensalidade
        LEFT JOIN contrato ON contrato.id = mensalidade.contrato_id
            AND contrato.motorista_id = mensalidade.motorista_id
        LEFT JOIN aluno ON aluno.id = contrato.aluno_id
            AND aluno.motorista_id = mensalidade.motorista_id
        WHERE mensalidade.motorista_id = $1
        `
        const valores: (string | number)[] = [motoristaID]

        // se vier aluno_id na query, filtra pelo contrato dele
        if (aluno_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM contrato
                WHERE contrato.id = mensalidade.contrato_id
                AND contrato.aluno_id = $${valores.length + 1}
            )`
            valores.push(aluno_id)
        }

        // se vier o mes na query (MM/YYYY), filtra as mensalidades que vencem dentro daquele mês
        if (mes) {
            const [mesNumero, ano] = mes.split("/").map(Number)
            const dataInicioMes = `${ano}-${String(mesNumero).padStart(2, "0")}-01`
            query += ` AND data_vencimento >= $${valores.length + 1}::date AND data_vencimento < ($${valores.length + 1}::date + INTERVAL '1 month')`
            valores.push(dataInicioMes)
        }

        // se vier o status, filtra por ele (atrasada é pendente com vencimento antes de hoje)
        if (status) {
            if (status === "ATRASADA") {
                query += ` AND mensalidade.status = 'PENDENTE' AND data_vencimento < (now() AT TIME ZONE 'America/Sao_Paulo')::date`
            } else {
                query += ` AND mensalidade.status = $${valores.length + 1}`
                valores.push(status)
            }
        }

        query += ` ORDER BY data_vencimento ASC, mensalidade.id ASC`

        // operação
        try {
            const { rows: mensalidades } = await database.query<Mensalidade>(
                query,
                valores
            )

            // devolvendo pro usuario
            return res.status(200).json({
                msg: "Mensalidades obtidas com sucesso.",
                mensalidades
            })
        } catch (erro) {
            console.error("Erro no endpoint de obter mensalidades, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}