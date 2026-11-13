import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

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

export type Mensalidade = z.infer<typeof MensalidadeSchema>
