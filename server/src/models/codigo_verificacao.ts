import { z } from "zod"

export const CodigoVerificacaoSchema = z.object({
    id: z.number().int().positive(),
    codigohash: z.string(),
    codigo: z.string().length(6),
    tipo: z.string().min(5).max(10),
    data_criacao: z.string().date(),
    data_uso: z.string().date(),
    motorista_id: z.number().int().positive()
})
