import { z } from "zod";
import { UtilSchema } from "../utils.model.js";

// Schema do turno da escola
const EscolaTurnoSchema = z.object({
    id: UtilSchema.shape.id,
    turno: z.enum(
        ["INTEGRAL", "MANHA", "TARDE", "NOITE", "INTEGRAL-MANHA", "INTEGRAL-TARDE"],
        "Turno inválido."
    ),
    hora_entrada: z.iso.time("Hora de entrada deve estar no formato HH:MM ou HH:MM:SS."),
    hora_saida: z.iso.time("Hora de saída deve estar no formato HH:MM ou HH:MM:SS."),
    escola_id: UtilSchema.shape.id
})

// Mesma regra da constraint ck_escola_turno_horario do banco.
const horarioValido = (dados: { hora_entrada?: string | undefined, hora_saida?: string | undefined }) =>
    !dados.hora_entrada || !dados.hora_saida || dados.hora_saida > dados.hora_entrada

const mensagemHorario = {
    message: "Hora de saída deve ser maior que a hora de entrada.",
    path: ["hora_saida"]
}

export const CriarEscolaTurnoSchema = EscolaTurnoSchema.omit({
    id: true
}).refine(horarioValido, mensagemHorario)

export const EditarEscolaTurnoSchema = EscolaTurnoSchema.omit({
    id: true,
    escola_id: true
}).partial().refine(horarioValido, mensagemHorario)

// Filtro opcional na listagem de turnos.
export const ObterEscolaTurnoQuerySchema = z.object({
    escola_id: z.coerce
        .number("ID da escola deve ser um número.")
        .int("ID da escola deve ser um número inteiro.")
        .positive("ID da escola deve ser positivo.")
        .optional()
})

export type EscolaTurno = z.infer<typeof EscolaTurnoSchema>
export type CriarEscolaTurno = z.infer<typeof CriarEscolaTurnoSchema>
export type EditarEscolaTurno = z.infer<typeof EditarEscolaTurnoSchema>
