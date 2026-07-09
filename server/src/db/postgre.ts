import { Pool } from "pg"

const databaseUrl = process.env['DATABASE_URL']

if (!databaseUrl) {
    throw new Error('DATABASE_URL nao configurada no ambiente')
}

export const database = new Pool({
    connectionString: databaseUrl,
    max: 20, // Número máximo de conexões que o pool pode abrir ao mesmo tempo
    idleTimeoutMillis: 30000, // Fecha conexões inativas após 30 segundos
    connectionTimeoutMillis: 2000, // Limite de 2 segundos para conseguir uma conexão
})