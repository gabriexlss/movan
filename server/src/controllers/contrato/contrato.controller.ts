import { Request, Response } from "express";
import { CancelarContratoSchema, CriarContratoSchema, EditarContratoSchema } from "../../models/contrato/contrato.model.js";
import type { Contrato } from "../../models/contrato/contrato.model.js";
import type { ContratoDocumento } from "../../models/contrato/contratoDocumento.model.js";
import type { ContratoView } from "../../models/contrato/contratoView.model.js";
import { database } from "../../db/postgre.js";
import { possuiCodigoPostgres } from "../../utils/erroBanco.js";
import { atualizarClausulasContrato } from "../../utils/atualizarClausulasContrato.js";
import { ContratoParamsSchema, ParamsSchema } from "../../models/utils.model.js";
import { controllerClausula } from "./clausula.controller.js";
import type { AssinaturaMotorista } from "../../models/contrato/assinatura.model.js";
import { BUCKET_NAME, CDN_URL, r2 } from "../../db/r2.js";
import { createHash, randomBytes, randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ClausulaMuitoLongaError, gerarContratoPdf } from "../../services/gerarPDF.js";
import { Clausula } from "../../models/contrato/clausula.model.js";
import { Motorista } from "../../models/motorista.model.js";
import { obterArquivoR2 } from "../../utils/obterArquivoR2.js";
import { deletarR2 } from "../../utils/deletarR2.js";

