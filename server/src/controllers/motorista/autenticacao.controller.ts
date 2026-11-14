import { Request, Response } from "express"
import { LoginMotoristaSchema } from "../../models/motorista/motorista.model.js"
import { database } from "../../db/postgre.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { verificarEmailouCNPJouCPF } from "../../utils/motorista/credencial.js"

export const controllerAutenticacao = {
    // Controller para realizar o login do motorista usando CPF, CNPJ ou email
    loginMotorista: async (req: Request, res: Response) => {
        // Dados esperados: senha e CPF, CNPJ ou email
        const dadosBrutos = LoginMotoristaSchema.safeParse(req.body)

        // Validação pra ver se todos os dados são validos
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "LOGIN_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        // Separando os dados já validados em constantes individuais
        const { login, senha } = dadosBrutos.data

        let id: number | undefined // id do usuario encontrado, caso exista.

        try {
            const credencialLogin = login.includes("@") ? login : login.replace(/[^a-z0-9]/gi, "").toUpperCase()
            const tipo = login.includes("@") ? "email" : credencialLogin.length === 11 ? "cpf" : "cnpj"
            id = await verificarEmailouCNPJouCPF(credencialLogin, tipo)
        } catch (erro) {
            console.error("Erro ao encontrar a conta usando e-mail, CPF ou CNPJ no login, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }

        // Se não houver conta para a credencial informada, retorna erro de autenticação.
        if (!id) {
            return res.status(401).json({
                'msg-code': "INVALID_CREDENTIALS"
            })
        }
        let emailVerificado: boolean
        // Pega o hash de senha e a data de exclusão usando o id do usuario e guarda numa variavel
        try {
            const query = "SELECT senha, excluido_em, email_verificado FROM motorista WHERE id = $1"
            const { rows } = await database.query(query, [id])

            const hashNoBanco = rows[0].senha
            const excluido_em: Date | null = rows[0].excluido_em
            emailVerificado = rows[0].email_verificado
            // Compara a senha digitada pelo usuario com a senha salva no banco de dados e retorna true ou false
            const senhaValida = await bcrypt.compare(senha, hashNoBanco)

            if (!senhaValida) {
                return res.status(401).json({
                    'msg-code': "INVALID_CREDENTIALS"
                })
            }
            // verifica se a conta está agendada para exclusão. se sim, cancela.
            if (excluido_em) {
                const query = "UPDATE motorista SET excluido_em = NULL WHERE id = $1"
                await database.query(query, [id])
            }
        } catch (erro) {
            console.error("Erro ao puxar hash de senha salva no banco de dados, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
        // se chegou até aqui, o usuario foi encontrado e sua senha é valida, então só dar seu cookie.
        const segredoJWT = process.env['SEGREDO_JWT']
        if (!segredoJWT) {
            console.error("Segredo JWT ausente nas variáveis de ambiente.")
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
        const token = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })


        //cria uma mensagem com base se está verificado ou não.
        const codigoMensagem = emailVerificado ? "LOGIN_SUCCESS" : "LOGIN_SUCCESS_VERIFICATION_REQUIRED"

        return res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
        }).json({
            'msg-code': codigoMensagem,
            email_verificado: emailVerificado
        })
    },
    // Controller para deslogar o motorista
    deslogarConta: async (req: Request, res: Response) => {
        return res.status(200).clearCookie("token", {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict'
        }).json({
            'msg-code': "LOGOUT_SUCCESS"
        })
    }
}
