import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

const EscolaSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z.string("O nome tem que ser uma string.").min(1, "o nome da escola não pode estar vazio.").max(200, "o nome da escola não pode ser maior que 200 caracteres"),
    endereco: z.string("o endereço tem que ser uma string.").min(5, "endereço curto demais").max(255, "o endereço não pode ser maior que 255 caracteres"),
    tel: z.string().regex(/^\d{11}$/, "Telefone deve conter exatamente 11 dígitos numericos"),
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

