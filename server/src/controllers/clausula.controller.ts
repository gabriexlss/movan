import { Request, Response } from "express";
import { Clausula, ClausulaMotorista, CriarClausulaSchema, EditarClausulaSchema } from "../models/clausula.model.js";
import { database } from "../db/postgre.js";
import { PoolClient } from "pg";
import { Contrato } from "../models/contrato.model.js";
import { atualizarClausulasContrato } from "../utils/atualizarClausulasContrato.js";
import { ParamsSchema } from "../models/utils.model.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";

interface atualizarTodosContratosProps {
    cliente: PoolClient,
    motoristaID: number
}

const atualizarTodosContratos = async ({ cliente, motoristaID }: atualizarTodosContratosProps): Promise<void> => {
    const query = `
    SELECT * FROM contrato
    WHERE motorista_id = $1 AND status = $2
    `
    const { rows: contratos } = await cliente.query<Contrato>(query, [motoristaID, 'RASCUNHO'])

    for (const contrato of contratos) {
        await atualizarClausulasContrato({ cliente, motoristaID, contratoID: contrato.id })
    }
    return
}

export const controllerClausula = {
    criarClausula: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = CriarClausulaSchema.safeParse(req.body)

        //validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar clausula."
            })
        }
        // desestruturação.
        const { titulo, conteudo } = dadosBrutos.data
        const contratoID = req.contratoID

        try {
            // primeiro buscar a ordem atual das clausulas
            const queryBuscarOrdem = "SELECT * FROM contrato_clausula WHERE contrato_id = $1 ORDER BY ordem ASC"

            const { rows: contratoClausulas } = await database.query<Clausula>(queryBuscarOrdem, [contratoID])
            const ordemAtual = (contratoClausulas.at(-1)?.ordem ?? 0) + 1

            // agr fazer a operação
            const query = `
            INSERT INTO contrato_clausula
            (titulo, conteudo, ordem, editavel, origem, contrato_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            `
            const valores = [titulo, conteudo, ordemAtual, true, 'PERSONALIZADO', contratoID]

            await database.query(query, valores)

            // devolve o usuario
            return res.status(200).json({
                msg: "Clausula personalizada criada com sucesso."
            })

        } catch (erro) {
            console.error("erro no endpoint de criar clausulas, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // editar uma clausula editavel do contrato pela ordem.
    editarClausula: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = EditarClausulaSchema.safeParse(req.body)
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para editar uma clausula.",
                erro: dadosBrutos.error.format()
            })
        }
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem inválida ou ausente para editar a clausula.",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { titulo, conteudo } = dadosBrutos.data
        const { id: ordem } = idBruto.data
        const contratoID = req.contratoID

        // montando a query com os campos enviados
        const campos: string[] = []
        const valores: (string | number | boolean)[] = []

        if (titulo) {
            campos.push(`titulo = $${valores.length + 1}`)
            valores.push(titulo)
        }
        if (conteudo) {
            campos.push(`conteudo = $${valores.length + 1}`)
            valores.push(conteudo)
        }

        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É Necessario ao menos um campo para realizar a edição."
            })
        }

        try {
            const query = `
            UPDATE contrato_clausula
            SET ${campos.join(', ')}, atualizada_em = now()
            WHERE contrato_id = $${campos.length + 1} AND ordem = $${campos.length + 2} AND editavel = $${campos.length + 3}
            `
            valores.push(contratoID)
            valores.push(ordem)
            valores.push(true)

            const edicoes = await database.query(query, valores)

            if (!edicoes.rowCount) {
                return res.status(404).json({
                    msg: "Nenhuma clausula editável encontrada com a ordem fornecida."
                })
            }

            return res.status(200).json({
                msg: "Clausula editada com sucesso."
            })
        } catch (erro) {
            console.error("erro no endpoint de editar clausula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // excluir uma clausula editavel do contrato pela ordem.
    excluirClausula: async (req: Request, res: Response) => {
        // recebendo a ordem da clausula
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem inválida ou ausente para excluir a clausula.",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { id: ordem } = idBruto.data
        const contratoID = req.contratoID

        try {
            const query = `
            DELETE FROM contrato_clausula
            WHERE contrato_id = $1 AND ordem = $2 AND editavel = $3
            `
            const valores = [contratoID, ordem, true]

            const exclusoes = await database.query(query, valores)

            if (!exclusoes.rowCount) {
                return res.status(404).json({
                    msg: "Nenhuma clausula editável encontrada com a ordem fornecida."
                })
            }

            return res.status(200).json({
                msg: "Clausula excluida com sucesso."
            })
        } catch (erro) {
            console.error("erro no endpoint de excluir clausula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para obter todas as clausulas de um contrato.
    obterClausulas: async (contratoID: number): Promise<Clausula[]> => {
        const query = "SELECT id, titulo, conteudo, ordem, origem FROM contrato_clausula WHERE contrato_id = $1 ORDER BY ordem ASC"

        const { rows: contratoClausulas } = await database.query<Clausula>(query, [contratoID])

        // retorna os dados
        return contratoClausulas
    },
    //===================CLAUSULAS PADROES==============================
    // criar uma clausula padrão de um motorista.
    criarClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = CriarClausulaSchema.safeParse(req.body)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar uma clausula.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { titulo, conteudo } = dadosBrutos.data
        const motoristaID = req.userId

        // conectando ao banco de dados
        const cliente = await database.connect()
        try {
            // iniciando transação
            await cliente.query('BEGIN')

            // procura a ordem atual das clausulas do motorista
            const queryBuscarOrdem = "SELECT ordem FROM clausula_motorista WHERE motorista_id = $1 ORDER BY ordem DESC"
            const { rows: dados } = await cliente.query(queryBuscarOrdem, [motoristaID])

            const clausulaMotorista = dados[0]
            let ordem

            if (!clausulaMotorista) {
                ordem = 1
            } else {
                ordem = clausulaMotorista.ordem + 1
            }

            const query = `
            INSERT INTO clausula_motorista
            (titulo, conteudo, motorista_id, ordem)
            VALUES ($1, $2, $3, $4)
            `
            const valores = [titulo, conteudo, motoristaID, ordem]

            await cliente.query(query, valores)

            // atualiza todas as clausulas de todos os contratos para conter a nova clausula do motorista.
            await atualizarTodosContratos({ cliente, motoristaID })

            // commita as atualizações
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Clausula Criada com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de criar clausulas, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            await cliente.release()
        }
    },
    // controller para editar clausula do motorista
    editarClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = EditarClausulaSchema.safeParse(req.body)
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para edição das clausulas",
                erro: dadosBrutos.error.format()
            })
        }
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem nécessaria edição das clausulas",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { titulo, conteudo } = dadosBrutos.data
        const { id: ordem } = idBruto.data
        const motoristaID = req.userId

        // verificação de quantos campos foram enviados
        const campos: string[] = []
        const valores: (string | number | boolean)[] = []

        if (titulo) {
            campos.push(`titulo = $${valores.length + 1}`)
            valores.push(titulo)
        }
        if (conteudo) {
            campos.push(`conteudo = $${valores.length + 1}`)
            valores.push(conteudo)
        }

        // se não tiver enviado nenhum campo manda embora
        if (campos.length < 1) {
            return res.status(400).json({
                msg: "É Necessario ao menos um campo para realizar a edição."
            })
        }

        const cliente = await database.connect()
        try {
            const query = `
            UPDATE clausula_motorista
            SET ${campos.join(', ')}, atualizada_em = now()
            WHERE motorista_id = $${campos.length + 1} AND ordem = $${campos.length + 2} AND excluido = $${campos.length + 3}
            `
            valores.push(motoristaID)
            valores.push(ordem)
            valores.push(false)

            const edicoes = await cliente.query(query, valores)

            // commita alterações
            await cliente.query('COMMIT')

            // verifica se editou algum campo
            if (!edicoes.rowCount) {
                return res.status(404).json({
                    msg: "Nenhuma Clausula encontrada com a ordem fornecida."
                })
            }
            await atualizarTodosContratos({ cliente, motoristaID })

            return res.status(200).json({
                msg: "Clausula Editada com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de editar clausulas, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            await cliente.release()
        }
    },
    // Deletar clausula padrão
    excluirClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo a ordem da clausula q quer remover
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem nécessaria edição das clausulas",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { id: ordem } = idBruto.data
        const motoristaID = req.userId

        // deletar a ordem se ela não estiver em uso em mais nenhum lugar. 
        try {
            const query = `
            DELETE FROM clausula_motorista
            WHERE ordem = $1 AND motorista_id = $2
            `
            const valores = [ordem, motoristaID]

            const response = await database.query(query, valores)

            if (!response.rowCount) {
                return res.status(404).json({
                    msg: "Clausula não encontrada para excluir."
                })
            } else {
                return res.status(200).json({
                    msg: "Clausula Excluida com sucesso."
                })
            }

        } catch (erro) {
            // se cair aqui, é pq ja ta sendo em algum lugar, nesse caso só vou dar update no campo excluido de false pra true.
            if (possuiCodigoPostgres(erro, "23001")) {
                const cliente = await database.connect()
                try {
                    // inicia a transação
                    await cliente.query('BEGIN')

                    const query = `
                    UPDATE clausula_motorista
                    SET excluido = $1, atualizada_em = now()
                    WHERE ordem = $2 AND motorista_id = $3 AND excluido = false
                    `
                    const valores = [true, ordem, motoristaID]

                    // atualiza o status de excluido de falso pra verdadeiro
                    const response = await cliente.query(query, valores)

                    // atualiza todas os contratos em rascunho pra nova condição
                    await atualizarTodosContratos({ cliente, motoristaID })

                    // commita tudo
                    await cliente.query('COMMIT')

                    if (!response.rowCount) {
                        return res.status(404).json({
                            msg: "Clausula não encontrada para excluir."
                        })
                    } else {
                        return res.status(200).json({
                            msg: "Clausula parcialmente excluida com sucesso"
                        })
                    }

                } catch (erro) {
                    await cliente.query('ROLLBACK')
                    console.error("erro no endpoint de excluir clausulas, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro Interno do Servidor."
                    })
                } finally {
                    await cliente.release()
                }
            }
            // se chegar aq é pq ai sim de fato o erro é desconhecido e fdskkkkkk
            console.error("erro no endpoint de excluir clausula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // controller para obter todas as clausulas do motorista
    obterClausulaPadrao: async (req: Request, res: Response) => {
        // pegando id do motorista
        const motoristaID = req.userId

        try {
            const query = "SELECT id, titulo, conteudo, ordem FROM clausula_motorista WHERE motorista_id = $1 AND excluido = false ORDER BY ordem ASC"

            const { rows: ClausulasMotorista } = await database.query<ClausulaMotorista>(query, [motoristaID])

            return res.status(200).json({
                msg: "Dados obtidos com sucesso.",
                ClausulasMotorista
            })
        } catch (erro) {
            console.error("erro no endpoint de obter clausulas padrões, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}
