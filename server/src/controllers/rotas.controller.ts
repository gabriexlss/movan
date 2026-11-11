import { Request, Response } from "express";
import { database } from "../db/postgre.js";
import { CriarRota, FiltrosRotaSchema, OtimizarRotaSchema, Rota } from "../models/rotas/rota.js";
import { PoolClient } from "pg";
import { Aluno } from "../models/aluno.model.js";
import { Escola } from "../models/escola/escola.model.js";
import { MoverPontosRotaSchema, PontoRota } from "../models/rotas/pontoRota.js";
import { EscolaTurno } from "../models/escola/turno.model.js";
import { otimizarRota } from "../services/otimizarRota.js";
import { ParamsSchema } from "../models/utils.model.js";
import { gerarPolylineRota } from "../services/gerarPolyline.js";

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
        const { rows: rotas } = await cliente.query<Rota>(
            `
                SELECT * FROM rota
                WHERE motorista_id = $1 AND turno = $2
                `,
            [motoristaID, turnoEscola.turno]
        )
        if (rotas.length < 1) throw new Error('ROTAS_NOT_FOUND'); // penso em trocar isso aqui pra gerar as rotas se ainda não estiverem sido geradas, mas to pensando ainda.

        // for para conseguir checar e inserir em todas as rotas do motorista.
        for (const rota of rotas) {
            // busco todos os pontos rota dessa rota.
            const { rows: pontosRota } = await cliente.query<PontoRota>(
                `
                    SELECT * FROM ponto_rota
                    WHERE rota_id = $1
                    `,
                [rota.id]
            )
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
                        pontosRota.length + 1,
                        rota.sentido === 'IDA' ? 'DESEMBARQUE' : 'EMBARQUE',
                        rota.id,
                        motoristaID,
                        escola.id,
                        turnoEscola.id
                    ]
                )
                pontosRota.push(escolaAdicionada!)
            }
            // independente de ter entrado no if ou não, pq se nao tinha a escola agora tem, vamos adicionar o aluno a rota.
            await cliente.query(
                `
                    INSERT INTO ponto_rota
                    (ordem, tipo_ponto, rota_id, motorista_id, aluno_id)
                    VALUES ($1, $2, $3, $4, $5)
                    `,
                [
                    pontosRota.length + 1,
                    rota.sentido === 'IDA' ? 'EMBARQUE' : 'DESEMBARQUE',
                    rota.id,
                    motoristaID,
                    alunoID
                ]
            )
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
        // recebe o id
        const dadosBrutos = OtimizarRotaSchema.safeParse(req.params)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "ID Inválido",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { id: rotaID, latitude: latitudeMotorista, longitude: longitudeMotorista } = dadosBrutos.data

        // começa a operação
        const cliente = await database.connect()
        try {
            // inicia a operação
            await cliente.query('BEGIN')

            // chama o service pra otimizar
            await otimizarRota({ rotaID, req, coordenadasMotorista: { latitude: latitudeMotorista, longitude: longitudeMotorista }, cliente })

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

            // troca os dois pontos da rota de lugar em um único UPDATE.
            const query = `
            UPDATE ponto_rota
            SET ordem = CASE WHEN ordem = $1 THEN $2 ELSE $1 END
            WHERE rota_id = $3 AND motorista_id = $4 AND ordem IN ($1, $2)
            `
            const operacao = await cliente.query(query, [from, to, rotaID, motoristaID])

            // precisa achar exatamente os dois pontos (se from === to, só acha um).
            if (operacao.rowCount !== 2) {
                await cliente.query('ROLLBACK')
                return res.status(400).json({
                    msg: "Um dos pontos que você quer mover não existe nesta rota."
                })
            }

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

        // coordenadas opcionais do motorista (via query ou body) caso queira incluir a saída inicial da van
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
    }
}