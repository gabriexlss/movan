import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

export const AssinaturaMotoristaSchema = z.object({
    id: UtilSchema.shape.id,
    caminho_arquivo: z.string(),
    criado_em: z.iso.datetime(),
    atualizado_em: z.iso.datetime(),
    motorista_id: UtilSchema.shape.id
})
export interface LinkAssinatura {
    id: number;
    token_hash: string;
    expira_em: Date;
    utilizado_em: Date | null;
    revogado_em: Date | null;
    criado_em: Date;
    agente_usuario: string | null;
    endereco_ip: string | null;
    contrato_documento_id: number;
    responsavel_id: number;
}
export type AssinaturaMotorista = z.infer<typeof AssinaturaMotoristaSchema>