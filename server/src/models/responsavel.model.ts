import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

const ResponsavelSchema = z.object({
    id: UtilSchema.shape.id,
    cpf: z
        .string("CPF deve ser uma string.")
        .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos."),
    nome: z
        .string("Nome deve ser uma string.")
        .min(5, "Nome deve ter pelo menos 5 caracteres.")
        .max(200, "Nome deve ter no máximo 200 caracteres."),
    endereco: z
        .string("Endereço deve ser uma string.")
        .min(10, "Endereço deve ter pelo menos 10 caracteres.")
        .max(255, "Endereço deve ter no máximo 255 caracteres."),
    tel: z
        .string("Telefone deve ser uma string.")
        .regex(/^\d{11}$/, "Telefone deve conter exatamente 11 dígitos."),
    email: z
        .string("E-mail deve ser uma string.")
        .min(5, "E-mail deve ter pelo menos 5 caracteres.")
        .max(150, "E-mail deve ter no máximo 150 caracteres.")
        .email("E-mail inválido."),
    motorista_id: UtilSchema.shape.id
})
export const CriarResponsavelSchema = ResponsavelSchema.pick({
    cpf: true,
    nome: true,
    endereco: true,
    tel: true,
    email: true
})
export const EditarResponsavelSchema = ResponsavelSchema.pick({
    nome: true,
    endereco: true,
    tel: true,
    email: true
}).partial()

export type EditarResponsavel = z.infer<typeof EditarResponsavelSchema>
export type Responsavel = z.infer<typeof ResponsavelSchema>
export type criarResponsavel = z.infer<typeof CriarResponsavelSchema>
