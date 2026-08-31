import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

const EscolaSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z
        .string("Nome deve ser uma string.")
        .min(1, "Nome não pode estar vazio.")
        .max(200, "Nome deve ter no máximo 200 caracteres."),
    endereco: z
        .string("Endereço deve ser uma string.")
        .min(5, "Endereço deve ter pelo menos 5 caracteres.")
        .max(255, "Endereço deve ter no máximo 255 caracteres."),
    tel: z
        .string("Telefone deve ser uma string.")
        .regex(/^\d{11}$/, "Telefone deve conter exatamente 11 dígitos."),
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude,
    motorista_id: UtilSchema.shape.id
})
export const CriarEscolaSchema = EscolaSchema.omit({
    id: true,
    motorista_id: true
})
export const EditarEscolaSchema = EscolaSchema.omit({
    motorista_id: true,
    id: true
}).partial()

export type EditarEscola = z.infer<typeof EditarEscolaSchema>
export type CriarEscola = z.infer<typeof CriarEscolaSchema>