const substituirDadosClausula = (texto: string, substituicoes: Record<string, string>) => {
    // Percorre o objeto trocando tudo no texto
    for (const [busca, troca] of Object.entries(substituicoes)) {
        texto = texto.replaceAll(busca, troca);
    }
    return texto
}

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
    // endpoint para concluir um contrato, ou seja, dizer q ele está pronto para ser assinado e além disso travar suas modificações.
    concluirContrato: async (req: Request, res: Response) => {
        // pegando o ID do contrato que está concluido.
        const contratoID = req.contratoID

        // pegando ID do motorista
        const motoristaID = req.userId

        // pegando ID do responsavel atribuido aquele contrato
        const responsavelID = req.contratoResponsavelID

        // iniciando a constante da conexão do usuario.
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("erro ao iniciar conexão no endpoint de concluir contrato, erro: ", erro)
            return undefined
        })
        if(!cliente){
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
        const key = `motoristas/${motoristaID}/contrato/${randomUUID()}.pdf`
        let pdfEnviado = false

        // verificando se o motorista já tem assinatura.
        try {
            // iniciando transação.
            await cliente.query('BEGIN')

            const { rows: [assinaturaMotorista] } = await cliente.query<AssinaturaMotorista>(
                "SELECT * FROM assinatura_motorista WHERE motorista_id = $1",
                [motoristaID]
            )
            if (!assinaturaMotorista) {
                await cliente.query('ROLLBACK')
                return res.status(401).json({
                    msg: "O Motorista precisa ter sua assinatura cadastrada antes de finalizar um contrato."
                })
            }

            // primeiro vamos atualizar o status da tabela contrato de rascunho pra aguardando assinatura.
            const atualizacao = await cliente.query(
                `
                UPDATE contrato
                SET status = $1, atualizado_em = now()
                WHERE id = $2 AND motorista_id = $3 AND status = $4
                `,
                ["AGUARDANDO_ASSINATURA", contratoID, motoristaID, 'RASCUNHO']
            ) 
            if(!atualizacao.rowCount){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "Só é possível finalizar um contrato que esteja em rascunho."
                })
            }

            // agora vamos gerar um documento pra esse contrato.
            //primeiro vamos criar o PDF
            const { rows: contratos } = await cliente.query<ContratoView>( // pegando os dados necessarios para criar ele
                "SELECT * FROM vw_detalhes_contrato WHERE motorista_id = $1 AND contrato_id = $2",
                [motoristaID, contratoID]
            )
            const DadosContrato = contratos[0]
            if (!DadosContrato) {
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Detalhes do contrato não encontrados para gerar o documento."
                })
            }
            // pegar dados do motorista que são necessarios pro contrato
            const { rows: Motorista } = await cliente.query<Pick<Motorista, "nome" | "credencial">>(
                "SELECT nome, COALESCE(cpf, cnpj) AS credencial FROM motorista WHERE id = $1",
                [motoristaID]
            )
            const DadosMotorista = Motorista[0]!
            // agr pegar os dados da clausula
            const Clausulas = await controllerClausula.obterClausulas(contratoID)

            // as substituições que vão ser feitas no texto das clausulas originais pelo seu valor definitivo
            const substituicoes: Record<string, string> = {
                // Cláusula 1 - Valor e pagamento
                "{{contrato_valor_mensal}}": `${DadosContrato.valor_mensal}`,
                "{{contrato_dia_vencimento}}": `${DadosContrato.dia_vencimento}`,

                // Cláusula 2 - Objeto e prestação do serviço
                "{{motorista_nome}}": `${DadosMotorista.nome}`,
                "{{motorista_documento}}": `${DadosMotorista.credencial}`,
                "{{aluno_nome}}": `${DadosContrato.nome_aluno}`,
                "{{responsavel_nome}}": `${DadosContrato.nome_responsavel}`,
                "{{responsavel_cpf}}": `${DadosContrato.cpf_responsavel}`,
                "{{escola_nome}}": `${DadosContrato.nome_escola}`,
                "{{escola_endereco}}": `${DadosContrato.endereco_escola}`,
                "{{aluno_endereco}}": `${DadosContrato.endereco_aluno}`,
                "{{contrato_periodo}}": `${DadosContrato.data_inicio.toLocaleDateString("pt-BR")} a ${DadosContrato.data_fim.toLocaleDateString("pt-BR")}`,
            };

            // chamando a função que vai efetivamente realizar essa troca
            const clausulasFinais: Clausula[] = Clausulas.map(c => {
                const conteudoSubstituido = substituirDadosClausula(c.conteudo, substituicoes)
                const ClausulaSubstituida: Clausula = {
                    ...c,
                    conteudo: conteudoSubstituido
                }
                return ClausulaSubstituida
            })
            // criando objeto final
            const ContratoeClausulas = {
                ...DadosContrato,
                clausulas: clausulasFinais,
                nome_motorista: DadosMotorista.nome,
                assinatura_motorista: await obterArquivoR2(assinaturaMotorista.caminho_arquivo)
            }
            const PDFBuffer = await gerarContratoPdf(ContratoeClausulas)

            // agr vamos gerar um token sha256 que será usado pra identificar o documento. ou seja, se for o mesmo documento vai gerar o mesmo código, mas se alguem modificar o documento o codigo será diferente.
            const hashDocumento = createHash("sha256").update(PDFBuffer).digest("hex")

            // informando o caminho do pdf no bucket e na internet.
            const localizacaoPDF = `${CDN_URL}/${key}`
            // hora de enviar esse pdf pro cloudflare
            pdfEnviado = true
            await r2.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: PDFBuffer,
                    ContentType: 'application/pdf',
                    CacheControl: 'no-store, max-age=0'
                })
            )

            // criando o documento do contrato
            const DocumentoResposta = await cliente.query<ContratoDocumento>(
                `
                INSERT INTO contrato_documento
                (hash_documento, caminho_arquivo, contrato_id, responsavel_id, status_documento, versao)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                `,
                [hashDocumento, localizacaoPDF, contratoID, responsavelID, 'ENVIADO', 1]
            )

            const ContratoDocumento = DocumentoResposta.rows[0]!

            // agora vamos gerar o link pro responsavel assinar esse contrato. 
            // gerando o token do link
            const tokenLink = randomBytes(32).toString("hex")
            // gerando um hash sha256
            const hashLink = createHash("sha256").update(tokenLink).digest("hex");

            // inserindo no banco de dados
            await cliente.query(
                `
                INSERT INTO link_assinatura
                (token_hash, expira_em, contrato_documento_id, responsavel_id)
                VALUES ($1, now() + INTERVAL '15 days', $2, $3)
                `, 
                [hashLink, ContratoDocumento.id, responsavelID]
            )

            // agora gerar a assinatura do motorista para aquele contrato.
            await cliente.query(
                `
                INSERT INTO assinatura_contrato
                (tipo_signatario, assinatura_imagem, contrato_documento_id)
                VALUES ($1, $2, $3)
                `,
                ['MOTORISTA', assinaturaMotorista.caminho_arquivo, ContratoDocumento.id]
            )

            // depois de todas essas operações, hora de retornar. 
            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Contrato Finalizado com sucesso.",
                link: `https://www.movan.org/assinar/${tokenLink}`
            })
        } catch (erro) {
            await cliente.query('ROLLBACK').catch((erro: unknown) => {
                console.error("erro ao reverter a finalização do contrato, erro: ", erro)
            })
            if(pdfEnviado){
                await deletarR2(key).catch((erro: unknown) => {
                    console.error("erro ao excluir PDF de um contrato que não foi finalizado, erro: ", erro)
                })
            }
            if(erro instanceof ClausulaMuitoLongaError){
                return res.status(400).json({
                    msg: erro.message
                })
            }
            console.error("erro no endpoint de Concluir contrato ao processar logica principal para concluir contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        } finally {
            cliente.release()
        }
    },
    // controller para cancelar um contrato ativo ou aguardando assinatura
    cancelarContrato: async (req: Request, res: Response) => {
        // recebe o id do contrato e o motivo do cancelamento
        const idBruto = ContratoParamsSchema.safeParse(req.params)
        const dadosBrutos = CancelarContratoSchema.safeParse(req.body)

        if(!idBruto.success){
            return res.status(400).json({
                msg: "Um ID válido de contrato deve ser enviado.",
                erro: idBruto.error.format()
            })
        }
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados inválidos para cancelar o contrato.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação
        const { contrato_id: contratoID } = idBruto.data
        const { motivo_cancelamento } = dadosBrutos.data
        const motoristaID = req.userId

        // iniciando conexão
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("erro ao iniciar conexão ao banco de dados no endpoint de cancelar contrato, erro: ", erro)
            return undefined
        })
        if(!cliente){
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }

        try{
            await cliente.query('BEGIN')

            // verifica se o contrato pertence ao motorista e trava ele durante a operação
            const { rows: [contratoDados] } = await cliente.query<Contrato>(
                "SELECT * FROM contrato WHERE id = $1 AND motorista_id = $2 FOR UPDATE",
                [contratoID, motoristaID]
            )
            if(!contratoDados){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Contrato não encontrado com o ID fornecido."
                })
            }
            if(contratoDados.status !== 'ATIVO' && contratoDados.status !== 'AGUARDANDO_ASSINATURA'){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "Só é possível cancelar um contrato ativo ou aguardando assinatura."
                })
            }

            // registra o cancelamento do contrato
            await cliente.query(
                `
                UPDATE contrato
                SET status = $1, cancelado_em = now(), motivo_cancelamento = $2, atualizado_em = now()
                WHERE id = $3 AND motorista_id = $4
                `,
                ['CANCELADO', motivo_cancelamento, contratoID, motoristaID]
            )

            // revoga os links pendentes de todos os documentos desse contrato
            await cliente.query(
                `
                UPDATE link_assinatura
                SET revogado_em = now()
                WHERE contrato_documento_id IN (SELECT id FROM contrato_documento WHERE contrato_id = $1)
                AND utilizado_em IS NULL AND revogado_em IS NULL
                `,
                [contratoID]
            )

            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Contrato cancelado com sucesso."
            })
        }catch(erro){
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de cancelar contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }finally{
            cliente.release()
        }
    },
}
