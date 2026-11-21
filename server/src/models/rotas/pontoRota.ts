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

export const MoverPontosRotaSchema = z.object({
    from: z.coerce.number().int().positive(),
    to: z.coerce.number().int().positive()
})

export const AdicionarPontoRotaSchema = z.object({
    aluno_id: z.coerce
        .number("ID do aluno deve ser um número.")
        .int("ID do aluno deve ser um número inteiro.")
        .positive("ID do aluno deve ser positivo.")
})

export const PontoRotaParamsSchema = z.object({
    id: z.coerce
        .number("ID da rota deve ser um número.")
        .int("ID da rota deve ser um número inteiro.")
        .positive("ID da rota deve ser positivo."),
    ponto_id: z.coerce
        .number("ID do ponto deve ser um número.")
        .int("ID do ponto deve ser um número inteiro.")
        .positive("ID do ponto deve ser positivo.")
})

export type PontoRota = z.infer<typeof PontoRotaSchema>
export type CriarPontoRota = z.infer<typeof CriarPontoRotaSchema>
export type EditarPontoRota = z.infer<typeof EditarPontoRotaSchema>
export type MoverPontosRota = z.infer<typeof MoverPontosRotaSchema>
