import { z } from 'zod';
import { validarCodigoSchema } from '../codigo_verificacao.js';
import { MotoristaSchema } from './motorista.model.js';

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
export type RecuperarSenha = z.infer<typeof RecuperarSenhaSchema>
export type EnviarCodigoRecuperarSenha = z.infer<typeof CodigoRecuperarSenhaSchema>
export type EnviarCodigoEditarEmail = z.infer<typeof CodigoEditarEmailSchema>
