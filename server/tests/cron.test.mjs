import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

// Os testes usam consultas simuladas; nenhum banco é acessado.
process.env.DATABASE_URL = 'postgresql://cron_test:cron_test@127.0.0.1:1/cron_test'
const { database } = await import('../dist/db/postgre.js')
const { default: router } = await import('../dist/routes/system.route.js')
const { crons } = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
const cron = crons[0]
const segredoCron = 'segredo-cron-exclusivo-teste'
const segredoSistema = 'segredo-sistema-exclusivo-teste'

const executar = async (method, headers = {}, segredo = segredoCron) => {
    if (segredo === null) delete process.env.CRON_SECRET
    else process.env.CRON_SECRET = segredo
    process.env.SEGREDO_SISTEMA = segredoSistema

    const consultas = []
    database.query = async (sql) => {
        consultas.push(sql)
        return { rowCount: 2 }
    }

    const response = await new Promise((resolve, reject) => {
        const res = {
            statusCode: 200,
            headers: {},
            status(statusCode) { this.statusCode = statusCode; return this },
            setHeader(name, value) { this.headers[name] = value; return this },
            json(body) { resolve({ status: this.statusCode, headers: this.headers, body }); return this },
        }
        const req = {
            method,
            url: cron.path.replace(/^\/system/, ''),
            headers,
            get(name) { return this.headers[name.toLowerCase()] },
        }
        router.handle(req, res, (error) => reject(error ?? new Error('Rota de limpeza não encontrada.')))
    })

    return { ...response, consultas }
}

test('o cron está configurado para executar diariamente às 06h UTC', () => {
    assert.equal(crons.length, 1)
    assert.equal(cron.path, '/system/limpeza-usuarios')
    assert.equal(cron.schedule, '0 6 * * *')
})

test('GET sem autenticação não consulta o banco', async () => {
    const result = await executar('GET')
    assert.equal(result.status, 401)
    assert.equal(result.consultas.length, 0)
    assert.equal(result.headers['Cache-Control'], 'no-store')
})

test('GET rejeita Bearer incorreto, mesmo de comprimento igual ao segredo', async () => {
    const result = await executar('GET', { authorization: `Bearer ${'x'.repeat(segredoCron.length)}` })
    assert.equal(result.status, 401)
    assert.equal(result.consultas.length, 0)
})

test('GET rejeita segredo sem o prefixo Bearer e a credencial administrativa', async () => {
    for (const headers of [{ authorization: segredoCron }, { credencial: segredoSistema }]) {
        const result = await executar('GET', headers)
        assert.equal(result.status, 401)
        assert.equal(result.consultas.length, 0)
    }
})

test('CRON_SECRET vazio bloqueia a limpeza', async () => {
    const result = await executar('GET', { authorization: 'Bearer ' }, '')
    assert.equal(result.status, 500)
    assert.equal(result.consultas.length, 0)
})

test('CRON_SECRET ausente bloqueia a limpeza', async () => {
    const result = await executar('GET', { authorization: 'Bearer undefined' }, null)
    assert.equal(result.status, 500)
    assert.equal(result.consultas.length, 0)
})

test('GET autenticado executa a rotina existente e retorna a quantidade removida', async () => {
    const result = await executar('GET', { authorization: `Bearer ${segredoCron}` })
    assert.equal(result.status, 200)
    assert.equal(result.consultas.length, 1)
    assert.match(result.consultas[0], /DELETE FROM motorista/)
    assert.match(result.consultas[0], /excluido_em IS NOT NULL/)
    assert.match(result.consultas[0], /INTERVAL '30 days'/)
    assert.match(result.body.msg, /2 usuários excluídos/)
    assert.equal(result.headers['Cache-Control'], 'no-store')
})

test('HEAD autenticado não executa exclusões', async () => {
    const result = await executar('HEAD', { authorization: `Bearer ${segredoCron}` })
    assert.equal(result.status, 405)
    assert.equal(result.headers.Allow, 'GET')
    assert.equal(result.consultas.length, 0)
})

test('DELETE continua exigindo a credencial administrativa', async () => {
    const negado = await executar('DELETE', { authorization: `Bearer ${segredoCron}` })
    assert.equal(negado.status, 401)
    assert.equal(negado.consultas.length, 0)

    const autorizado = await executar('DELETE', { credencial: segredoSistema })
    assert.equal(autorizado.status, 200)
    assert.equal(autorizado.consultas.length, 1)
})
