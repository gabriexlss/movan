import { Request, Response } from "express";
import { ClausulaPadrao, CriarClausulaPadrao, CriarContratoSchema, EditarContratoSchema } from "../models/contrato.model.js";
import { database } from "../db/postgre.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";

export const controllerContrato = {
    // controller para criar um contrato 
    criarContrato: async (req: Request, res: Response) => {
        // receber dados
        const dadosBrutos = CriarContratoSchema.safeParse(req.body)

        // id do motorista
        const motoristaID = req.userId

        // validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar um contrato.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { aluno_id, data_inicio, data_fim, dia_vencimento, valor_mensal } = dadosBrutos.data
        let responsavel_id: number

        //  pegando ID do responsável
        try {
            const query = "SELECT responsavel_id FROM aluno WHERE id = $1"
            const { rows: dados } = await database.query(query, [aluno_id])
            responsavel_id = dados[0].responsavel_id
        } catch (erro) {
            console.error("erro no endpoint de cadastrar contrato ao buscar responsavel do aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
        // criando uma constante de cliente para iniciar o processo de transação.
        const cliente = await database.connect()

        // iniciando variaveis
        // iniciando a variavel  pro id do contrato.
        let contrato_id: number

        // inserindo na tabela de contrato
        try {
            // iniciando a transação
            await cliente.query('BEGIN')

            const query = `
            INSERT INTO contrato
            (data_inicio, data_fim, dia_vencimento, valor_mensal, aluno_id, responsavel_id, motorista_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            `
            const valores = [data_inicio, data_fim, dia_vencimento, valor_mensal, aluno_id, responsavel_id, motoristaID]

            // inicia a tentativa de query no banco de dados.
            const { rows: dadosRetornados } = await cliente.query(query, valores)
            contrato_id = dadosRetornados[0].id

        } catch (erro) {
            try {
                // se o erro for relacionado a um  constraint
                if (possuiCodigoPostgres(erro, "23503")) {
                    return res.status(409).json({
                        msg: "Erro ao criar contrato. Aluno, Escola ou Responsável não estão mais disponiveis."
                    })
                    // se for relacionado com a um check
                } else if (possuiCodigoPostgres(erro, "23514")) {
                    return res.status(400).json({
                        msg: "Erro ao criar contrato, aluno inserido não pertence ao motorista atual."
                    })
                    // se não for nenhum dos dois manda um erro generico.
                } else {
                    console.error("erro no endpoint de cadastro de contratos ao inserir dados na tabela contrato, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro Interno do Servidor."
                    })
                }
            } finally {
                // libero a conexão.
                await cliente.release()
            }
        }
        // agora eu copio os dados da clausula padrão para as clausulas desse contrato.
        try {
            // pego todas as clausulas padrões do sistema.
            const BuscarClausulasPadraoQuery = "SELECT * FROM clausula_padrao"
            const { rows: ClausulasPadroes } = await cliente.query<ClausulaPadrao>(BuscarClausulasPadraoQuery)

            // iniciando constante com os dados pra criar as clausulas.
            const ClausulasMotorista: CriarClausulaPadrao[] = []

            ClausulasPadroes.map(clausula => ClausulasMotorista.push({
                titulo: clausula.titulo,
                conteudo: clausula.conteudo,
                ordem: clausula.ordem,
                editavel: false,
                origem: "PADRAO",
                contrato_id: contrato_id,
                clausula_padrao_id: clausula.id
            }))
            // coloco nas clausulas do contrato gerado anteriormente.
            const query = `INSERT INTO contrato_clausula
            (titulo, conteudo, ordem, editavel, origem, contrato_id, clausula_padrao_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            `
            /*
            vai inserindo as clausulas padrão nas do contrato motorista uma por uma.
            Sinceramente nem sei como isso tá funcionando e nem sei se é o jeito mais rapido e eficiente e rápido de fazer isso mas fi, esqueça tudo, deu certo
            */
            for(const clausula of ClausulasMotorista){
                await cliente.query(query, Object.values(clausula))
            }
            // confirmo todas as alterações.
            await cliente.query('COMMIT')

            // retorno
            return res.status(201).json({
                msg: "Contrato Criado com Sucesso."
            })
        } catch (erro) {
            try {
                // se o erro for relacionado a um  constraint
                if (possuiCodigoPostgres(erro, "23503")) {
                    return res.status(409).json({
                        msg: "Erro ao criar contrato. Contrato não está mais disponivel."
                    })
                    // se for relacionado com a um check
                } else if (possuiCodigoPostgres(erro, "23514")) {
                    console.error(erro)
                    return res.status(400).json({
                        msg: "Erro ao criar contrato, Clausula Não Pertence a Motorista.."
                    })
                    // se não for nenhum dos dois manda um erro generico.
                } else {
                    console.error("erro no endpoint de cadastro de contratos ao inserir dados na tabela clausulas, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro Interno do Servidor."
                    })
                }
            } finally {
                // reverto as alterações da criação do contrato. 
                await cliente.query('ROLLBACK')
            }
        } finally {
            // libero a conexão
            await cliente.release()
        }
    },
    // Controller para editar o contrato se estiver como rascunho.
    editarContrato: async (req: Request, res: Response) => {
        // recebendo os dados
        const dadosBrutos = EditarContratoSchema.safeParse(req.body)

        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Inválidos para editar um contrato.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { data_fim, data_inicio, dia_vencimento, valor_mensal } = dadosBrutos.data
        const contratoID = req.contratoID
        const motoristaID = req.userId

        const campos: string[] = []
        const valores: (string | number)[] = []

        // montando a query
        if(data_inicio){
            campos.push(`data_inicio = $${valores.length + 1}`)
            valores.push(data_inicio)
        }
        if(data_fim){
            campos.push(`data_fim = $${valores.length + 1}`)
            valores.push(data_fim)
        }
        if(dia_vencimento){
            campos.push(`dia_vencimento = $${valores.length + 1}`)
            valores.push(dia_vencimento)
        }
        if(valor_mensal){
            campos.push(`valor_mensal = $${valores.length + 1}`)
            valores.push(valor_mensal)
        }
        
        // validando se pelo menos algum dos campos foi enviado
        if(valores.length < 1){
            return res.status(400).json({
                msg: "É Necessario pelo menos um campo para editar."
            })
        }
        // realizando operação
        try{
            const query = `
            UPDATE contrato
            SET ${campos.join(', ')}
            WHERE motorista_id = $${campos.length + 1} AND id = $${campos.length + 2}
            `
            valores.push(motoristaID)
            valores.push(contratoID)
            await database.query(query, valores)

            return res.status(200).json({
                msg: "Contrato Editado com Sucesso"
            })
        }catch(erro){
            console.error("erro no endpoint de editar contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
    }
}