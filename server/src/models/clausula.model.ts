import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

// Schema da Clausula do contrato
const ClausulaContratoSchema = z.object({
    id: UtilSchema.shape.id,
    titulo: z
        .string("Título deve ser uma string.")
        .min(1, "Título não pode estar vazio."),
    conteudo: z
        .string("Conteúdo deve ser uma string.")
        .min(1, "Conteúdo não pode estar vazio."),
    ordem: z
        .number("Ordem deve ser um número.")
        .int("Ordem deve ser um número inteiro.")
        .positive("Ordem deve ser positiva."),
    editavel: z.boolean("Editável deve ser um booleano."),
    origem: z.enum(['PADRAO', 'MOTORISTA', 'PERSONALIZADO'], "Origem da cláusula inválida."),
    criado_em: z.iso.datetime("Data de criação deve estar no formato ISO 8601."),
    atualizada_em: z.iso.datetime("Data de atualização deve estar no formato ISO 8601."),
    contrato_id: UtilSchema.shape.id,
    clausula_motorista_id: UtilSchema.shape.id.nullable(),
    clausula_padrao_id: UtilSchema.shape.id.nullable(),
    excluido: z.boolean("Excluído deve ser um booleano.")
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