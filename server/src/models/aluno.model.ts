import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

const AlunoSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z
        .string("Nome deve ser uma string.")
        .min(3, "Nome deve ter pelo menos 3 caracteres.")
        .max(200, "Nome deve ter no máximo 200 caracteres."),
    data_nasc: z.iso.date("Data de nascimento deve estar no formato YYYY-MM-DD."),
    ano_escolar: z
        .string("Ano escolar deve ser uma string.")
        .min(1, "Ano escolar não pode estar vazio.")
        .max(5, "Ano escolar deve ter no máximo 5 caracteres."),
    observacao: z
        .string("Observação deve ser uma string.")
        .max(255, "Observação deve ter no máximo 255 caracteres.")
        .optional(),
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude,
    turno: z
        .string("Turno deve ser uma string.")
        .min(1, "Turno não pode estar vazio.")
        .max(5, "Turno deve ter no máximo 5 caracteres."),
    responsavel_id: UtilSchema.shape.id,
    escola_id: UtilSchema.shape.id,
    motorista_id: UtilSchema.shape.id
})
export const CriarAlunoSchema = AlunoSchema.omit({
    id: true,
    motorista_id: true
})
export const EditarAlunoSchema = AlunoSchema.omit({
    id: true,
    responsavel_id: true,
    motorista_id: true
}).partial()

export type CriarAluno = z.infer<typeof CriarAlunoSchema>
