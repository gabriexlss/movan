import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

export const ContratoDocumentoSchema = z.object({
    id: UtilSchema.shape.id,
    hash_documento: z.string().max(255),
    caminho_arquivo: z.string(),
    gerado_em: z.iso.datetime(),
    contrato_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    status_documento: z.enum(['ENVIADO', 'ASSINADO', 'SUBSTITUIDO'])
})

export type ContratoDocumento = z.infer<typeof ContratoDocumentoSchema>
