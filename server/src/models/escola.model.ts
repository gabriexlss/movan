import { z } from "zod";
import { ParamsSchema, UtilSchema } from "./utils.model.js";

const EscolaSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z.string("O nome tem que ser uma string.").min(1, "o nome da escola não pode estar vazio.").max(200, "o nome da escola não pode ser maior que 200 caracteres"),
    endereco: z.string("o endereço tem que ser uma string.").min(5, "endereço curto demais").max(255, "o endereço não pode ser maior que 255 caracteres"),
    tel: z.string().regex(/^\d{11}$/, "Telefone deve conter exatamente 11 dígitos numericos"),
    hora_abertura: z.iso.time("Tem que ser um hórario válido"),
    hora_fechamento: z.iso.time("Tem que ser um horário válido"),
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude,
    motorista_id: UtilSchema.shape.id
})
export const CriarEscolaSchema = EscolaSchema.omit({
    id: true,
    motorista_id: true
})
export const EditarEscolaSchema = EscolaSchema.omit({
    motorista_id: true
}).partial()
export const DeletarEscolaSchema = z.object({
    id: ParamsSchema.shape.id
})
export const ObterEscolaSchema = DeletarEscolaSchema.partial()

export type ObterEscola = z.infer<typeof ObterEscolaSchema>
export type DeletarEscola = z.infer<typeof DeletarEscolaSchema>
export type EditarEscola = z.infer<typeof EditarEscolaSchema>
export type CriarEscola = z.infer<typeof CriarEscolaSchema>

