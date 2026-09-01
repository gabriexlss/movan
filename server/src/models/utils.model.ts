import { z } from "zod"

export const UtilSchema = z.object({
    latitude: z
        .number("Latitude deve ser um número.")
        .min(-90, "Latitude deve ser maior ou igual a -90.")
        .max(90, "Latitude deve ser menor ou igual a 90."),

    longitude: z
        .number("Longitude deve ser um número.")
        .min(-180, "Longitude deve ser maior ou igual a -180.")
        .max(180, "Longitude deve ser menor ou igual a 180."),

    id: z
        .number("ID deve ser um número.")
        .int("ID deve ser um número inteiro.")
        .positive("ID deve ser positivo.")
});
export const ParamsSchema = z.object({
    id: z.coerce
        .number("ID deve ser um número.")
        .int("ID deve ser um número inteiro.")
        .positive("ID deve ser positivo.")
})
