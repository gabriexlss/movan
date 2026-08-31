import { z } from "zod";
import { UtilSchema } from "./utils.model.js";


const ResponsavelSchema = z.object({
    id: UtilSchema.shape.id,
    cpf: z.string("cpf tem que ser um string").regex(/^\d{11}$/, "CPF deve conter exatamente 11 numericos"),
    nome: z.string("nome tem que ser um string").min(5, "nome completo tem que ter no minimo 5 caracteres").max(200, "nome completo tem que ter no maximo 200 caracteres"),
    endereco: z.string("endereço tem que ser um string").min(10, "endereço tem que ter no minimo 10 caracteres").max(255, "endereço tem que ter no maximo 255 caracteres"),
    tel: z.string("telefone tem que ser um string").regex(/^\d{11}$/, "Telefone deve conter exatamente 11 dígitos numericos"),
    email: z.string("email tem que ser um string").min(5, "email tem que ter no minimo 5 caracteres").max(150, "email tem que ter no maximo 150 caracteres").email("Tem que ser um email valido"),
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