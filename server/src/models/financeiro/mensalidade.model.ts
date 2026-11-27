import { z } from "zod";
import { ParamsSchema, UtilSchema } from "../utils.model.js";

// Schema da mensalidade
export const MensalidadeSchema = z.object({
    id: UtilSchema.shape.id,
    competencia: z.iso.date("Competência deve estar no formato YYYY-MM-DD."),
    valor_cobrado: z.coerce
        .number("Valor cobrado deve ser um número.")
        .nonnegative("Valor cobrado não pode ser negativo.")
        .multipleOf(0.01, "Valor cobrado deve ter no máximo duas casas decimais."),
    data_vencimento: z.iso.date("Data de vencimento deve estar no formato YYYY-MM-DD."),
    status: z.enum(['PENDENTE', 'PAGA', 'CANCELADA'], "Status da mensalidade inválido."),
    cancelada_em: z.iso.datetime("Data de cancelamento deve estar no formato ISO 8601.").optional(),
    motivo_cancelamento: z
        .string("Motivo de cancelamento deve ser uma string.")
        .trim()
        .min(1, "Motivo de cancelamento não pode estar vazio.")
        .optional(),
    contrato_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id
})

// se mandarem pago, cancelado ou em minúsculo na query, já converte pro padrão do banco
const normalizarStatusMensalidade = (valor: unknown) => {
    if (typeof valor !== "string") return valor

    const limpo = valor.trim().toUpperCase()
    const mapa: Record<string, string> = {
        PAGO: "PAGA",
        CANCELADO: "CANCELADA",
        ATRASADO: "ATRASADA",
    }

    return mapa[limpo] ?? limpo
}

// querys opcionais pra filtrar as mensalidades no get
export const QuerysObterMensalidadeSchema = z.object({
    aluno_id: ParamsSchema.shape.id,
    mes: z.stringFormat("mm-yyyy-ou-yyyy", /^((0[1-9]|1[0-2])\/)?\d{4}$/, { error: "Data inválida. Use o formato MM/YYYY ou YYYY." }),
    status: z.preprocess(
        normalizarStatusMensalidade,
        z.enum(['PENDENTE', 'PAGA', 'CANCELADA', 'ATRASADA'], "Status da mensalidade inválido.")
    )
}).partial()

export const AlterarStatusMensalidadeSchema = z.strictObject({
    status: MensalidadeSchema.shape.status
})
export type Mensalidade = z.infer<typeof MensalidadeSchema>
