import { z } from "zod"

export const UtilSchema = z.object({
    latitude: z
        .number()
        .min(-90, "Latitude mínima da terra é -90")
        .max(90, "Latitude máxima da terra é 90"),

    longitude: z
        .number()
        .min(-180, "Longitude mínima da terra é -180")
        .max(180, "Longitude máxima da terra é 180"),

    id: z.number("id tem que ser um número").int("id tem que ser um número inteiro").positive("id tem que ser um numero positivo")
});