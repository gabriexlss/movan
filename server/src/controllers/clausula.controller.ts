import { Request, Response } from "express";
import { CriarClausulaSchema } from "../models/clausula.model.js";
import { database } from "../db/postgre.js";
import { PoolClient } from "pg";
import { Contrato } from "../models/contrato.model.js";
import { atualizarClausulasContrato } from "../utils/atualizarClausulasContrato.js";

interface atualizarTodosContratosProps{
    cliente: PoolClient,
    motoristaID: number
}

const atualizarTodosContratos = async ({ cliente, motoristaID }: atualizarTodosContratosProps):Promise<void> => {
    const query = `
    SELECT * FROM contrato
    WHERE motorista_id = $1
    `
    const { rows: contratos } = await cliente.query<Contrato>(query, [motoristaID])

    for(const contrato of contratos){
        await atualizarClausulasContrato({ cliente,  motoristaID, contratoID: contrato.id})
    }
    return
}

export const controllerClausula = {
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

            if(!clausulaMotorista){
                ordem = 1
            }else{
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
        }finally{
            await cliente.release()
        }
    }
    
}