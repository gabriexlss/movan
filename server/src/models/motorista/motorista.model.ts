import { z } from 'zod';
import { validarCodigoSchema } from '../codigo_verificacao.js'
import { UtilSchema } from '../utils.model.js';

// Modelo global pro motorista (usuario)
export const MotoristaSchema = z.object({
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
    login: z.string("NOT_STRING").min(3, "LOGIN_TOO_SHORT").max(255, "LOGIN_TOO_LONG"),
    capacidade_van: z.coerce
        .number("NOT_NUMBER")
        .int("VAN_CAPACITY_INVALID")
        .positive("VAN_CAPACITY_INVALID")
        .max(2147483647, "VAN_CAPACITY_INVALID"),
    endereco: z
        .string("NOT_STRING")
        .trim()
        .min(5, "Endereço deve ter pelo menos 5 caracteres.")
        .max(500, "ADDRESS_TOO_LONG")
        .nullish(),
    latitude: UtilSchema.shape.latitude.nullish(),
    longitude: UtilSchema.shape.longitude.nullish()
});
export const CriarMotoristaSchema = MotoristaSchema.pick({
    nome: true,
    credencial: true,
    email: true,
    senha: true,
    capacidade_van: true,
    endereco: true,
    latitude: true,
    longitude: true,
}).required({ capacidade_van: true, endereco: true, latitude: true, longitude: true });
export const LoginMotoristaSchema = MotoristaSchema.pick({
    login: true,
    senha: true
})
export const EditarMotoristaSchema = CriarMotoristaSchema.partial().extend({
    endereco: MotoristaSchema.shape.endereco.optional(),
    capacidade_van: MotoristaSchema.shape.capacidade_van.optional(),
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
// schema pra editar o endereço e as coordenadas iniciais do motorista
export const EditarEnderecoMotoristaSchema = z.object({
    endereco: z
        .string("NOT_STRING")
        .trim()
        .min(5, "Endereço deve ter pelo menos 5 caracteres.")
        .max(500, "ADDRESS_TOO_LONG"),
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude
})
// schema pra editar a capacidade da van do motorista
export const EditarCapacidadeVanSchema = MotoristaSchema.pick({
    capacidade_van: true
})
export type Motorista = z.infer<typeof MotoristaSchema>
export type compararSenha = z.infer<typeof compararSenhaSchema>
export type DeletarMotorista = z.infer<typeof DeletarMotoristaSchema>
export type LoginMotorista = z.infer<typeof LoginMotoristaSchema>
export type CriarMotorista = z.infer<typeof CriarMotoristaSchema>
export type EditarMotorista = z.infer<typeof EditarMotoristaSchema>
export type EditarEnderecoMotorista = z.infer<typeof EditarEnderecoMotoristaSchema>
export type EditarCapacidadeVan = z.infer<typeof EditarCapacidadeVanSchema>
