import { z } from "zod";
import { ParamsSchema, UtilSchema } from "../utils.model.js";

const RotaSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z
        .string("Nome deve ser uma string.")
        .min(1, "Nome não pode estar vazio.")
        .max(100, "Nome deve ter no máximo 100 caracteres.")
        .optional(),
    sentido: z.enum(['IDA', 'VOLTA'], "Sentido da rota inválido."),
    ativa: z.boolean("Ativa deve ser um booleano."),
    motorista_id: UtilSchema.shape.id,
    turno: z.enum(['MANHA', 'TARDE', 'NOITE'])
})
export const RotaDiaSemanaSchema = z.object({
    rota_id: RotaSchema.shape.id,
    dia_semana: z.number().positive()
})
export const CriarRotaSchema = RotaSchema.pick({
    nome: true,
    sentido: true,
    ativa: true,
    motorista_id: true,
    turno: true
})
export const FiltrosRotaSchema = RotaSchema.pick({
    id: true,
    sentido: true,
    turno: true
}).extend({
    dia: z.enum(['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA'])
}).partial()

export const OtimizarRotaSchema = z.object({
    id: ParamsSchema.shape.id,
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude
})

export type Rota = z.infer<typeof RotaSchema>
export type RotaDiaSemana = z.infer<typeof RotaDiaSemanaSchema>
export type CriarRota = z.infer<typeof CriarRotaSchema>
