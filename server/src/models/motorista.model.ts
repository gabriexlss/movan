import { z } from 'zod';

// Modelo global pro motorista (usuario)
export const MotoristaSchema = z.object({
    id: z.number("Não é um Numero Válido").int().positive(),
    cnpj: z.string("Não é uma String").length(14, "CNPJ Invalido"),
    email: z.string("Não é uma String").min(3, "Email muito curto").max(255, "Email Muito Longo").email("Email Invalido"),
    nome: z.string("Não é uma String").min(3, "Nome muito Curto").max(50, "Nome muito Longo"),
    senha: z.string("Não é uma String"),
    verificado: z.boolean("Não é um Booleano"),
    data_exclusao: z.string("Não é uma String").datetime("Não é uma Data Valida").nullish()
});
// Modelo Referente a Criação do Motorista
export const CriarMotoristaSchema = MotoristaSchema.pick({
    nome: true,
    cnpj: true,
    email: true,
    senha: true
});
export type CriarMotorista = z.infer<typeof CriarMotoristaSchema>