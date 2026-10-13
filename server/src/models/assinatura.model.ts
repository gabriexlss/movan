import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

export const AssinaturaMotoristaSchema = z.object({
    id: UtilSchema.shape.id,
    caminho_arquivo: z.string(),
    criado_em: z.iso.datetime(),
    atualizado_em: z.iso.datetime(),
    motorista_id: UtilSchema.shape.id
})

export type AssinaturaMotorista = z.infer<typeof AssinaturaMotoristaSchema>