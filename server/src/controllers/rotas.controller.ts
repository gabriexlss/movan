import { Request, Response } from "express";
import { database } from "../db/postgre.js";
import { CriarRota, FiltrosRotaSchema, Rota } from "../models/rotas/rota.js";
import { PoolClient } from "pg";
import { Aluno } from "../models/aluno.model.js";
import { Escola } from "../models/escola/escola.model.js";
import { AdicionarPontoRotaSchema, MoverPontosRotaSchema, PontoRota, PontoRotaParamsSchema } from "../models/rotas/pontoRota.js";
import { EscolaTurno } from "../models/escola/turno.model.js";
import { otimizarRota } from "../services/otimizarRota.js";
import { ParamsSchema } from "../models/utils.model.js";
import { gerarPolylineRota } from "../services/gerarPolyline.js";

const recompactarOrdemPontos = async (cliente: PoolClient, rotaID: number, motoristaID: number): Promise<void> => {
    const { rows: pontosRestantes } = await cliente.query<PontoRota>(
        `
        SELECT id, ordem FROM ponto_rota
        WHERE rota_id = $1 AND motorista_id = $2
        ORDER BY ordem ASC, id ASC
        `,
        [rotaID, motoristaID]
    )

    if (pontosRestantes.length === 0) return

    const maiorOrdem = pontosRestantes.reduce((maior, ponto) => Math.max(maior, ponto.ordem), 0)

    for (let i = 0; i < pontosRestantes.length; i++) {
        await cliente.query(
            `UPDATE ponto_rota SET ordem = $1 WHERE id = $2 AND rota_id = $3 AND motorista_id = $4`,
            [maiorOrdem + i + 1, pontosRestantes[i]!.id, rotaID, motoristaID]
        )
    }

    for (let i = 0; i < pontosRestantes.length; i++) {
        await cliente.query(
            `UPDATE ponto_rota SET ordem = $1 WHERE id = $2 AND rota_id = $3 AND motorista_id = $4`,
            [i + 1, pontosRestantes[i]!.id, rotaID, motoristaID]
        )
    }
}

