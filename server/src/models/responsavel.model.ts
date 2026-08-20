import { z } from "zod";


const ResponsavelSchema = z.object({
    id: z.number("id tem que ser um número").positive("id tem que ser um numero positivo"),
    cpf: z.string("cpf tem que ser um string").length(11, "cpf tem que ter exatamente 11 caracteres"),
    nome: z.string("nome tem que ser um string").min(5, "nome completo tem que ter no minimo 5 caracteres").max(200, "nome completo tem que ter no maximo 200 caracteres"),
    endereco: z.string("endereço tem que ser um string").min(10, "endereço tem que ter no minimo 10 caracteres").max(255, "endereço tem que ter no maximo 255 caracteres"),
    tel: z.string("telefone tem que ser um string").length(11, "telefone tem que ter 11 caracteres"),
    email: z.string("email tem que ser um string").min(11, "email tem que ter no minimo 11 caracteres").max(150, "email tem que ter no maximo 150 caracteres"),
    motorista_id: z.number("id tem que ser um numero").positive("id tem que ser um numero positivo")
})
export const CriarResponsavelSchema = ResponsavelSchema.pick({
    cpf: true,
    nome: true,
    endereco: true,
    tel: true,
    email: true
})
export const EditarResponsavelSchema = ResponsavelSchema.pick({
    id: true,
    cpf: true,
    nome: true,
    endereco: true,
    tel: true,
    email: true
}).partial()
export type EditarResponsavel = z.infer<typeof EditarResponsavelSchema>
export type Responsavel = z.infer<typeof ResponsavelSchema>
export type criarResponsavel = z.infer<typeof CriarResponsavelSchema>