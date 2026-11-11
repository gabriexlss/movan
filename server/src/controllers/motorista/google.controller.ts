import { Request, Response } from "express"
import { GoogleTokenSchema, CriarMotoristaGoogleSchema } from "../../models/motorista/google.model.js"
import { database } from "../../db/postgre.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { tipoCredencial, verificarEmailouCNPJouCPF } from "../../utils/motorista/credencial.js"
import { desembalarGoogle } from "../../utils/motorista/google.js"

export const controllerGoogle = {
    // controller para autenticar o motorista usando o google, caso ele tenha uma conta vinculada ao google, ou criar uma nova conta caso ele não tenha.
    authGoogle: async (req: Request, res: Response) => {
        // Dados Esperados: token jwt enviado pelo google
        const dadosBrutos = GoogleTokenSchema.safeParse(req.body)

        // Validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "GOOGLE_AUTH_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        const { token } = dadosBrutos.data
        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                'msg-code': usuario.msgCode
            })
        }
        // Se chegou aqui, já temos todos os dados do google certinho, então vamos tentar buscar o usuario pelo id google
        try {
            // iniciando variavel booleana pra ver se ja achou o usuario.
            let achouUsuario: boolean = false

            const queryBuscarID = "SELECT id, excluido_em FROM motorista WHERE google_id = $1"
            const resultadoID = await database.query(queryBuscarID, [usuario.googleId])

            // se tiver achado algo, marca q achou, loga e devolve cookie jwt.
            if (resultadoID.rows.length > 0) {
                // deixa id e data exclusão mais legiveis
                const id = resultadoID.rows[0].id
                const excluido_em = resultadoID.rows[0].excluido_em

                //marca que achou usuario
                achouUsuario = true

                // verifica se a conta está agendada para exclusão. se sim, cancela.
                if (excluido_em) {
                    const query = "UPDATE motorista SET excluido_em = NULL WHERE id = $1"
                    await database.query(query, [id])
                }
                // se chegou até aqui, o usuario foi encontrado com o google_id então só dar seu cookie.
                const segredoJWT = process.env['SEGREDO_JWT']
                if (!segredoJWT) {
                    console.error("Segredo JWT ausente nas variáveis de ambiente.")
                    return res.status(500).json({
                        'msg-code': "INTERNAL_SERVER_ERROR"
                    })
                }
                const jwtToken = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })
                return res.status(200).cookie('token', jwtToken, {
                    httpOnly: true,
                    secure: process.env['NODE_ENV'] === 'production',
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
                }).json({
                    'msg-code': "GOOGLE_LOGIN_SUCCESS"
                })
            }

            if (!achouUsuario) {
                // se não achou com o id da google, tenta achar usando o email.
                const queryBuscarEmail = "SELECT id FROM motorista WHERE email = $1"
                const resultadoEmail = await database.query(queryBuscarEmail, [usuario.email])

                if (resultadoEmail.rows.length > 0) {
                    achouUsuario = true
                    return res.status(409).json({
                        'msg-code': "GOOGLE_ACCOUNT_NOT_LINKED"
                    })
                }
            }
            // Se não achou nem por google_id nem por email ele não tem conta, iniciando processo de criação de conta.
            const dadosParaCriacao = {
                nome: usuario.nome,
                email: usuario.email,
                token: token,
            }
            return res.status(200).json({
                'msg-code': "GOOGLE_ACCOUNT_CREATION_REQUIRED",
                CREATION_REQUIRED: true,
                dadosGoogle: dadosParaCriacao
            })
        } catch (erro) {
            console.error("Erro ao processar os dados obtidos pelo Google, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Controller para vincular a conta google com a conta do usuario logado.
    vincularGoogle: async (req: Request, res: Response) => {
        // pega id e verificado do cookie
        const id = req.userId

        // dados esperados: token google.
        const dadosBrutos = GoogleTokenSchema.safeParse(req.body)

        // Validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "GOOGLE_LINK_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        // separação dos dados
        const { token } = dadosBrutos.data

        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                'msg-code': usuario.msgCode
            })
        }

        // agr que temos os dados, fazer um select para verificar se essa conta google não está vinculada ja e depois vincular
        try {
            const check = await database.query("SELECT id FROM motorista WHERE google_id = $1", [usuario.googleId]);
            if (check.rows.length > 0) {
                return res.status(409).json({ 'msg-code': "GOOGLE_ACCOUNT_ALREADY_LINKED" });
            }
            const query = "UPDATE motorista SET google_id = $1 WHERE id = $2"
            const valores = [usuario.googleId, id]
            await database.query(query, valores)

            // agr com a conta vinculada, só retornar.
            return res.status(200).json({
                'msg-code': "GOOGLE_ACCOUNT_LINKED"
            })
        } catch (erro) {
            console.error("Erro ao vincular a conta Google do usuário, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Controller para criar uma nova conta usando o google.
    criarContaGoogle: async (req: Request, res: Response) => {
        // dados esperados: nome, senha, CPF ou CNPJ e token do Google
        const dadosBrutos = CriarMotoristaGoogleSchema.safeParse(req.body)

        // Validação de dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "GOOGLE_ACCOUNT_CREATE_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        /* Edited by Carlos Vinicius
            +RESPECT */
        // separando os dados
        const { nome, credencial, token, senha } = dadosBrutos.data
        const tipo = tipoCredencial(credencial)
        if (!tipo) {
            return res.status(400).json({ 'msg-code': "INVALID_DOCUMENT" })
        }
        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                'msg-code': usuario.msgCode
            })
        }
        const { email, googleId } = usuario
        if (!email || !googleId) {
            throw new Error("E-mail do Google não encontrado.")
        }

        // Verifica se email, CPF/CNPJ ou google_id já estão cadastrados.
        try {
            const responseEmail = await verificarEmailouCNPJouCPF(email, "email")
            if (responseEmail) {
                return res.status(409).json({
                    'msg-code': "EMAIL_ALREADY_REGISTERED"
                })
            }
            const responseCredencial = await verificarEmailouCNPJouCPF(credencial, tipo)
            if (responseCredencial) {
                return res.status(409).json({
                    'msg-code': "DOCUMENT_ALREADY_REGISTERED"
                })
            }
            const check = await database.query("SELECT id FROM motorista WHERE google_id = $1", [usuario.googleId]);
            if (check.rows.length > 0) {
                return res.status(409).json({ 'msg-code': "GOOGLE_ACCOUNT_ALREADY_LINKED" });
            }
        } catch (erro) {
            console.error("Erro ao verificar se os dados já estão cadastrados, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }

        // transformando em hash a senha original do usuario
        const senhaHash = await bcrypt.hash(senha, 10)

        try {
            const query = `INSERT INTO motorista (nome, ${tipo}, email, senha, tipo_pessoa, google_id, email_verificado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`
            const valores = [nome, credencial, email, senhaHash, tipo === "cpf" ? "PF" : "PJ", googleId, true]
            const { rows } = await database.query(query, valores)
            const id = rows[0].id

            const segredoJWT = process.env['SEGREDO_JWT']
            if (!segredoJWT) {
                console.error("Segredo JWT ausente nas variáveis de ambiente.")
                return res.status(500).json({
                    'msg-code': "INTERNAL_SERVER_ERROR"
                })
            }
            const token = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })
            return res.status(201).cookie('token', token, {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
            }).json({
                'msg-code': "ACCOUNT_CREATED"
            })
        } catch (erro: unknown) {
            console.error("Erro ao criar conta com Google:", erro)
            if ((erro as { code?: string })?.code === '23505') {
                return res.status(409).json({
                    'msg-code': "GOOGLE_ACCOUNT_ALREADY_REGISTERED"
                })
            }
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Controller para desvincular a conta google da conta do usuario logado.
    desvincularGoogle: async (req: Request, res: Response) => {
        // pegando id do cookie
        const id = req.userId

        try {
            // atualizando o google_id do motorista pra null.
            const query = "UPDATE motorista SET google_id = null WHERE id = $1"
            await database.query(query, [id])

            //retornando usuario
            return res.status(200).json({
                'msg-code': "GOOGLE_ACCOUNT_UNLINKED"
            })
        } catch (erro) {
            console.error("Erro ao desvincular a conta Google, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    }
}
