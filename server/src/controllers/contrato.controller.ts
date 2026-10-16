import { Request, Response } from "express";
import { ContratoDocumento, CriarContratoSchema, EditarContratoSchema } from "../models/contrato.model.js";
import { database } from "../db/postgre.js";
import { possuiCodigoPostgres } from "../utils/erroBanco.js";
import { atualizarClausulasContrato } from "../utils/atualizarClausulasContrato.js";
import { ParamsSchema } from "../models/utils.model.js";
import { controllerClausula } from "./clausula.controller.js";
import { AssinaturaMotorista } from "../models/assinatura.model.js";
import { BUCKET_NAME, CDN_URL, r2 } from "../db/r2.js";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

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
                msg: "Dados inválidos para criar um contrato.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { aluno_id, data_inicio, data_fim, dia_vencimento, valor_mensal } = dadosBrutos.data
        let responsavel_id: number

        //  pegando ID do responsável
        try {
            const query = "SELECT responsavel_id FROM aluno WHERE id = $1 AND motorista_id = $2"
            const { rows: dados } = await database.query(query, [aluno_id, motoristaID])
            if (!dados[0]) {
                return res.status(404).json({
                    msg: "Aluno não encontrado para criar o contrato."
                })
            }
            responsavel_id = dados[0].responsavel_id
        } catch (erro) {
            console.error("Erro no endpoint de criar contrato ao buscar o responsável do aluno, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
        // criando uma constante de cliente para iniciar o processo de transação.
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("Erro ao conectar ao banco de dados no controller de contrato, erro: ", erro)
            return null
        })
        if (!cliente) {
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }

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
                        msg: "Não foi possível criar o contrato porque o aluno, o responsável ou o motorista não está mais disponível."
                    })
                    // se for relacionado com a um check
                } else if (possuiCodigoPostgres(erro, "23514")) {
                    return res.status(400).json({
                        msg: "Dados inválidos para criar o contrato. Verifique as restrições do contrato."
                    })
                    // se não for nenhum dos dois manda um erro generico.
                } else {
                    console.error("Erro no endpoint de criar contrato ao inserir dados na tabela contrato, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro interno do servidor."
                    })
                }
            } finally {
                await cliente.query('ROLLBACK')
                // libero a conexão.
                await cliente.release()
            }
        }
        // agora eu copio os dados da clausula padrão para as clausulas desse contrato.
        try {
            // atualiza o contrato recem criado com todas as clausulas do sistema e do motorista
            await atualizarClausulasContrato({ cliente, contratoID: contrato_id, motoristaID })

            // confirmo todas as alterações.
            await cliente.query('COMMIT')

            // retorno
            return res.status(201).json({
                msg: "Contrato criado com sucesso."
            })
        } catch (erro) {
            try {
                // se o erro for relacionado a um  constraint
                if (possuiCodigoPostgres(erro, "23503")) {
                    return res.status(409).json({
                        msg: "Não foi possível criar o contrato porque um registro vinculado às cláusulas não está mais disponível."
                    })
                    // se for relacionado com a um check
                } else if (possuiCodigoPostgres(erro, "23514")) {
                    console.error("Erro no endpoint de criar contrato ao copiar cláusulas, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro interno do servidor."
                    })
                    // se não for nenhum dos dois manda um erro generico.
                } else {
                    console.error("Erro no endpoint de criar contrato ao copiar cláusulas, erro: ", erro)
                    return res.status(500).json({
                        msg: "Erro interno do servidor."
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

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para editar um contrato.",
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
        if (data_inicio) {
            campos.push(`data_inicio = $${valores.length + 1}`)
            valores.push(data_inicio)
        }
        if (data_fim) {
            campos.push(`data_fim = $${valores.length + 1}`)
            valores.push(data_fim)
        }
        if (dia_vencimento) {
            campos.push(`dia_vencimento = $${valores.length + 1}`)
            valores.push(dia_vencimento)
        }
        if (valor_mensal !== undefined) {
            campos.push(`valor_mensal = $${valores.length + 1}`)
            valores.push(valor_mensal)
        }

        // validando se pelo menos algum dos campos foi enviado
        if (valores.length < 1) {
            return res.status(400).json({
                msg: "É necessário informar pelo menos um campo para edição."
            })
        }
        // realizando operação
        try {
            const query = `
            UPDATE contrato
            SET ${campos.join(', ')}, atualizado_em = now()
            WHERE motorista_id = $${campos.length + 1} AND id = $${campos.length + 2}
            `
            valores.push(motoristaID)
            valores.push(contratoID)
            const contrato = await database.query(query, valores)
            if (!contrato.rowCount) {
                return res.status(404).json({
                    msg: "Contrato não encontrado."
                })
            }

            return res.status(200).json({
                msg: "Contrato editado com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de editar contrato, erro: ", erro)
            if (possuiCodigoPostgres(erro, "23514")) {
                return res.status(400).json({
                    msg: "Dados inválidos para editar o contrato. Verifique as restrições do contrato."
                })
            }
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // excluir contrato
    excluirContrato: async (req: Request, res: Response) => {
        // pegando ID do contrato do middleware
        const contratoID = req.contratoID
        const motoristaID = req.userId

        // iniciando a operação de deleção
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("Erro ao conectar ao banco de dados no controller de contrato, erro: ", erro)
            return null
        })
        if (!cliente) {
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }

        try {
            await cliente.query('BEGIN')
            const queryDeletarContrato = `
            DELETE FROM contrato
            WHERE id = $1 AND motorista_id = $2
            `
            const queryDeletarClausulas = `
            DELETE FROM contrato_clausula
            WHERE contrato_id = $1
            `
            // apagando as clausulas
            await cliente.query(queryDeletarClausulas, [contratoID])

            // apagando o contrato
            const contrato = await cliente.query(queryDeletarContrato, [contratoID, motoristaID])
            if (!contrato.rowCount) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Contrato não encontrado."
                })
            }

            // dando commit nas alterações
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Contrato excluído com sucesso."
            })
        } catch (erro) {
            console.error("Erro no endpoint de excluir contrato, erro: ", erro)
            await cliente.query('ROLLBACK')
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        } finally {
            // libera a conexão.
            await cliente.release()
        }
    },
    obterContrato: async (req: Request, res: Response) => {
        //id do contrato, opcional
        const idBruto = ParamsSchema.partial().safeParse(req.params)

        if (!idBruto.success) {
            return res.status(400).json({
                msg: "ID inválido para obter o contrato.",
                erro: idBruto.error.format()
            })
        }
        // desestruturação
        const { id: contratoID } = idBruto.data
        const motoristaID = req.userId

        let query: string
        const valores: (string | number)[] = []

        if (!contratoID) {
            // não tem ID do contrato, mostrando todos os contratos de forma resumida
            query = 'SELECT * FROM vw_resumo_contrato WHERE motorista_id = $1'
            valores.push(motoristaID)
        } else {
            query = 'SELECT * FROM vw_detalhes_contrato WHERE motorista_id = $1 AND contrato_id = $2'
            valores.push(motoristaID)
            valores.push(contratoID)
        }

        try {
            const { rows: resultado } = await database.query(query, valores)
            let contrato

            // verifica se é um contrato detalhado ou varios resumidos
            if (contratoID && resultado.length === 0) {
                return res.status(404).json({
                    msg: "Nenhum contrato encontrado."
                })
            } else if (contratoID) {
                const clausulas = await controllerClausula.obterClausulas(contratoID)
                contrato = resultado[0]
                contrato.clausula = clausulas
            } else {
                contrato = resultado
            }

            return res.status(200).json({
                msg: "Dados obtidos com sucesso.",
                contrato
            })

        } catch (erro) {
            console.error("Erro no endpoint de obter dados de contrato(s), erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor."
            })
        }
    },
    // adicionar assinatura do motorista.
    assinarMotorista: async (req: Request, res: Response) => {
        // recebe a imagem webp da assinatura.
        const assinatura = req.file

        // checa pra ver se a imagem da assinatura foi enviada.
        if (!assinatura) {
            return res.status(400).json({
                msg: "Obrigatorio enviar imagem da assinatura."
            })
        }
        // desestruturação
        const motoristaID = req.userId

        // verifica se o motorista já tem uma assinatura cadastrada.
        let possuiAssinatura = false
        try {
            const query = "SELECT * FROM assinatura_motorista WHERE motorista_id = $1"

            const resposta = await database.query<AssinaturaMotorista>(query, [motoristaID])
            const assinaturaMotorista = resposta.rows[0]

            // se ja tiver assinatura, marco que ela já existe pq ai so vamos atualiza-la
            if (assinaturaMotorista) {
                possuiAssinatura = true
            }
        } catch (erro) {
            console.error("erro no endpoint de assinarMotorista ao verificar se motorista já possui assinatura, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }

        // realizar a operação de fato 
        try {
            let query: string

            // se já possuir assinatura, então iremos atualiza-la
            if (possuiAssinatura) {
                query = `
                UPDATE assinatura_motorista
                SET caminho_arquivo = $1, atualizado_em = now()
                WHERE motorista_id = $2
                `
            } else {
                query = `
                INSERT INTO assinatura_motorista (caminho_arquivo, motorista_id)
                VALUES ($1, $2)
                `
            }
            // definindo o caminho da imagem.
            const caminho_imagem = `motoristas/${motoristaID}/assinaturas/${randomUUID()}.webp`

            // cria ou substitui a assinatura original
            await r2.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: caminho_imagem,
                    Body: assinatura.buffer,
                    ContentType: assinatura.mimetype
                })
            )
            // salvando numa constante a localização da imagem da assinatura publica na internet.
            const localizacaoImagem = `${CDN_URL}/${caminho_imagem}`

            // salvando no banco de dados ou fazendo o update
            await database.query(query, [localizacaoImagem, motoristaID])

            // retornando usuario
            return res.status(201).json({
                msg: `Assinatura ${possuiAssinatura ? "Atualizada" : "Criada"} com sucesso.`
            })
        } catch (erro) {
            console.error("erro no endpoint de assinarMotorista ao adicionar assinatura do motorista, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    // endpoint para concluir um contrato, ou seja, dizer q ele está pronto para ser assinado e além disso travar suas modificações.
    concluirContrato: async (req: Request, res: Response) => {
        // pegando o ID do contrato que está concluido.
        const contratoID = req.contratoID

        // pegando ID do motorista
        const motoristaID = req.userId

        // pegando ID do responsavel atribuido aquele contrato
        const responsavelID = req.contratoResponsavelID

        // iniciando a constante da conexão do usuario.
        const cliente = await database.connect()

        // iniciando variavel pra guardar a assinatura do motorista.
        let assinaturaMotorista: AssinaturaMotorista

        // verificando se o motorista já tem assinatura.
        try {
            // iniciando transação.
            await cliente.query('BEGIN')

            // query
            const query = "SELECT * FROM assinatura_motorista WHERE motorista_id = $1"

            const resposta = await cliente.query<AssinaturaMotorista>(query, [motoristaID])
            const assinatura = resposta.rows[0]

            // se ja tiver assinatura, marco que ela já existe pq ai so vamos atualiza-la
            if (!assinatura) {
                return res.status(401).json({
                    msg: "O Motorista precisa ter sua assinatura cadastrada antes de finalizar um contrato."
                })
            } else {
                assinaturaMotorista = assinatura
            }
        } catch (erro) {
            cliente.release()
            console.error("erro no endpoint de Concluir contrato ao verificar se motorista já possui assinatura, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }

        //agr sim vem a operação de vdd, um milhão de querys em um monte de tabelas diferentes, misericordia.

        try {
            // primeiro vamos atualizar o status da tabela contrato de rascunho pra aguardando assinatura.
            const queryStatusContrato = `
            UPDATE contrato
            SET status = $1, atualizado_em = now()
            WHERE id = $2
            `
            await cliente.query(queryStatusContrato, ["AGUARDANDO_ASSINATURA", contratoID])

            // gerando UUID aleatoria que será usado pra identificar tanto o documento tanto o link de assinatura.
            const UUID = randomUUID()

            // agora vamos gerar um documento pra esse contrato.
            const queryCriarDocumento = `
            INSERT INTO contrato_documento
            (hash_documento, versao, contrato_id, responsavel_id, status_documento)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `
            const valoresCriarDocumento = [UUID, 1, contratoID, responsavelID, 'ENVIADO']
            const DocumentoResposta = await cliente.query<ContratoDocumento>(queryCriarDocumento, valoresCriarDocumento)

            const ContratoDocumento = DocumentoResposta.rows[0]!

            // agora vamos gerar o link pro responsavel assinar esse contrato. 
            const queryCriarLink = `
            INSERT INTO link_assinatura
            (token_hash, expira_em, contrato_documento_id, responsavel_id)
            VALUES ($1, now() + INTERVAL '15 days', $2, $3)
            `
            const valoresCriarLink = [UUID, ContratoDocumento.id, responsavelID]

            await cliente.query(queryCriarLink, valoresCriarLink)

            // agora gerar a assinatura do motorista para aquele contrato.
            const queryCriarAssinaturaMotorista = `
            INSERT INTO assinatura_contrato
            (tipo_signatario, assinatura_imagem, contrato_documento_id)
            VALUES ($1, $2, $3)
            `
            const valoresCriarAssinaturaMotorista = ['MOTORISTA', assinaturaMotorista.caminho_arquivo, ContratoDocumento.id]
            await cliente.query(queryCriarAssinaturaMotorista, valoresCriarAssinaturaMotorista)

            // depois de todas essas operações, hora de retornar. 
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Contrato Finalizado com sucesso.",
                link: UUID
            })
        } catch (erro) {
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de Concluir contrato ao processar logica principal para concluir contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            cliente.release()
        }
    }
}
