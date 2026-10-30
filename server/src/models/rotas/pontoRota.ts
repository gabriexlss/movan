import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

const PontoRotaSchema = z.object({
    id: UtilSchema.shape.id,
    ordem: z
        .number("Ordem deve ser um número.")
        .int("Ordem deve ser um número inteiro.")
        .positive("Ordem deve ser positiva.")
        .max(32767, "Ordem deve ser no máximo 32767."),
    tipo_ponto: z.enum(['EMBARQUE', 'DESEMBARQUE'], "Tipo de ponto inválido."),
    rota_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id,
    aluno_id: UtilSchema.shape.id.optional(),
    escola_id: UtilSchema.shape.id.optional()
})
export const CriarPontoRotaSchema = PontoRotaSchema.omit({
    id: true,
    rota_id: true,
    motorista_id: true
})
export const EditarPontoRotaSchema = PontoRotaSchema.omit({
    id: true,
    rota_id: true,
    motorista_id: true
}).partial()

export type CriarPontoRota = z.infer<typeof CriarPontoRotaSchema>
export type EditarPontoRota = z.infer<typeof EditarPontoRotaSchema>
