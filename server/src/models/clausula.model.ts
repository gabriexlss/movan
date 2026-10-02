import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema da Clausula do contrato
const ClausulaContratoSchema = z.object({
    id: UtilSchema.shape.id,
    titulo: z.string(),
    conteudo: z.string(),
    ordem: z.number().int().positive(),
    editavel: z.boolean(),
    origem: z.enum(['PADRAO', 'MOTORISTA', 'PERSONALIZADO']),
    criado_em: z.iso.datetime(),
    atualizada_em: z.iso.datetime(),
    contrato_id: UtilSchema.shape.id,
    clausula_motorista_id: UtilSchema.shape.id.nullable(),
    clausula_padrao_id: UtilSchema.shape.id.nullable(),
    excluido: z.boolean
})
// Inserir Clausula definitiva na tabela 
export const InserirClausulaPadraoSchema = ClausulaContratoSchema.pick({
    titulo: true,
    conteudo: true,
    ordem: true,
    editavel: true,
    origem: true,
    contrato_id: true,
    clausula_padrao_id: true,
    clausula_motorista_id: true,
})
// schema da clausula padrão
export const ClausulaPadraoSchema = ClausulaContratoSchema.pick({
    id: true,
    titulo: true,
    conteudo: true,
    ordem: true,
    criado_em: true,
    atualizada_em: true,
    excluido: true
})
//Clausula Motorista Schema
export const ClausulaMotoristaSchema = ClausulaContratoSchema.pick({
    id: true,
    titulo: true,
    conteudo: true,
    ordem: true,
    criado_em: true,
    atualizada_em: true,
    excluido: true
}).extend({
    motorista_id: UtilSchema.shape.id
})
// Criar Clausula motorista
export const CriarClausulaSchema = ClausulaMotoristaSchema.pick({
    titulo: true,
    conteudo: true,
})
export const EditarClausulaSchema = ClausulaMotoristaSchema.pick({
    titulo: true,
    conteudo: true
}).partial()

export type Clausula = z.infer<typeof ClausulaContratoSchema>
export type ClausulaPadrao = z.infer<typeof ClausulaPadraoSchema>
export type ClausulaMotorista = z.infer<typeof ClausulaMotoristaSchema>
export type InserirClausulaContrato = z.infer<typeof InserirClausulaPadraoSchema>

export type CriarClausula = z.infer<typeof CriarClausulaSchema>
export type EditarClausula = z.infer<typeof EditarClausulaSchema>