import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

// Schema da regra financeira recorrente
export const RegraFinanceiraSchema = z.object({
    id: UtilSchema.shape.id,
    titulo: z
        .string("Título deve ser uma string.")
        .trim()
        .min(1, "Título não pode estar vazio.")
        .max(100, "Título deve ter no máximo 100 caracteres."),
    descricao: z
        .string("Descrição deve ser uma string.")
        .trim()
        .min(1, "Descrição não pode estar vazia.")
        .optional(),
    tipo: z.enum(['ENTRADA', 'SAIDA'], "Tipo de lançamento inválido."),
    valor: z.coerce
        .number("Valor deve ser um número.")
        .nonnegative("Valor não pode ser negativo.")
        .multipleOf(0.01, "Valor deve ter no máximo duas casas decimais."),
    frequencia: z.enum(['SEMANAL', 'MENSAL'], "Frequência financeira inválida."),
    dia_semana: z.coerce
        .number("Dia da semana deve ser um número.")
        .int("Dia da semana deve ser um número inteiro.")
        .positive("Dia da semana deve ser positivo.")
        .max(7, "Dia da semana deve ser no máximo 7.")
        .optional(),
    dia_mes: z.coerce
        .number("Dia do mês deve ser um número.")
        .int("Dia do mês deve ser um número inteiro.")
        .positive("Dia do mês deve ser positivo.")
        .max(31, "Dia do mês deve ser no máximo 31.")
        .optional(),
    inicio_em: z.iso.date("Data de início deve estar no formato YYYY-MM-DD."),
    fim_em: z.iso.date("Data de fim deve estar no formato YYYY-MM-DD.").optional(),
    ativa: z.boolean("Ativa deve ser um booleano."),
    motorista_id: UtilSchema.shape.id
})

export type RegraFinanceira = z.infer<typeof RegraFinanceiraSchema>
