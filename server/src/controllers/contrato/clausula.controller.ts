import { Request, Response } from "express";
import { Clausula, CriarClausulaSchema, EditarClausulaSchema, MoverClausulasSchema } from "../../models/contrato/clausula.model.js";
import { database } from "../../db/postgre.js";
import { ParamsSchema } from "../../models/utils.model.js";
import { possuiCodigoPostgres } from "../../utils/erroBanco.js";

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
}
