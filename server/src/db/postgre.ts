import { Pool } from "pg"

export const database = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'meu_banco_de_dados',
    user: 'meu_usuario',
    password: 'minha_senha_super_segura',
    max: 20, // Número máximo de conexões que o pool pode abrir ao mesmo tempo
    idleTimeoutMillis: 30000, // Fecha conexões inativas após 30 segundos
    connectionTimeoutMillis: 2000 // Limite de 2 segundos para conseguir uma conexão
})