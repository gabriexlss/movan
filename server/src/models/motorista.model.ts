import { z } from 'zod';
import { validarCodigoSchema } from './codigo_verificacao.js'
import { UtilSchema } from './utils.model.js';

// Modelo global pro motorista (usuario)
const MotoristaSchema = z.object({
    id: UtilSchema.shape.id,
    credencial: z.string("O valor deve ser um texto.").toUpperCase(), //credencial é ou cnpj ou cpf
    email: z.string("O valor deve ser um texto.").min(3, "E-mail muito curto.").max(150, "E-mail muito longo.").email("E-mail inválido."),
    nome: z.string("O valor deve ser um texto.").min(3, "Nome muito curto.").max(200, "Nome muito longo."),
    senha: z.string("O valor deve ser um texto.")
        .max(100, "Senha muito longa.")
        .min(8, "A senha deve ter pelo menos 8 caracteres.")
        .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
        .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
        .regex(/\d/, "A senha deve conter um número.")
        .regex(/[^\w\s]/, "A senha deve conter um caractere especial."),
    email_verificado: z.boolean("O valor deve ser um booleano."),
    excluido_em: z.string("O valor deve ser um texto.").datetime("Data inválida.").nullish(),
    login: z.string("O valor deve ser um texto.").min(3, "Credenciais de login muito curtas.").max(255, "Credenciais de login muito longas.")
});
// Modelo referente a autenticação utilizando o google.
const AuthGoogleSchema = z.object({
    token: z.string("O valor deve ser um texto.").min(1, "Token não pode estar vazio."),
    nome: z.string("Nome ausente.").min(1, "Nome não pode estar vazio."),
    email: z.string("E-mail ausente.").min(1, "O e-mail não pode estar vazio.").email("Informe um e-mail válido."),
    googleId: z.string("ID ausente.").min(1, "O ID não pode estar vazio."),
    status: z.number("Status ausente."),
    msg: z.string("Mensagem ausente.").min(1, "Mensagem não pode estar vazia."),
    sucesso: z.boolean("Sucesso ausente.")
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
    message: "O código é obrigatório para alterar o e-mail.",
    path: ["cod"]
}).refine((dados) => dados.senha === undefined || !!dados.senhaAtual, {
    message: "A confirmação da senha é obrigatória para alterar a senha.",
    path: ["confirmarSenha"]
})
export const DeletarMotoristaSchema = MotoristaSchema.pick({
    senha: true
})
export const compararSenhaSchema = MotoristaSchema.pick({
    senha: true
})
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
