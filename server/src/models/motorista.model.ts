import { z } from 'zod';
import { validarCodigoSchema } from './codigo_verificacao.js'

// Modelo global pro motorista (usuario)
const MotoristaSchema = z.object({
    id: z.number("Não é um Numero Válido").int().positive(),
    cnpj: z.string("Não é uma String").length(14, "CNPJ Invalido"),
    email: z.string("Não é uma String").min(3, "Email muito curto").max(150, "Email Muito Longo").email("Email Invalido"),
    nome: z.string("Não é uma String").min(3, "Nome muito Curto").max(200, "Nome muito Longo"),
    senha: z.string("Não é uma String").max(100, "Senha muito Longa"),
    verificado: z.boolean("Não é um Booleano"),
    data_exclusao: z.string("Não é uma String").datetime("Não é uma Data Valida").nullish(),
    login: z.string("Não é uma String").min(3, "Credenciais de Login muito curtas").max(255, "Credenciais de Login muito longas")
});
// Modelo referente a autenticação utilizando o google.
const AuthGoogleSchema = z.object({
    token: z.string("Não é uma String").min(1, "Token não pode estar vazio."),
    nome: z.string("Nome Ausente.").min(1, "Nome não pode estar vazio."),
    email: z.string("Email Ausente.").min(1, "Email não pode estar vazio").email("tem que ser um email valido"),
    googleId: z.string("id ausente.").min(1, "id não pode estar vazio."),
    status: z.number("Status ausente."),
    msg: z.string("Mensagem ausente.").min(1, "Mensagem não pode estar vazia."),
    sucesso: z.boolean("Sucesso ausente.")
})
export const CriarMotoristaGoogleSchema = z.object({
    nome: MotoristaSchema.shape.nome,
    cnpj: MotoristaSchema.shape.cnpj,
    senha: MotoristaSchema.shape.senha,
    token: AuthGoogleSchema.shape.token
})
export const GoogleTokenSchema = AuthGoogleSchema.pick({
    token: true
})
// Modelo Referente a Criação do Motorista
export const CriarMotoristaSchema = MotoristaSchema.pick({
    nome: true,
    cnpj: true,
    email: true,
    senha: true,
});
export const LoginMotoristaSchema = MotoristaSchema.pick({
    login: true,
    senha: true
})
export const RecuperarSenhaSchema = z.object({
    email: MotoristaSchema.shape.email,
    cod: validarCodigoSchema.shape.cod,
    senha: MotoristaSchema.shape.senha
})
export const CodigoRecuperarSenhaSchema = MotoristaSchema.pick({
    email: true
})
export const CodigoEditarEmailSchema = MotoristaSchema.pick({
    email: true
})
export const EditarMotoristaSchema = CriarMotoristaSchema.partial().extend({
    cod: validarCodigoSchema.shape.cod.optional()
}).refine((dados) => !dados.email || !!dados.cod, {
    message: "O código é obrigatório para alterar o email.",
    path: ["cod"]
})
export const DeletarMotoristaSchema = MotoristaSchema.pick({
    senha: true
})
export type CriarMotoristaGoogle = z.infer<typeof CriarMotoristaGoogleSchema>
export type GoogleToken = z.infer<typeof GoogleTokenSchema>
export type DeletarMotorista = z.infer<typeof DeletarMotoristaSchema>
export type RecuperarSenha = z.infer<typeof RecuperarSenhaSchema>
export type LoginMotorista = z.infer<typeof LoginMotoristaSchema>
export type CriarMotorista = z.infer<typeof CriarMotoristaSchema>
export type EnviarCodigoRecuperarSenha = z.infer<typeof CodigoRecuperarSenhaSchema>
export type EnviarCodigoEditarEmail = z.infer<typeof CodigoEditarEmailSchema>
export type EditarMotorista = z.infer<typeof EditarMotoristaSchema>
