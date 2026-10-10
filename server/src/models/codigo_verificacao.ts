import { z } from "zod"

const CodigoVerificacaoSchema = z.object({
    id: z.number().int().positive(),
    codigohash: z.string(),
    cod: z.string("VERIFICATION_CODE_NOT_STRING").length(6, "VERIFICATION_CODE_INVALID_LENGTH"),
    tipo: z.string().min(5).max(10),
    data_criacao: z.string().date(),
    data_uso: z.string().date(),
    motorista_id: z.number().int().positive()
})

export const validarCodigoSchema = CodigoVerificacaoSchema.pick({
    cod: true
})
export type validarCodigo = z.infer<typeof validarCodigoSchema>
