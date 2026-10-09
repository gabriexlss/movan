import { z } from "zod"

const CodigoVerificacaoSchema = z.object({
    id: z.number().int().positive(),
    codigohash: z.string(),
    cod: z.string("O código deve ser um texto.").length(6, "O código deve conter exatamente 6 dígitos."),
    tipo: z.string().min(5).max(10),
    data_criacao: z.string().date(),
    data_uso: z.string().date(),
    motorista_id: z.number().int().positive()
})

export const validarCodigoSchema = CodigoVerificacaoSchema.pick({
    cod: true
})
export type validarCodigo = z.infer<typeof validarCodigoSchema>