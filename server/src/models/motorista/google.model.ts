import { z } from 'zod';
import { MotoristaSchema } from './motorista.model.js';

// Modelo referente a autenticação utilizando o google.
export const AuthGoogleSchema = z.object({
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
export type CriarMotoristaGoogle = z.infer<typeof CriarMotoristaGoogleSchema>
export type GoogleToken = z.infer<typeof GoogleTokenSchema>
