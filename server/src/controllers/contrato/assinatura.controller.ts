import { Request, Response } from "express";
import type { Contrato } from "../../models/contrato/contrato.model.js";
import type { ContratoDocumento } from "../../models/contrato/contratoDocumento.model.js";
import type { AssinaturaMotorista } from "../../models/contrato/assinatura.model.js";
import type { LinkAssinatura } from "../../models/contrato/linkAssinatura.model.js";
import { Responsavel } from "../../models/responsavel.model.js";
import { database } from "../../db/postgre.js";
import { ParamsSchema } from "../../models/utils.model.js";
import { BUCKET_NAME, CDN_URL, r2 } from "../../db/r2.js";
import { createHash, randomBytes, randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { deletarR2 } from "../../utils/deletarR2.js";
import { obterArquivoR2, obterChaveR2 } from "../../utils/obterArquivoR2.js";
import { assinarContratoPdf } from "../../services/assinaturaPDF.js";

export const controllerAssinatura = {
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
    // controller pro responsavel visualizar o contrato que irá assinar
    visualizarContrato: async (req: Request, res: Response) => {
        // pegando o token do body
        const { token: tokenBruto } = req.params

        // verifica se o token existe
        if(!tokenBruto){
            return res.status(400).json({
                msg: "O Token é necessario para visualizar um contrato."
            })
        }
        // transforma o token no que quer q ele seja em string
        const token = tokenBruto.toString().trim()

        const hashToken = createHash("sha256").update(token).digest("hex")

        //operação
        try{
            // tenta achar registros em que o token hash seja o mesmo, nao tenha sido utilizado ou revogado e que a data de expiração seja maior que a data atual.
            const { rows: linksValidos } = await database.query<LinkAssinatura>(
                `
                SELECT * FROM link_assinatura
                WHERE token_hash = $1 AND utilizado_em IS NULL AND revogado_em IS NULL AND expira_em > now()
                `,
                [hashToken]
            )

            // verifica se achou algum contrato
            if(!linksValidos.length){
                return res.status(404).json({
                    msg: "Nenhum Contrato encontrado com o token fornecido."
                })
            }
            const link = linksValidos[0]!
            
            // pegando os dados do contrato documento
            const { rows: documentos } = await database.query<ContratoDocumento>(
                "SELECT * FROM contrato_documento WHERE id = $1",
                [link.contrato_documento_id]
            )
            const contratoDocumento = documentos[0]!
            const pdf = new URL(contratoDocumento.caminho_arquivo)
            pdf.searchParams.set('v', contratoDocumento.hash_documento)

            // devolvendo o usuario
            return res.status(200).json({
                msg: "Dados Obtidos com Sucesso",
                pdf: pdf.toString(),
                token: token
            })

        }catch(erro){
            console.error("erro no endpoint de visualizar contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
    },
    // controller para o responsável assinar um contrato.
    assinarContrato: async (req: Request, res: Response) => {
        // pegando a imagem do responsavel
        const assinatura = req.file

        // pegando o token
        const { token: tokenBruto } = req.params

        // valida se a assinatura (imagem) foi enviada
        if(!assinatura){
            return res.status(400).json({
                msg: "A Assinatura é necessaria para assinar contrato."
            })
        }

        // valida se token bruto e id do motorista foram enviados
        if(!tokenBruto){
            return res.status(400).json({
                msg: "Token é necessario para assinar contrato."
            })
        }
        // pegando o token e gerando seu hash
        const token = tokenBruto.toString().trim()
        const tokenHash  = createHash('sha256').update(token).digest('hex')

        // iniciando conexão
        const cliente = await database.connect().catch((erro) => {
            console.error("erro ao iniciar conexão ao banco de dados no endpoint de assinar contrato, erro: ", erro)
            return undefined
        })
        if(!cliente){
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
        let key: string | undefined
        let assinaturaEnviada = false
        let pdfOriginal: Buffer | undefined
        let pdfKey: string | undefined
        let pdfSubstituido = false

        // verifica os dados e registra a assinatura na mesma transação
        try{
            // inicia transação
            await cliente.query('BEGIN')

            // trava o contrato antes de verificar o link, como no cancelamento e na recriação do link
            const { rows: [contratoDados] } = await cliente.query<Contrato>(
                `
                SELECT contrato.* FROM contrato
                JOIN contrato_documento AS documento ON documento.contrato_id = contrato.id
                JOIN link_assinatura AS link ON link.contrato_documento_id = documento.id
                WHERE link.token_hash = $1
                FOR UPDATE OF contrato
                `,
                [tokenHash]
            )
            if(!contratoDados){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Contrato não encontrado com o token fornecido."
                })
            }
            if(contratoDados.status !== 'AGUARDANDO_ASSINATURA'){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "Só é possível assinar um contrato que esteja aguardando assinatura."
                })
            }

            // primeiro vou buscar o link assinatura, inclusive com todos aqueles padrões chatos
            const { rows: [LinkAssinatura] } = await cliente.query<LinkAssinatura>(
                `
                SELECT * FROM link_assinatura
                WHERE token_hash = $1 AND revogado_em IS NULL AND utilizado_em IS NULL AND expira_em > now()
                ORDER BY criado_em DESC
                FOR UPDATE
                `,
                [tokenHash]
            )
            // verifico se achou o link
            if(!LinkAssinatura){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Contrato não encontrado com o token fornecido, ou token não é mais válido."
                })
            }
            // agr busco os dados do responsavel
            const { rows: [Responsavel] } = await cliente.query<Responsavel>(
                `
                SELECT * FROM responsavel
                WHERE id = $1
                `,
                [LinkAssinatura.responsavel_id]
            )
            if(!Responsavel){
                throw new Error("Responsável não encontrado")
            }
            // agr busco os dados do contrato documento
            const { rows: [ContratoDocumento] } = await cliente.query<ContratoDocumento>(
                `
                SELECT * FROM contrato_documento
                WHERE id = $1
                FOR UPDATE
                `,
                [LinkAssinatura.contrato_documento_id]
            )
            if(!ContratoDocumento){
                throw new Error("Documento do contrato não encontrado")
            }
            if(ContratoDocumento.status_documento !== 'ENVIADO'){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "O Documento do contrato não está disponível para assinatura."
                })
            }

            // usa o PDF que foi finalizado, preservando o texto e a assinatura do motorista
            pdfOriginal = await obterArquivoR2(ContratoDocumento.caminho_arquivo)
            pdfKey = obterChaveR2(ContratoDocumento.caminho_arquivo)
            const hashOriginal = createHash('sha256').update(pdfOriginal).digest('hex')
            if(hashOriginal !== ContratoDocumento.hash_documento){
                throw new Error("O PDF armazenado não corresponde ao hash do documento.")
            }

            // usa a assinatura registrada para esse documento, sem pegar uma assinatura mais recente do motorista
            const { rows: [assinaturaMotorista] } = await cliente.query<{ assinatura_imagem: string }>(
                "SELECT assinatura_imagem FROM assinatura_contrato WHERE contrato_documento_id = $1 AND tipo_signatario = $2",
                [ContratoDocumento.id, 'MOTORISTA']
            )
            if(!assinaturaMotorista){
                throw new Error("Assinatura do motorista não encontrada para esse documento.")
            }
            const imagemMotorista = await obterArquivoR2(assinaturaMotorista.assinatura_imagem)
            const pdfAssinado = await assinarContratoPdf(pdfOriginal, assinatura.buffer, imagemMotorista)
            const hashDocumento = createHash('sha256').update(pdfAssinado).digest('hex')

            // criando o caminho da assinatura do responsavel
            key = `motoristas/${Responsavel.motorista_id}/responsavel/${Responsavel.id}/assinatura/${randomUUID()}.webp`

            // pegando IP do usuario
            const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
            const userAgent = req.get('User-Agent')

            // atualizando o link assinatura pra marcar como utilizado e além disso registrar coisas
            const atualizacaoLink = await cliente.query(
                `
                UPDATE link_assinatura
                SET utilizado_em = now(), agente_usuario = $1, endereco_ip = $2
                WHERE id = $3 AND utilizado_em IS NULL AND revogado_em IS NULL AND expira_em > now()
                `,
                [userAgent, ip, LinkAssinatura.id]
            )
            if(!atualizacaoLink.rowCount){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "O Link de assinatura não é mais válido."
                })
            }

            // enviando assinatura pro cloudflare
            assinaturaEnviada = true
            await r2.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: assinatura.buffer,
                ContentType: assinatura.mimetype
            }))

            // criando a assinatura do responsavel pro contrato.
            const caminhoArquivo = `${CDN_URL}/${key}`
            await cliente.query(
                `
                INSERT INTO assinatura_contrato
                (tipo_signatario, assinatura_imagem, contrato_documento_id, link_assinatura_id)
                VALUES ($1, $2, $3, $4)
                `,
                ['RESPONSAVEL', caminhoArquivo, ContratoDocumento.id, LinkAssinatura.id]
            )

            // atualizando o contrato documento
            await cliente.query(
                `
                UPDATE contrato_documento
                SET status_documento = $1, hash_documento = $3
                WHERE id = $2
                `,
                ['ASSINADO', ContratoDocumento.id, hashDocumento]
            )

            // atualizando o contrato
            const atualizacaoContrato = await cliente.query(
                `
                UPDATE contrato
                SET status = $1, atualizado_em = now()
                WHERE id = $2 AND status = $3
                `,
                ['ATIVO', ContratoDocumento.contrato_id, 'AGUARDANDO_ASSINATURA']
            )
            if(!atualizacaoContrato.rowCount){
                throw new Error("O Contrato não está mais aguardando assinatura.")
            }

            // sobrepõe o PDF no mesmo caminho do R2, agora com as duas assinaturas
            pdfSubstituido = true
            await r2.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: pdfKey,
                Body: pdfAssinado,
                ContentType: 'application/pdf',
                CacheControl: 'no-store, max-age=0'
            }))

            // commito coisas no banco
            await cliente.query('COMMIT')

            const pdf = new URL(ContratoDocumento.caminho_arquivo)
            pdf.searchParams.set('v', hashDocumento)
            return res.status(200).json({
                msg: "Contrato Assinado.",
                pdf: pdf.toString()
            })

        }catch(erro){
            await cliente.query('ROLLBACK').catch((erro: unknown) => {
                console.error("erro ao reverter a assinatura do contrato, erro: ", erro)
            })
            if(pdfSubstituido && pdfOriginal && pdfKey){
                await r2.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: pdfKey,
                    Body: pdfOriginal,
                    ContentType: 'application/pdf',
                    CacheControl: 'no-store, max-age=0'
                })).catch((erro: unknown) => {
                    console.error("erro ao restaurar o PDF anterior do contrato, erro: ", erro)
                })
            }
            if(assinaturaEnviada && key){
                await deletarR2(key).catch((erro: unknown) => {
                    console.error("erro ao excluir imagem de uma assinatura que não foi concluída, erro: ", erro)
                })
            }
            console.error("erro ao atualizar dados no endpoint de assinar contrato, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }finally{
            cliente.release()
        }
    },
    // função para revogar um link e criar outro
    recriarLink: async (req: Request, res: Response) => {
        // pega o id do contrato dos parametros da requisição
        const idBruto = ParamsSchema.safeParse(req.params)

        // valida
        if(!idBruto.success){
            return res.status(400).json({
                msg: "Um ID válido de contrato deve ser enviado.",
                erro: idBruto.error.format()
            })
        }
        // desestruturação e criação de variaveis
        const { id: ContratoID } = idBruto.data
        const motoristaID = req.userId

        // iniciando conexão
        const cliente = await database.connect().catch((erro: unknown) => {
            console.error("erro ao iniciar conexão ao banco de dados no endpoint de recriar link, erro: ", erro)
            return undefined
        })
        if(!cliente){
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }

        // revoga o link anterior e cria o novo na mesma transação
        try{
            await cliente.query('BEGIN')

            // verifica se o contrato pertence ao motorista e trava ele durante a operação
            const { rows: [contratoDados] } = await cliente.query<Contrato>(
                "SELECT * FROM contrato WHERE id = $1 AND motorista_id = $2 FOR UPDATE",
                [ContratoID, motoristaID]
            )
            if(!contratoDados){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Contrato não encontrado com o ID fornecido."
                })
            }
            if(contratoDados.status !== 'AGUARDANDO_ASSINATURA'){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "Só é possível recriar o link de um contrato que esteja aguardando assinatura."
                })
            }

            // pega o documento mais recente do contrato
            const { rows: [contratoDocumento] } = await cliente.query<ContratoDocumento>(
                `
                SELECT * FROM contrato_documento
                WHERE contrato_id = $1
                ORDER BY gerado_em DESC, id DESC
                LIMIT 1
                FOR UPDATE
                `,
                [ContratoID]
            )
            if(!contratoDocumento){
                await cliente.query('ROLLBACK')
                return res.status(404).json({
                    msg: "Documento do contrato não encontrado."
                })
            }
            if(contratoDocumento.status_documento !== 'ENVIADO'){
                await cliente.query('ROLLBACK')
                return res.status(409).json({
                    msg: "Só é possível recriar o link de um documento que ainda esteja aguardando assinatura."
                })
            }

            // revoga os links anteriores que ainda não foram utilizados ou revogados
            await cliente.query(
                `
                UPDATE link_assinatura
                SET revogado_em = now()
                WHERE contrato_documento_id = $1 AND utilizado_em IS NULL AND revogado_em IS NULL
                `,
                [contratoDocumento.id]
            )

            // gera o token do novo link e salva somente o hash, como na finalização do contrato
            const tokenLink = randomBytes(32).toString("hex")
            const hashLink = createHash("sha256").update(tokenLink).digest("hex")

            await cliente.query(
                `
                INSERT INTO link_assinatura
                (token_hash, expira_em, contrato_documento_id, responsavel_id)
                VALUES ($1, now() + INTERVAL '15 days', $2, $3)
                `,
                [hashLink, contratoDocumento.id, contratoDocumento.responsavel_id]
            )

            await cliente.query('COMMIT')

            return res.status(200).json({
                msg: "Link recriado com sucesso.",
                link: `https://www.movan.org/assinar/${tokenLink}`
            })
        }catch(erro){
            await cliente.query('ROLLBACK')
            console.error("erro no endpoint de recriar link ao revogar o link anterior e criar um novo, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }finally{
            cliente.release()
        }
    },
}
