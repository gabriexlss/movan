import { Request, Response } from "express"
import { RecuperarSenhaSchema, CodigoRecuperarSenhaSchema, CodigoEditarEmailSchema } from "../../models/motorista/senha.model.js"
import { validarCodigoSchema } from "../../models/codigo_verificacao.js"
import { database } from "../../db/postgre.js"
import bcrypt from "bcrypt"
import { gerarCodigo } from "../../utils/mandarCodigo.js"
import { verificarEmailouCNPJouCPF } from "../../utils/motorista/credencial.js"
import { queryAtualizarUsoCodigo, validarCodigo } from "../../utils/motorista/codigo.js"

export const controllerCodigo = {
    // rota para pegar o id do usuario logado e o tipo de codigo que ele quer receber (por enquanto somente criação)
    enviarCodigo: async (req: Request, res: Response) => {
        const id = req.userId

        // pega o tipo de codigo que ele quer enviar por meio dos parametros da rota (ex: /motorista/codigo/criação)
        // temporariamente só aceita criação, então está hardcodado
        // so deixei o codigo aqui pra caso algum dia eu precise.
        const tipo = "CRIACAO"

        // se o tipo não for indicado ou não for nem criação ou recuperação, dá erro de bad request
        if (!tipo) {
            return res.status(400).json({
                'msg-code': "VERIFICATION_CODE_TYPE_MISSING"
            })
        }
        if (tipo !== "CRIACAO" && tipo !== "RECUPERACAO") {
            return res.status(400).json({
                'msg-code': "VERIFICATION_CODE_TYPE_INVALID"
            })
        }
        try {
            // pega o email do motorista por meio do ID
            const query = "SELECT email FROM motorista WHERE id = $1"
            const { rows } = await database.query(query, [id])
            // coloca o email na constante email
            const email = rows[0].email
            // manda o codigo pro usuario e gera e salva o codigo no banco de dados
            const response = await gerarCodigo(email, tipo, id)
            if (!response) throw new Error("Não foi possível enviar o código de verificação.")
            return res.status(200).json({
                'msg-code': "VERIFICATION_CODE_SENT"
            })
        } catch (erro) {
            console.error("Erro ao enviar código, erro:", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // rota para verificar a conta do motorista
    verificarConta: async (req: Request, res: Response) => {
        const dadosBrutos = validarCodigoSchema.safeParse(req.body)
        const id = req.userId
        const verificado = req.verificado

        // Verifica se a conta já foi verificada anteriormente, se sim, não tem motivo para ser verificada dnv
        if (verificado) {
            return res.status(409).json({
                'msg-code': "ACCOUNT_ALREADY_VERIFIED"
            })
        }

        //checa se o código enviado é valido
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "VERIFICATION_CODE_INVALID_DATA",
                erro: dadosBrutos.error.format()
            });
        }
        // separa em uma constante comum
        const { cod } = dadosBrutos.data

        try {
            const idCodigo = await validarCodigo(id, "CRIACAO", cod) //mudei esse nomes porque por algum motivo que nao sei ele tava reclamando disso, já que a norma é nao colocar acento mudei aqui
            if (idCodigo === null) {
                return res.status(400).json({
                    'msg-code': "VERIFICATION_CODE_INVALID_OR_EXPIRED"
                })
            }
            // se o usuario chegou até aqui, então o codigo dele é valido, só verificar a conta dele
            const query = "UPDATE motorista SET email_verificado = $1 WHERE id = $2"
            const valores = [true, id]
            await database.query(query, valores)

            // marca uma data de uso pro codigo antigo
            await database.query(queryAtualizarUsoCodigo, [idCodigo])

            // retorna
            return res.status(200).json({
                'msg-code': "ACCOUNT_VERIFIED"
            })
        } catch (erro) {
            console.error("Erro ao salvar o status de verificado como true no banco de dados, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Rota para recuperar a senha do usúario usando o código e o email
    enviarCodigoRecuperarSenha: async (req: Request, res: Response) => {
        // pega os dados do body
        const dadosBrutos = CodigoRecuperarSenhaSchema.safeParse(req.body)

        //Validação
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "PASSWORD_RECOVERY_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        const { email } = dadosBrutos.data
        // Agora que o usuario chegou aqui, só vamos checar se esse email existe
        try {
            const id = await verificarEmailouCNPJouCPF(email, "email")
            if (!id) {
                return res.status(404).json({
                    'msg-code': "ACCOUNT_NOT_FOUND_BY_EMAIL"
                })
            }
            // se ja chegou aqui, a conta existe e já temos um id de conta, então hora de enviar o código
            const response = await gerarCodigo(email, "RECUPERACAO", id)
            if (!response) throw new Error("Não foi possível enviar o código de recuperação.")

            // deu tudo certo, só retornar.
            return res.status(200).json({
                'msg-code': "RECOVERY_CODE_SENT"
            })
        } catch (erro) {
            console.error("Erro ao enviar código para recuperação de conta, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Rota para enviar um código para o novo email antes de alterá-lo.
    enviarCodigoEditarEmail: async (req: Request, res: Response) => {
        const id = req.userId
        const dadosBrutos = CodigoEditarEmailSchema.safeParse(req.body)

        // verifica se os dados são validos
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "EMAIL_CHANGE_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        const { email } = dadosBrutos.data

        try {
            const idEmail = await verificarEmailouCNPJouCPF(email, "email")
            if (idEmail) {
                if (idEmail === id) {
                    return res.status(400).json({
                        'msg-code': "EMAIL_UNCHANGED"
                    })
                }
                return res.status(409).json({
                    'msg-code': "EMAIL_ALREADY_REGISTERED"
                })
            }

            const response = await gerarCodigo(email, "ALTERACAO", id)
            if (!response) throw new Error("Não foi possível enviar o código de alteração de e-mail.")

            return res.status(200).json({
                'msg-code': "EMAIL_CHANGE_CODE_SENT"
            })
        } catch (erro) {
            console.error("Erro ao enviar o código para alteração de e-mail, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Rota para verificar o código de recuperação de senha e permitir que o usuário altere a senha
    recuperarSenha: async (req: Request, res: Response) => {
        // dados esperados: email, cod, nova senha
        const dadosBrutos = RecuperarSenhaSchema.safeParse(req.body)

        // Validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "PASSWORD_RECOVERY_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        const { email, cod, senha: novaSenha } = dadosBrutos.data

        // checar se o email existe novamente só pra desencargo de consciencia, já que a conta pode ter sido deletada no processo.
        try {
            const id = await verificarEmailouCNPJouCPF(email, "email")
            if (!id) {
                return res.status(404).json({
                    'msg-code': "ACCOUNT_NOT_FOUND_BY_EMAIL"
                })
            }
            // beleza, conta existe, agora verificar código se bate com o banco de dados. 
            const idCodigo = await validarCodigo(id, "RECUPERACAO", cod)
            if (idCodigo === null) {
                return res.status(400).json({
                    'msg-code': "VERIFICATION_CODE_INVALID_OR_EXPIRED"
                })
            }
            // Se chegou até aqui, o codigo é valido, só substituir a senha antiga pela nova.
            // transformando em hash a senha original do usuario
            const senhaHash = await bcrypt.hash(novaSenha, 10)

            // atualiza a senha do motorista
            const query = "UPDATE motorista SET senha = $1 WHERE id = $2"
            const valores = [senhaHash, id]
            await database.query(query, valores)

            // marca uma data de uso pro codigo antigo
            const valorCodigo = [idCodigo]
            await database.query(queryAtualizarUsoCodigo, valorCodigo)

            // senha recuperada. só retornar
            return res.status(200).json({
                'msg-code': "PASSWORD_CHANGED"
            })
        } catch (erro) {
            console.error("Erro ao salvar senha nova do usuário, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    }
}
