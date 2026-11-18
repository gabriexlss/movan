import { Request } from "express";
import { PoolClient } from "pg";
import { Contrato } from "../../models/contrato/contrato.model.js";

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
    }
}