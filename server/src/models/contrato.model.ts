import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema do contrato
const ContratoSchema = z.object({
    id: UtilSchema.shape.id,
    data_inicio: z.iso.date(),
    data_fim: z.iso.date(),
    dia_vencimento: z.coerce.number().int().positive().max(32),
    valor_mensal: z.coerce.number().nonnegative().multipleOf(0.01),
    status: z.enum(['RASCUNHO', 'AGUARDANDO_ASSINATURA', 'ATIVO', 'FINALIZADO', 'CANCELADO']),
    criado_em: z.iso.datetime(),
    cancelado_em: z.iso.datetime(),
    motivo_cancelamento: z.string(),
    aluno_id: UtilSchema.shape.id,
    responsavel_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id,
    atualizado_em: z.iso.datetime()
})
// Schema da Clausula do contrato
const ClausulaContratoSchema = z.object({
    id: UtilSchema.shape.id,
    titulo: z.string(),
    conteudo: z.string(),
    ordem: z.number().int().positive(),
    editavel: z.boolean(),
    origem: z.enum(['PADRAO', 'MOTORISTA']),
    criado_em: z.iso.datetime(),
    atualizada_em: z.iso.datetime(),
    contrato_id: UtilSchema.shape.id,
    clausula_motorista_id: UtilSchema.shape.id,
    clausula_padrao_id: UtilSchema.shape.id
})
// Criar Contrato
export const CriarContratoSchema = ContratoSchema.pick({
    data_inicio: true,
    data_fim: true,
    dia_vencimento: true,
    valor_mensal: true,
    aluno_id: true
})
// Criar Clausula
export const CriarClausulaSchema = ClausulaContratoSchema.pick({
    titulo: true,
    conteudo: true,
    ordem: true,
    editavel: true,
    origem: true,
    contrato_id: true,
    clausula_motorista_id: true
})
// Criar Clausula
export const CriarClausulaPadraoSchema = ClausulaContratoSchema.pick({
    titulo: true,
    conteudo: true,
    ordem: true,
    editavel: true,
    origem: true,
    contrato_id: true,
    clausula_padrao_id: true
})
// schema da clausula padrão
const ClausulaPadraoSchema = ClausulaContratoSchema.pick({
    id: true,
    titulo: true,
    conteudo: true,
    ordem: true,
    criado_em: true,
    atualizada_em: true
})

// tipos
export type CriarContrato = z.infer<typeof CriarContratoSchema>
export type ClausulaPadrao = z.infer<typeof ClausulaPadraoSchema>
export type CriarClausula = z.infer<typeof CriarClausulaSchema>
export type CriarClausulaPadrao = z.infer<typeof CriarClausulaPadraoSchema>