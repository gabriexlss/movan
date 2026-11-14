import { z } from "zod";
import { ParamsSchema, UtilSchema } from "../utils.model.js";

// Schema do lançamento financeiro
export const FinanceiroSchema = z.object({
    id: UtilSchema.shape.id,
    titulo: z
        .string("Título deve ser uma string.")
        .trim()
        .min(1, "Título não pode estar vazio.")
        .max(100, "Título deve ter no máximo 100 caracteres."),
    valor: z.coerce
        .number("Valor deve ser um número.")
        .nonnegative("Valor não pode ser negativo.")
        .multipleOf(0.01, "Valor deve ter no máximo duas casas decimais."),
    descricao: z
        .string("Descrição deve ser uma string.")
        .trim()
        .min(1, "Descrição não pode estar vazia.")
        .optional(),
    tipo: z.enum(['ENTRADA', 'SAIDA'], "Tipo de lançamento inválido."),
    data_lancamento: z.iso.date("Data de lançamento deve estar no formato YYYY-MM-DD.").optional(),
    data_referencia: z.iso.date("Data de referência deve estar no formato YYYY-MM-DD.").optional(),
    origem: z.enum(['MANUAL', 'MENSALIDADE', 'RECORRENTE', 'ESTORNO', 'AJUSTE'], "Origem financeira inválida."),
    criado_em: z.iso.datetime("Data de criação deve estar no formato ISO 8601."),
    motorista_id: UtilSchema.shape.id,
    mensalidade_id: UtilSchema.shape.id.optional(),
    regra_financeira_id: UtilSchema.shape.id.optional(),
    lancamento_origem_id: UtilSchema.shape.id.optional()
})

export const AdicionarFinanceiroSchema = FinanceiroSchema.pick({
    titulo: true,
    valor: true,
    descricao: true,
    tipo: true,
    data_lancamento: true
})

export const EditarFinanceiroSchema = AdicionarFinanceiroSchema.partial()

export const QuerysObterFinanceiroSchema = z.object({
    mes: z.stringFormat("mm-yyyy", /^(0[1-9]|1[0-2])\/\d{4}$/, { error: "Data inválida. Use o formato MM/YYYY." }),
    id: ParamsSchema.shape.id
}).partial()


export type Financeiro = z.infer<typeof FinanceiroSchema>
