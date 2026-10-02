import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema do contrato
const ContratoSchema = z.object({
    id: UtilSchema.shape.id,
    data_inicio: z.iso.date(),
    data_fim: z.iso.date(),
    dia_vencimento: z.coerce.number().int().positive().max(32),
    valor_mensal: z.coerce.number().nonnegative().multipleOf(0.01),
    status: z.enum(['RASCUNHO', 'AGUARDANDO_ASSINATURA', 'ATIVO', 'FINALIZADO', 'CANCELADO']),
    criado_em: z.iso.datetime(),
    cancelado_em: z.iso.datetime(),
    motivo_cancelamento: z.string(),
    aluno_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id,
    atualizado_em: z.iso.datetime()
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