export const controllerRotas = {
    // gera todas as rotas assim que o motorista é criado
    gerarRotas: async (motoristaID: number): Promise<void> => {

        // iniciando conexão ao banco de dados.
        const cliente = await database.connect().catch(() => {
            throw new Error("Erro ao conectar ao banco de dados.")
        })

        // iniciando array com as rotas que vão ser criadas em CADA DIA DA SEMANA.
        const Rotas: CriarRota[] = []

        // for demoniaco que fiz enquanto tava alucinando pra montar um array sem ficar repetindo codigo, sei la, ta funcionando então nao mexe
        for (let i = 1; i <= 6; i++) {
            const resto = i % 2
            Rotas.push(
                {
                    nome: undefined,
                    sentido: resto === 0 ? "VOLTA" : "IDA",
                    ativa: true,
                    motorista_id: motoristaID,
                    turno: i <= 2 ? "MANHA" : i <= 4 ? "TARDE" : "NOITE"
                }
            )
        }

        const RotasCriadas: Rota[] = []
        try {
            // iniciando transação
            await cliente.query('BEGIN')

            // fazendo varias querys pra inserir todas as rotas pra cada dia da semana, ou seja, 5x6. ja que cada dia da semana tem 6 rotas diferentes
            for (let i = 1; i <= 5; i++) {
                // for dentro do for kkkkkkkkkkkkk, me julguem mas nao pensei numa solução melhor
                // insere os dados do array das rotas criadas na tabela de rotas
                for (const Rota of Rotas) {
                    const RotaCriada = await cliente.query<Rota>(
                        `
                        INSERT INTO rota
                        (nome, sentido, ativa, motorista_id, turno)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                        `,
                        [Rota.nome, Rota.sentido, Rota.ativa, Rota.motorista_id, Rota.turno]
                    )
                    RotasCriadas.push(RotaCriada.rows[0]!)
                }
            }

            // inserindo agr no dia da semana as rotas.
            let i = 1
            for (const Rota of RotasCriadas) {
                // PERDAO PRA QUEM TENTAR ENTENDER ISSO, mas resumindo, vai definir com base no valor de i, se é segunda, terça, quarta, quinta ou sexta.
                const diaSemana = i > 0 && i <= 6 ? 2 : i > 6 && i <= 12 ? 3 : i > 12 && i <= 18 ? 4 : i > 18 && i <= 24 ? 5 : 6
                await cliente.query(
                    `
                    INSERT INTO rota_dia_semana
                    (rota_id, dia_semana)
                    VALUES ($1, $2)
                    `,
                    [Rota.id, diaSemana]
                )
                i++
            }
            // se chegar tudo corretamente, retorna
            await cliente.query('COMMIT')
            return
        } catch (erro) {
            await cliente.query('ROLLBACK')
            throw new Error(`Erro ao criar registros das rotas durante criação do motorista`, { cause: erro })
        } finally {
            cliente.release()
        }
    },
    // controller para adicionar um aluno (e a escola se ainda não tiver sido adicionada) a rota
    adicionarAluno: async (alunoID: number, cliente: PoolClient, req: Request) => {
        // pegando o id do motorista
        const motoristaID = req.userId

        // iniciando operação
        // pega os dados do aluno por meio do ID e verifica se realmente chegaram.
        const { rows: [aluno] } = await cliente.query<Aluno>(
            `
                SELECT * FROM aluno
                WHERE id = $1
                `,
            [alunoID]
        )
        if (!aluno) throw new Error('ALUNO_NOT_FOUND');

        // pega os dados da escola por meio do ID e verifica se realmente chegaram.
        const { rows: [escola] } = await cliente.query<Escola>(
            `
                SELECT * FROM escola
                WHERE id = $1
                `,
            [aluno.escola_id]
        )
        if (!escola) throw new Error('ESCOLA_NOT_FOUND');

        // pega os dados do turno da escola por meio do ID e verifica se realmente chegaram.
        const { rows: [turnoEscola] } = await cliente.query<EscolaTurno>(
            `
                SELECT * FROM escola_turno
                WHERE id = $1
                `,
            [aluno.escola_turno_id]
        )
        if (!turnoEscola) throw new Error('TURNO_NOT_FOUND');

        // busca todas as rotas daquele motorista.
        let { rows: todasRotas } = await cliente.query<Rota>(
            `
                SELECT * FROM rota
                WHERE motorista_id = $1
                `,
            [motoristaID]
        )

        // se o motorista ainda não possui rotas geradas, gera sob demanda usando a transação atual
        if (todasRotas.length < 1) {
            const RotasParaCriar: CriarRota[] = []
            for (let i = 1; i <= 6; i++) {
                const resto = i % 2
                RotasParaCriar.push({
                    nome: undefined,
                    sentido: resto === 0 ? "VOLTA" : "IDA",
                    ativa: true,
                    motorista_id: motoristaID,
                    turno: i <= 2 ? "MANHA" : i <= 4 ? "TARDE" : "NOITE"
                })
            }

            const RotasCriadas: Rota[] = []
            for (let i = 1; i <= 5; i++) {
                for (const Rota of RotasParaCriar) {
                    const RotaCriada = await cliente.query<Rota>(
                        `
                        INSERT INTO rota
                        (nome, sentido, ativa, motorista_id, turno)
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                        `,
                        [Rota.nome, Rota.sentido, Rota.ativa, Rota.motorista_id, Rota.turno]
                    )
                    RotasCriadas.push(RotaCriada.rows[0]!)
                }
            }

            let i = 1
            for (const Rota of RotasCriadas) {
                const diaSemana = i > 0 && i <= 6 ? 2 : i > 6 && i <= 12 ? 3 : i > 12 && i <= 18 ? 4 : i > 18 && i <= 24 ? 5 : 6
                await cliente.query(
                    `
                    INSERT INTO rota_dia_semana
                    (rota_id, dia_semana)
                    VALUES ($1, $2)
                    `,
                    [Rota.id, diaSemana]
                )
                i++
            }

            todasRotas = RotasCriadas
        }

        const rotas = todasRotas.filter(r => r.turno === turnoEscola.turno)
        if (rotas.length < 1) throw new Error('ROTAS_NOT_FOUND');

        // for para conseguir checar e inserir em todas as rotas do motorista.
        for (const rota of rotas) {
            // busco todos os pontos rota dessa rota.
            const { rows: pontosRota } = await cliente.query<PontoRota>(
                `
                    SELECT * FROM ponto_rota
                    WHERE rota_id = $1
                    ORDER BY ordem ASC
                    `,
                [rota.id]
            )
            let proximaOrdem = pontosRota.reduce((maior, ponto) => Math.max(maior, ponto.ordem), 0) + 1

            // verifico se algum deles tem a escola do aluno que vai ser adicionado.
            if (!pontosRota.some(ponto => ponto.escola_id === escola.id)) {
                // se entrou no if, não achou essa escola em nenhum ponto rota. então vamos adiciona-la. 
                const { rows: [escolaAdicionada] } = await cliente.query<PontoRota>(
                    `
                    INSERT INTO ponto_rota
                    (ordem, tipo_ponto, rota_id, motorista_id, escola_id, escola_turno_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                    `,
                    [
                        proximaOrdem,
                        rota.sentido === 'IDA' ? 'DESEMBARQUE' : 'EMBARQUE',
                        rota.id,
                        motoristaID,
                        escola.id,
                        turnoEscola.id
                    ]
                )
                pontosRota.push(escolaAdicionada!)
                proximaOrdem++
            }

            // evita duplicar o aluno caso ele já exista nessa rota
            if (!pontosRota.some(ponto => ponto.aluno_id === alunoID)) {
                await cliente.query(
                    `
                    INSERT INTO ponto_rota
                    (ordem, tipo_ponto, rota_id, motorista_id, aluno_id)
                    VALUES ($1, $2, $3, $4, $5)
                    `,
                    [
                        proximaOrdem,
                        rota.sentido === 'IDA' ? 'EMBARQUE' : 'DESEMBARQUE',
                        rota.id,
                        motoristaID,
                        alunoID
                    ]
                )
            }
        }
        return
    },
    // obter rotas ou uma unica rota
    obterRotas: async (req: Request, res: Response) => {
        // os filtros que a busca vai ter vão ser id, turno e sentido
        const dadosBrutos = FiltrosRotaSchema.safeParse(req.query)

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Querys Inválidas Para filtrar rotas.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id, turno, sentido, dia } = dadosBrutos.data
        const motoristaID = req.userId

        // operação
        try {
            let query = `
            SELECT DISTINCT rota.*, CASE rds.dia_semana 
            WHEN 2 THEN 'SEGUNDA' WHEN 3 THEN 'TERÇA' WHEN 4 THEN 'QUARTA' WHEN 5 THEN 'QUINTA' WHEN 6 THEN 'SEXTA' END AS "diaSemana" 
            FROM rota 
            INNER JOIN rota_dia_semana rds 
            ON rds.rota_id = rota.id 
            WHERE rota.motorista_id = $1
            `
            const valores: (string | number)[] = [motoristaID]

            if (id) {
                query += ` AND rota.id = $${valores.length + 1}`
                valores.push(id)
            }
            if (turno) {
                query += ` AND rota.turno = $${valores.length + 1}`
                valores.push(turno)
            }
            if (sentido) {
                query += ` AND rota.sentido = $${valores.length + 1}`
                valores.push(sentido)
            }
            if (dia) {
                const diasSemana = { SEGUNDA: 2, 'TERÇA': 3, QUARTA: 4, QUINTA: 5, SEXTA: 6 }
                query += ` AND rds.dia_semana = $${valores.length + 1}`
                valores.push(diasSemana[dia])
            }
            // busca no banco de dados
            const { rows: rotas } = await database.query<Rota & { diaSemana: string }>(query, valores)

            // se não tiver achado nenhuma rota
            if (!rotas) {
                return res.status(404).json({
                    msg: "Nenhuma Rota encontrada com os filtros fornecidos"
                })
            }

            // retorna
            return res.status(200).json({
                rotas
            })
        } catch {
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // obter os pontos de uma rota pelo id da rota (params)
    obterPontosRota: async (req: Request, res: Response) => {
        const rotaID = Number(req.params['id'])
        const motoristaID = req.userId

        if (!Number.isInteger(rotaID) || rotaID <= 0) {
            return res.status(400).json({ msg: "ID da rota inválido." })
        }

        try {
            const { rows: pontos } = await database.query<PontoRota>(
                `
                SELECT * FROM ponto_rota
                WHERE rota_id = $1 AND motorista_id = $2
                ORDER BY ordem
                `,
                [rotaID, motoristaID]
            )
            return res.status(200).json({ pontos })
        } catch {
            return res.status(500).json({ msg: "Erro Interno do Servidor." })
        }
    },
    otimizarRota: async (req: Request, res: Response) => {
        // pega o id da rota pelos params
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação de sempre
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID da rota inválido.",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { id: rotaID } = idBruto.data

        // começa a operação
        const cliente = await database.connect()
        try {
            // inicia a operação
            await cliente.query('BEGIN')

            // chama o service pra otimizar (já busca as coordenadas iniciais do motorista direto no banco)
            await otimizarRota({ rotaID, req, cliente })

            // se não teve nenhum erro, dá commit
            await cliente.query('COMMIT')
            return res.status(200).json({
                msg: "Rota Otimizada!"
            })
        } catch (erro) {
            // deu erro, ent damos rollback
            await cliente.query('ROLLBACK')
            // anota o erro no console
            console.error(erro)
            // se o erro for do tipo Error, entra no if
            if (erro instanceof Error) {
                // aq tem um switch com os possiveis tipos de erro
                switch (erro.message) {
                    case 'DRIVER_COORDINATES_NOT_FOUND':
                        return res.status(400).json({
                            msg: "Endereço do motorista não cadastrado. Cadastre seu endereço antes de otimizar a rota."
                        })
                    case 'DRIVER_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Coordenadas do motorista inválidas."
                        })
                    case 'ALUNO_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Um ou mais alunos da rota possuem coordenadas inválidas."
                        })
                    case 'ESCOLA_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Uma ou mais escolas da rota possuem coordenadas inválidas."
                        })
                    case 'MOTORISTA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Motorista não encontrado."
                        })
                    case 'ROTA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Rota não encontrada."
                        })
                    case 'PONTOS_NOT_FOUND':
                    case 'PONTOS_SENTIDO_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Nenhum ponto encontrado para otimizar nesta rota."
                        })
                    case 'ALUNO_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Aluno não encontrado."
                        })
                    case 'ESCOLA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Escola não encontrada."
                        })
                    case 'TURNO_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Turno da escola não encontrado."
                        })
                    case 'ABSENT_ENV_CONFIG':
                        return res.status(500).json({
                            msg: "Configurações do Google Cloud ausentes no servidor."
                        })
                    case 'UNKOWN_ERROR':
                        return res.status(500).json({
                            msg: "Não foi possível otimizar a rota."
                        })
                }
            }
            // se não achou o erro, retorna com 500
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        } finally {
            cliente.release()
        }
    },
    moverPontos: async (req: Request, res: Response) => {
        // recebendo os dados por meio das querys (from e to) e o id da rota pelos params.
        const dadosBrutos = MoverPontosRotaSchema.safeParse(req.query)
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para mover pontos da rota.",
                erro: dadosBrutos.error.format()
            })
        }
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID da rota inválido.",
                erro: idBruto.error.format()
            })
        }

        // desestruturação
        const { from, to } = dadosBrutos.data
        const { id: rotaID } = idBruto.data
        const motoristaID = req.userId

        // conectando ao banco de dados
        const cliente = await database.connect()
        try {
            // iniciando transação sql
            await cliente.query('BEGIN')

            // verifica se a rota existe e pertence ao motorista, travando a linha durante a troca
            const { rowCount: rotaEncontrada } = await cliente.query(
                `
                SELECT id FROM rota
                WHERE id = $1 AND motorista_id = $2
                FOR UPDATE
                `,
                [rotaID, motoristaID]
            )
            if (!rotaEncontrada) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Rota não encontrada."
                })
            }

            if (from === to) {
                await cliente.query('ROLLBACK')
                return res.status(400).json({
                    msg: "Informe posições distintas para mover os pontos."
                })
            }

            // busca os dois pontos e a maior ordem para fazer a troca sem risco de colisão de chave única
            const { rows: pontosRota } = await cliente.query<Pick<PontoRota, 'id' | 'ordem'>>(
                `
                SELECT id, ordem FROM ponto_rota
                WHERE rota_id = $1 AND motorista_id = $2
                `,
                [rotaID, motoristaID]
            )
            const pontoOrigem = pontosRota.find(p => p.ordem === from)
            const pontoDestino = pontosRota.find(p => p.ordem === to)

            if (!pontoOrigem || !pontoDestino) {
                await cliente.query('ROLLBACK')
                return res.status(400).json({
                    msg: "Um dos pontos que você quer mover não existe nesta rota."
                })
            }

            const ordemTemporaria = pontosRota.reduce((maior, p) => Math.max(maior, p.ordem), 0) + 1
            await cliente.query(
                `UPDATE ponto_rota SET ordem = $1 WHERE id = $2 AND rota_id = $3 AND motorista_id = $4`,
                [ordemTemporaria, pontoOrigem.id, rotaID, motoristaID]
            )
            await cliente.query(
                `UPDATE ponto_rota SET ordem = $1 WHERE id = $2 AND rota_id = $3 AND motorista_id = $4`,
                [from, pontoDestino.id, rotaID, motoristaID]
            )
            await cliente.query(
                `UPDATE ponto_rota SET ordem = $1 WHERE id = $2 AND rota_id = $3 AND motorista_id = $4`,
                [to, pontoOrigem.id, rotaID, motoristaID]
            )

            // commitando alterações.
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Pontos da rota movidos com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("Erro no endpoint de mover pontos da rota, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            cliente.release()
        }
    },
    obterPolylineRota: async (req: Request, res: Response) => {
        // pega o id bruto pelo parametros
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação de sempre
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID da rota inválido.",
                erro: idBruto.error.format()
            })
        }

        // desestruturação
        const { id: rotaID } = idBruto.data
        const motoristaID = req.userId

        // coordenadas opcionais do motorista via query (gps atual); se não vierem, o service usa as coordenadas salvas no banco
        const latBruta = req.query['latitude']
        const lngBruta = req.query['longitude']
        const coordenadasMotorista = (latBruta !== undefined && lngBruta !== undefined)
            ? { latitude: Number(latBruta), longitude: Number(lngBruta) }
            : undefined

        const cliente = await database.connect()
        try {
            const polyline = await gerarPolylineRota({
                rotaID,
                motoristaID,
                ...(coordenadasMotorista ? { coordenadasMotorista } : {}),
                cliente
            })

            return res.status(200).json({
                polyline
            })
        } catch (erro) {
            console.error(erro)
            if (erro instanceof Error) {
                switch (erro.message) {
                    case 'DRIVER_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Coordenadas do motorista inválidas."
                        })
                    case 'MOTORISTA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Motorista não encontrado."
                        })
                    case 'ALUNO_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Um ou mais alunos da rota possuem coordenadas inválidas."
                        })
                    case 'ESCOLA_COORDINATES_INVALID':
                        return res.status(400).json({
                            msg: "Uma ou mais escolas da rota possuem coordenadas inválidas."
                        })
                    case 'ROTA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Rota não encontrada."
                        })
                    case 'PONTOS_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Nenhum ponto encontrado nesta rota."
                        })
                    case 'ALUNO_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Aluno não encontrado."
                        })
                    case 'ESCOLA_NOT_FOUND':
                        return res.status(404).json({
                            msg: "Escola não encontrada."
                        })
                    case 'ABSENT_ENV_CONFIG':
                        return res.status(500).json({
                            msg: "Configurações do Google Cloud ausentes no servidor."
                        })
                    case 'UNKOWN_ERROR':
                        return res.status(500).json({
                            msg: "Não foi possível gerar a polyline da rota."
                        })
                }
            }
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            cliente.release()
        }
    },
    // adiciona manualmente um aluno (e sua escola, se ainda não estiver) a uma rota específica
    adicionarPontoRota: async (req: Request, res: Response) => {
        const idBruto = ParamsSchema.safeParse(req.params)
        const dadosBrutos = AdicionarPontoRotaSchema.safeParse(req.body)

        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID da rota inválido.",
                erro: idBruto.error.format()
            })
        }
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para adicionar ponto à rota.",
                erro: dadosBrutos.error.format()
            })
        }

        const { id: rotaID } = idBruto.data
        const { aluno_id: alunoID } = dadosBrutos.data
        const motoristaID = req.userId

        const cliente = await database.connect()
        try {
            await cliente.query('BEGIN')

            const { rows: [rota] } = await cliente.query<Rota>(
                `SELECT * FROM rota WHERE id = $1 AND motorista_id = $2 FOR UPDATE`,
                [rotaID, motoristaID]
            )
            if (!rota) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({ msg: "Rota não encontrada." })
            }

            const { rows: [aluno] } = await cliente.query<Aluno>(
                `SELECT * FROM aluno WHERE id = $1 AND motorista_id = $2`,
                [alunoID, motoristaID]
            )
            if (!aluno) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({ msg: "Aluno não encontrado." })
            }

            const { rows: pontosRota } = await cliente.query<PontoRota>(
                `SELECT * FROM ponto_rota WHERE rota_id = $1 AND motorista_id = $2 ORDER BY ordem ASC`,
                [rotaID, motoristaID]
            )

            if (pontosRota.some(p => p.aluno_id === alunoID)) {
                await cliente.query('ROLLBACK')
                return res.status(409).json({ msg: "Este aluno já está nesta rota." })
            }

            let proximaOrdem = pontosRota.reduce((maior, ponto) => Math.max(maior, ponto.ordem), 0) + 1

            if (aluno.escola_id && !pontosRota.some(p => p.escola_id === aluno.escola_id)) {
                await cliente.query(
                    `
                    INSERT INTO ponto_rota
                    (ordem, tipo_ponto, rota_id, motorista_id, escola_id, escola_turno_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    `,
                    [
                        proximaOrdem,
                        rota.sentido === 'IDA' ? 'DESEMBARQUE' : 'EMBARQUE',
                        rotaID,
                        motoristaID,
                        aluno.escola_id,
                        aluno.escola_turno_id
                    ]
                )
                proximaOrdem++
            }

            await cliente.query(
                `
                INSERT INTO ponto_rota
                (ordem, tipo_ponto, rota_id, motorista_id, aluno_id)
                VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    proximaOrdem,
                    rota.sentido === 'IDA' ? 'EMBARQUE' : 'DESEMBARQUE',
                    rotaID,
                    motoristaID,
                    alunoID
                ]
            )

            const { rows: pontosAtualizados } = await cliente.query<PontoRota>(
                `SELECT * FROM ponto_rota WHERE rota_id = $1 AND motorista_id = $2 ORDER BY ordem ASC`,
                [rotaID, motoristaID]
            )

            await cliente.query('COMMIT')
            return res.status(201).json({
                msg: "Ponto adicionado à rota com sucesso.",
                pontos: pontosAtualizados
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("Erro no endpoint de adicionar ponto à rota, erro: ", erro)
            return res.status(500).json({ msg: "Erro Interno do Servidor." })
        } finally {
            cliente.release()
        }
    },
    // remove um ponto específico (aluno ou escola e seus alunos) de uma rota
    excluirPontoRota: async (req: Request, res: Response) => {
        const paramsBrutos = PontoRotaParamsSchema.safeParse(req.params)

        if (!paramsBrutos.success) {
            return res.status(400).json({
                msg: "Parâmetros inválidos para remover ponto da rota.",
                erro: paramsBrutos.error.format()
            })
        }

        const { id: rotaID, ponto_id: pontoID } = paramsBrutos.data
        const motoristaID = req.userId

        const cliente = await database.connect()
        try {
            await cliente.query('BEGIN')

            const { rowCount: rotaEncontrada } = await cliente.query(
                `SELECT id FROM rota WHERE id = $1 AND motorista_id = $2 FOR UPDATE`,
                [rotaID, motoristaID]
            )
            if (!rotaEncontrada) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({ msg: "Rota não encontrada." })
            }

            const { rows: [ponto] } = await cliente.query<PontoRota>(
                `SELECT * FROM ponto_rota WHERE id = $1 AND rota_id = $2 AND motorista_id = $3`,
                [pontoID, rotaID, motoristaID]
            )
            if (!ponto) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({ msg: "Ponto não encontrado nesta rota." })
            }

            if (ponto.escola_id) {
                // remove a escola e todos os alunos vinculados a ela nesta rota
                await cliente.query(
                    `
                    DELETE FROM ponto_rota
                    WHERE rota_id = $1 AND motorista_id = $2 AND (
                        id = $3 OR aluno_id IN (
                            SELECT id FROM aluno WHERE escola_id = $4 AND motorista_id = $2
                        )
                    )
                    `,
                    [rotaID, motoristaID, pontoID, ponto.escola_id]
                )
            } else if (ponto.aluno_id) {
                const { rows: [aluno] } = await cliente.query<Pick<Aluno, 'escola_id'>>(
                    `SELECT escola_id FROM aluno WHERE id = $1 AND motorista_id = $2`,
                    [ponto.aluno_id, motoristaID]
                )

                await cliente.query(
                    `DELETE FROM ponto_rota WHERE id = $1 AND rota_id = $2 AND motorista_id = $3`,
                    [pontoID, rotaID, motoristaID]
                )

                // se não restar nenhum aluno dessa escola nesta rota, remove também o ponto da escola
                if (aluno?.escola_id) {
                    const { rowCount: alunosRestantes } = await cliente.query(
                        `
                        SELECT pr.id FROM ponto_rota pr
                        JOIN aluno a ON a.id = pr.aluno_id
                        WHERE pr.rota_id = $1 AND pr.motorista_id = $2 AND a.escola_id = $3
                        LIMIT 1
                        `,
                        [rotaID, motoristaID, aluno.escola_id]
                    )
                    if (!alunosRestantes) {
                        await cliente.query(
                            `DELETE FROM ponto_rota WHERE rota_id = $1 AND motorista_id = $2 AND escola_id = $3`,
                            [rotaID, motoristaID, aluno.escola_id]
                        )
                    }
                }
            } else {
                await cliente.query(
                    `DELETE FROM ponto_rota WHERE id = $1 AND rota_id = $2 AND motorista_id = $3`,
                    [pontoID, rotaID, motoristaID]
                )
            }

            await recompactarOrdemPontos(cliente, rotaID, motoristaID)

            await cliente.query('COMMIT')
            return res.status(200).json({
                msg: "Ponto removido da rota com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("Erro no endpoint de excluir ponto da rota, erro: ", erro)
            return res.status(500).json({ msg: "Erro Interno do Servidor." })
        } finally {
            cliente.release()
        }
    }
}