import { z } from 'zod';
import { validarCodigoSchema } from './codigo_verificacao.js'
import { UtilSchema } from './utils.model.js';

// Modelo global pro motorista (usuario)
const MotoristaSchema = z.object({
    id: UtilSchema.shape.id,
    credencial: z.string("NOT_STRING").toUpperCase(), //credencial é ou cnpj ou cpf
    email: z.string("NOT_STRING").min(3, "EMAIL_TOO_SHORT").max(150, "EMAIL_TOO_LONG").email("EMAIL_INVALID"),
    nome: z.string("NOT_STRING").min(3, "NAME_TOO_SHORT").max(200, "NAME_TOO_LONG"),
    senha: z.string("NOT_STRING")
        .max(100, "PASSWORD_TOO_LONG")
        .min(8, "PASSWORD_TOO_SHORT")
        .regex(/[A-Z]/, "PASSWORD_UPPERCASE_REQUIRED")
        .regex(/[a-z]/, "PASSWORD_LOWERCASE_REQUIRED")
        .regex(/\d/, "PASSWORD_NUMBER_REQUIRED")
        .regex(/[^\w\s]/, "PASSWORD_SPECIAL_REQUIRED"),
    email_verificado: z.boolean("NOT_BOOLEAN"),
    excluido_em: z.string("NOT_STRING").datetime("INVALID_DATE").nullish(),
    login: z.string("NOT_STRING").min(3, "LOGIN_TOO_SHORT").max(255, "LOGIN_TOO_LONG")
});
// Modelo referente a autenticação utilizando o google.
const AuthGoogleSchema = z.object({
    token: z.string("NOT_STRING").min(1, "GOOGLE_TOKEN_REQUIRED"),
    nome: z.string("GOOGLE_NAME_REQUIRED").min(1, "GOOGLE_NAME_REQUIRED"),
    email: z.string("GOOGLE_EMAIL_REQUIRED").min(1, "GOOGLE_EMAIL_REQUIRED").email("GOOGLE_EMAIL_INVALID"),
    googleId: z.string("GOOGLE_ID_REQUIRED").min(1, "GOOGLE_ID_REQUIRED"),
    status: z.number("STATUS_REQUIRED"),
    msg: z.string("MESSAGE_REQUIRED").min(1, "MESSAGE_REQUIRED"),
    sucesso: z.boolean("SUCCESS_REQUIRED")
})
export const CriarMotoristaGoogleSchema = z.object({
    nome: MotoristaSchema.shape.nome,
    credencial: MotoristaSchema.shape.credencial,
    senha: MotoristaSchema.shape.senha,
    token: AuthGoogleSchema.shape.token
})
export const GoogleTokenSchema = AuthGoogleSchema.pick({
    token: true
})
// Modelo Referente a Criação do Motorista
export const CriarMotoristaSchema = MotoristaSchema.pick({
    nome: true,
    credencial: true,
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
    cod: validarCodigoSchema.shape.cod.optional(),
    senhaAtual: CriarMotoristaSchema.shape.senha.optional()
}).refine((dados) => !dados.email || !!dados.cod, {
    message: "EMAIL_VERIFICATION_CODE_REQUIRED",
    path: ["cod"]
}).refine((dados) => dados.senha === undefined || !!dados.senhaAtual, {
    message: "CURRENT_PASSWORD_REQUIRED",
    path: ["confirmarSenha"]
})
export const DeletarMotoristaSchema = MotoristaSchema.pick({
    senha: true
})
export const compararSenhaSchema = MotoristaSchema.pick({
    senha: true
})
export type Motorista = z.infer<typeof MotoristaSchema>
export type compararSenha = z.infer<typeof compararSenhaSchema>
export type CriarMotoristaGoogle = z.infer<typeof CriarMotoristaGoogleSchema>
export type GoogleToken = z.infer<typeof GoogleTokenSchema>
export type DeletarMotorista = z.infer<typeof DeletarMotoristaSchema>
export type RecuperarSenha = z.infer<typeof RecuperarSenhaSchema>
export type LoginMotorista = z.infer<typeof LoginMotoristaSchema>
export type CriarMotorista = z.infer<typeof CriarMotoristaSchema>
export type EnviarCodigoRecuperarSenha = z.infer<typeof CodigoRecuperarSenhaSchema>
export type EnviarCodigoEditarEmail = z.infer<typeof CodigoEditarEmailSchema>
export type EditarMotorista = z.infer<typeof EditarMotoristaSchema>
