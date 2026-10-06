import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema do contrato
const ContratoSchema = z.object({
    id: UtilSchema.shape.id,
    data_inicio: z.iso.date("Data de início deve estar no formato YYYY-MM-DD."),
    data_fim: z.iso.date("Data de fim deve estar no formato YYYY-MM-DD."),
    dia_vencimento: z.coerce
        .number("Dia de vencimento deve ser um número.")
        .int("Dia de vencimento deve ser um número inteiro.")
        .positive("Dia de vencimento deve ser positivo.")
        .max(31, "Dia de vencimento deve ser no máximo 31."),
    valor_mensal: z.coerce
        .number("Valor mensal deve ser um número.")
        .nonnegative("Valor mensal não pode ser negativo.")
        .multipleOf(0.01, "Valor mensal deve ter no máximo duas casas decimais."),
    status: z.enum(['RASCUNHO', 'AGUARDANDO_ASSINATURA', 'ATIVO', 'FINALIZADO', 'CANCELADO'], "Status do contrato inválido."),
    criado_em: z.iso.datetime("Data de criação deve estar no formato ISO 8601."),
    cancelado_em: z.iso.datetime("Data de cancelamento deve estar no formato ISO 8601."),
    motivo_cancelamento: z.string("Motivo de cancelamento deve ser uma string."),
    aluno_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id,
    atualizado_em: z.iso.datetime("Data de atualização deve estar no formato ISO 8601.")
})
// Criar Contrato
export const CriarContratoSchema = ContratoSchema.pick({
    data_inicio: true,
    data_fim: true,
    dia_vencimento: true,
    valor_mensal: true,
    aluno_id: true
})
// Editar Contrato
export const EditarContratoSchema = CriarContratoSchema.omit({
    aluno_id: true
}).partial()

// tipos
export type Contrato = z.infer<typeof ContratoSchema>
export type CriarContrato = z.infer<typeof CriarContratoSchema>
export type EditarContrato = z.infer<typeof EditarContratoSchema>