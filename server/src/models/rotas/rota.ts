import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

const RotaSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z
        .string("Nome deve ser uma string.")
        .min(1, "Nome não pode estar vazio.")
        .max(100, "Nome deve ter no máximo 100 caracteres.")
        .optional(),
    sentido: z.enum(['IDA', 'VOLTA'], "Sentido da rota inválido."),
    ativa: z.boolean("Ativa deve ser um booleano.").default(true),
    motorista_id: UtilSchema.shape.id
})
export const CriarRotaSchema = RotaSchema.omit({
    id: true,
    motorista_id: true
})
export const EditarRotaSchema = RotaSchema.omit({
    id: true,
    motorista_id: true
}).partial()

export type CriarRota = z.infer<typeof CriarRotaSchema>
export type EditarRota = z.infer<typeof EditarRotaSchema>
