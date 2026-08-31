import { z } from "zod";
import { UtilSchema } from "./utils.model.js";

const AlunoSchema = z.object({
    id: UtilSchema.shape.id,
    nome: z.string().min(3).max(200),
    data_nasc: z.iso.date(),
    ano_escolar: z.string().min(1).max(5),
    observacao: z.string().max(255).optional(),
    latitude: UtilSchema.shape.latitude,
    longitude: UtilSchema.shape.longitude,
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
})

export type CriarAluno = z.infer<typeof CriarAlunoSchema>