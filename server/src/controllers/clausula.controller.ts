import { Request, Response } from "express";
import { Clausula, ClausulaMotorista, CriarClausulaSchema, EditarClausulaSchema, MoverClausulasSchema } from "../models/clausula.model.js";
import { database } from "../db/postgre.js";
import { PoolClient } from "pg";
import { Contrato } from "../models/contrato.model.js";
import { atualizarClausulasContrato } from "../utils/atualizarClausulasContrato.js";
import { ParamsSchema } from "../models/utils.model.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";
import { codec } from "zod";

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
                msg: "Dados inválidos para criar a cláusula.",
                erro: dadosBrutos.error.format()
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
            return res.status(201).json({
                msg: "Cláusula personalizada criada com sucesso."
            })

        } catch (erro) {
            console.error("Erro no endpoint de criar cláusula personalizada, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23503")) {
                return res.status(409).json({
                    msg: "Não foi possível criar a cláusula porque o contrato não está mais disponível."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
                msg: "Dados inválidos para editar uma cláusula.",
                erro: dadosBrutos.error.format()
            })
        }
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem inválida ou ausente para editar a cláusula.",
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
                msg: "É necessário informar pelo menos um campo para edição."
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
                    msg: "Nenhuma cláusula editável encontrada com a ordem fornecida."
                })
            }

            return res.status(200).json({
                msg: "Cláusula editada com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de editar cláusula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
                msg: "Ordem inválida ou ausente para excluir a cláusula.",
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
                    msg: "Nenhuma cláusula editável encontrada com a ordem fornecida."
                })
            }

            return res.status(200).json({
                msg: "Cláusula excluída com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de excluir cláusula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
    moverClausula: async (req: Request, res: Response) => {
        // recebendo os dados por meio das querys, from e to.
        const dadosBrutos = MoverClausulasSchema.safeParse(req.query)

        // validação
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Inválidos para mover clausulas.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { from, to } = dadosBrutos.data
        const contratoID = req.contratoID

        // conectando ao banco de dados
        const cliente = await database.connect()
        try{
            // iniciando transação sql
            await cliente.query('BEGIN')

            // troca as duas clausulas de lugar em um único UPDATE.
            // como é uma única query, as duas linhas são avaliadas com os valores originais.
            // a constraint UNIQUE é DEFERRABLE, então só é verificada no COMMIT pelo q entendi.
            // ps: sim, nicolly, coloquei esse deferrable no seu banco ent profanei ele, perdões
            const query = `
            UPDATE contrato_clausula
            SET ordem = CASE WHEN ordem = $1 THEN $2 ELSE $1 END
            WHERE contrato_id = $3 AND ordem IN ($1, $2)
            `
            const operacao = await cliente.query(query, [from, to, contratoID])

            // precisa achar exatamente as duas clausulas (se from === to, só acha uma).
            if(operacao.rowCount !== 2){
                await cliente.query('ROLLBACK')
                return res.status(400).json({
                    msg: "Uma das clausulas que você quer mover não existe."
                })
            }

            // commitando alterações.
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Clausulas movidas com sucesso."
            })
        }catch(erro){
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de mover clausulas, erro: ", erro)
            return res.status(500).json("Erro Interno do Servidor.")
        }finally{
            cliente.release()
        }
    },
    //===================CLAUSULAS PADROES==============================
    // criar uma clausula padrão de um motorista.
    criarClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = CriarClausulaSchema.safeParse(req.body)

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para criar a cláusula padrão.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { titulo, conteudo } = dadosBrutos.data
        const motoristaID = req.userId

        // conectando ao banco de dados
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("Erro ao conectar ao banco de dados no controller de cláusula, erro: ", erro)
            return null
        })
        if (!cliente) {
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
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

            return res.status(201).json({
                msg: "Cláusula padrão criada com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("Erro no endpoint de criar cláusula padrão, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
                msg: "Dados inválidos para editar a cláusula padrão.",
                erro: dadosBrutos.error.format()
            })
        }
        if (!idBruto.success) {
            return res.status(400).json({
                msg: "Ordem inválida ou ausente para editar a cláusula padrão.",
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
                msg: "É necessário informar pelo menos um campo para edição."
            })
        }

        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("Erro ao conectar ao banco de dados no controller de cláusula, erro: ", erro)
            return null
        })
        if (!cliente) {
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
        try {
            await cliente.query('BEGIN')
            const query = `
            UPDATE clausula_motorista
            SET ${campos.join(', ')}, atualizada_em = now()
            WHERE motorista_id = $${campos.length + 1} AND ordem = $${campos.length + 2} AND excluido = $${campos.length + 3}
            `
            valores.push(motoristaID)
            valores.push(ordem)
            valores.push(false)

            const edicoes = await cliente.query(query, valores)

            // verifica se editou algum campo
            if (!edicoes.rowCount) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Nenhuma cláusula padrão encontrada com a ordem fornecida."
                })
            }
            await atualizarTodosContratos({ cliente, motoristaID })

            // commita alterações
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Cláusula padrão editada com sucesso."
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("Erro no endpoint de editar cláusula padrão, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
                msg: "Ordem inválida ou ausente para excluir a cláusula padrão.",
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
                    msg: "Cláusula não encontrada para excluir."
                })
            } else {
                return res.status(200).json({
                    msg: "Cláusula excluída com sucesso."
                })
            }

        } catch (erro) {
            // se cair aqui, é pq ja ta sendo em algum lugar, nesse caso só vou dar update no campo excluido de false pra true.
            if (possuiCodigoPostgres(erro, "23001") || possuiCodigoPostgres(erro, "23503")) {
                const cliente = await database.connect().catch((erro: unknown) => {
                    console.error("Erro ao conectar ao banco de dados no controller de cláusula, erro: ", erro)
                    return null
                })
                if (!cliente) {
                    return res.status(500).json({
                        msg: "Erro interno do servidor."
                    })
                }
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
                            msg: "Cláusula não encontrada para excluir."
                        })
                    } else {
                        return res.status(200).json({
                            msg: "Cláusula padrão excluída com sucesso."
                        })
                    }

                } catch (erro) {
                    await cliente.query('ROLLBACK')
                    console.error("Erro no endpoint de excluir cláusula padrão, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro interno do servidor."
                    })
                } finally {
                    await cliente.release()
                }
            }
            // se chegar aq é pq ai sim de fato o erro é desconhecido e fdskkkkkk
            console.error("Erro no endpoint de excluir cláusula, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
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
            console.error("Erro no endpoint de obter cláusulas padrão, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    moverClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo os dados por meio das querys, from e to.
        const dadosBrutos = MoverClausulasSchema.safeParse(req.query)

        // validação
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Inválidos para mover clausulas.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { from, to } = dadosBrutos.data
        const motoristaID = req.userId

        // conectando ao banco de dados
        const cliente = await database.connect()
        try{
            // iniciando transação sql
            await cliente.query('BEGIN')

            // troca as duas clausulas de lugar em um único UPDATE.
            // como é uma única query, as duas linhas são avaliadas com os valores originais.
            // a constraint UNIQUE é DEFERRABLE, então só é verificada no COMMIT pelo q entendi.
            // ps: sim, nicolly, coloquei esse deferrable no seu banco ent profanei ele, perdões
            const query = `
            UPDATE clausula_motorista
            SET ordem = CASE WHEN ordem = $1 THEN $2 ELSE $1 END
            WHERE motorista_id = $3 AND ordem IN ($1, $2) AND excluido = false
            `
            const operacao = await cliente.query(query, [from, to, motoristaID])

            // precisa achar exatamente as duas clausulas (se from === to, só acha uma).
            if(operacao.rowCount !== 2){
                await cliente.query('ROLLBACK')
                return res.status(400).json({
                    msg: "Uma das clausulas que você quer mover não existe."
                })
            }

            // commitando alterações.
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Clausulas movidas com sucesso."
            })
        }catch(erro){
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de mover clausulas, erro: ", erro)
            return res.status(500).json("Erro Interno do Servidor.")
        }finally{
            cliente.release()
        }
    },
}
