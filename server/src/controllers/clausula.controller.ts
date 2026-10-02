import { Request, Response } from "express";
import { CriarClausulaSchema, EditarClausulaSchema } from "../models/clausula.model.js";
import { database } from "../db/postgre.js";
import { PoolClient } from "pg";
import { Contrato } from "../models/contrato.model.js";
import { atualizarClausulasContrato } from "../utils/atualizarClausulasContrato.js";
import { ParamsSchema } from "../models/utils.model.js";

interface atualizarTodosContratosProps{
    cliente: PoolClient,
    motoristaID: number
}

const atualizarTodosContratos = async ({ cliente, motoristaID }: atualizarTodosContratosProps):Promise<void> => {
    const query = `
    SELECT * FROM contrato
    WHERE motorista_id = $1 AND status = $2
    `
    const { rows: contratos } = await cliente.query<Contrato>(query, [motoristaID, 'RASCUNHO'])

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
    },
    // controller para editar clausula do motorista
    editarClausulaPadrao: async (req: Request, res: Response) => {
        // recebendo dados
        const dadosBrutos = EditarClausulaSchema.safeParse(req.body)
        const idBruto = ParamsSchema.safeParse(req.params)

        // validação
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Inválidos para edição das clausulas",
                erro: dadosBrutos.error.format()
            })
        }
        if(!idBruto.success){
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

        if(titulo){
            campos.push(`titulo = $${valores.length + 1}`)
            valores.push(titulo)
        }
        if(conteudo){
            campos.push(`conteudo = $${valores.length + 1}`)
            valores.push(conteudo)
        }

        // se não tiver enviado nenhum campo manda embora
        if(campos.length < 1){
            return res.status(400).json({
                msg: "É Necessario ao menos um campo para realizar a edição."
            })
        }

        const cliente = await database.connect()
        try{
            const query = `
            UPDATE clausula_motorista
            SET ${campos.join(', ')}
            WHERE motorista_id = $${campos.length + 1} AND ordem = $${campos.length + 2} AND excluido = $${campos.length + 3}
            `
            valores.push(motoristaID)
            valores.push(ordem)
            valores.push(false)

            const edicoes = await cliente.query(query, valores)

            // commita alterações
            await cliente.query('COMMIT')

            // verifica se editou algum campo
            if(!edicoes.rowCount){
                return res.status(404).json({
                msg: "Nenhuma Clausula encontrada com a ordem fornecida."
            })
            }
            await atualizarTodosContratos({ cliente, motoristaID })
            
            return res.status(200).json({
                msg: "Clausula Editada com sucesso."
            })
        }catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de editar clausulas, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }finally{
            await cliente.release()
        }

    }
}