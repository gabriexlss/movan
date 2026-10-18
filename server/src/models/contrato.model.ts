import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema do contrato
const ContratoSchema = z.object({
    id: UtilSchema.shape.id,
    data_inicio: z.iso.date("Data de início deve estar no formato YYYY-MM-DD."),
    data_fim: z.iso.date("Data de fim deve estar no formato YYYY-MM-DD."),
    dia_vencimento: z.coerce
        .number("Dia de vencimento deve ser um número.")
        .int("Dia de vencimento deve ser um número inteiro.")
        .positive("Dia de vencimento deve ser positivo.")
        .max(31, "Dia de vencimento deve ser no máximo 31."),
    valor_mensal: z.coerce
        .number("Valor mensal deve ser um número.")
        .nonnegative("Valor mensal não pode ser negativo.")
        .multipleOf(0.01, "Valor mensal deve ter no máximo duas casas decimais."),
    status: z.enum(['RASCUNHO', 'AGUARDANDO_ASSINATURA', 'ATIVO', 'FINALIZADO', 'CANCELADO'], "Status do contrato inválido."),
    criado_em: z.iso.datetime("Data de criação deve estar no formato ISO 8601."),
    cancelado_em: z.iso.datetime("Data de cancelamento deve estar no formato ISO 8601."),
    motivo_cancelamento: z.string("Motivo de cancelamento deve ser uma string."),
    aluno_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id,
    atualizado_em: z.iso.datetime("Data de atualização deve estar no formato ISO 8601.")
})
// Criar Contrato
export const CriarContratoSchema = ContratoSchema.pick({
    data_inicio: true,
    data_fim: true,
    dia_vencimento: true,
    valor_mensal: true,
    aluno_id: true
})
// Editar Contrato
export const EditarContratoSchema = CriarContratoSchema.omit({
    aluno_id: true
}).partial()

export const ContratoDocumentoSchema = z.object({
    id: UtilSchema.shape.id,
    hash_documento: z.string().max(255),
    caminho_arquivo: z.string(),
    gerado_em: z.iso.datetime(),
    contrato_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    status_documento: z.enum(['ENVIADO', 'ASSINADO', 'SUBSTITUIDO'])
})
// tipos
export type Contrato = z.infer<typeof ContratoSchema>
export type CriarContrato = z.infer<typeof CriarContratoSchema>
export type EditarContrato = z.infer<typeof EditarContratoSchema>
export type ContratoDocumento = z.infer<typeof ContratoDocumentoSchema>

// view detalhes contrato
export type ContratoStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'CANCELADO';

export interface ContratoView {
    contrato_id: number;
    status: ContratoStatus;
    data_inicio: Date;
    data_fim: Date;
    dia_vencimento: number;
    valor_mensal: number;
    aluno_id: number;
    nome_aluno: string;
    escola_id: number;
    nome_escola: string;
    responsavel_id: number;
    nome_responsavel: string;
    cpf_responsavel: string;
    motorista_id: number;
    endereco_aluno: string;
    endereco_escola: string;
}