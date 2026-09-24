import { Request, Response } from "express"
import { CriarMotoristaSchema, LoginMotoristaSchema, RecuperarSenhaSchema, CodigoRecuperarSenhaSchema, CodigoEditarEmailSchema, DeletarMotoristaSchema, EditarMotoristaSchema, GoogleTokenSchema, CriarMotoristaGoogleSchema } from "../models/motorista.model.js"
import { validarCodigoSchema } from "../models/codigo_verificacao.js"
import { database } from "../db/postgre.js"
import bcrypt from "bcrypt"
import { gerarCodigo } from "../utils/mandarCodigo.js"
import jwt from "jsonwebtoken"
import { OAuth2Client } from 'google-auth-library'

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
// Iniciando o google client do OAuth2, para autenticação
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// Constante global de query para atualizar a data de uso de codigo
const queryAtualizarUsoCodigo = "UPDATE cod_verificacao SET data_uso = now() WHERE id = $1"

const desembalarGoogle = async (token: string) => {
    // interface para tipar a constante de resposta
    interface dadosGoogle {
        email: string | undefined,
        nome: string | undefined,
        token: string | null,
        status: number | null,
        msg: string | null,
        sucesso: boolean,
        googleId: string | null
    }
    const dados: dadosGoogle = {
        email: undefined,
        nome: undefined,
        token: null,
        status: null,
        msg: null,
        sucesso: false,
        googleId: null
    }
    try {
        if (!GOOGLE_CLIENT_ID) throw new Error("Google Client ID ausente.")
        /* manda uma solicitação pros servidores do google 
        para abrir e verificar o token que nós foi passado
        onde token é o código que nos foi passado e audience é o nosso cliente id, internamente
        ele vai validar pra ver se os dois tem a mesma assinatura */
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()

        // checa pra ver se os dados foram obtidos do token, quando o google processou ele. 
        if (!payload) {
            dados.msg = "Token Inválido, expirado ou corrompido."
            dados.status = 401
            return dados
        }

        // checa pra ver se a conta google pertencente a esse token foi verificada.
        if (!payload.email_verified) {
            dados.msg = "Email do Google não verificado."
            dados.status = 403
            return dados
        }
        // separa os dados.
        dados.email = payload.email
        dados.nome = payload.name
        dados.token = token
        dados.googleId = payload.sub
        dados.sucesso = true

        // verificação para ver se todos os dados vieram certos
        if (!dados.email || !dados.nome || !dados.token || !dados.googleId) {
            throw new Error(`Erro ao receber todos os dados necessarios do payload do google`)
        }
        return dados
    } catch (erro) {
        dados.msg = "Token do Google inválido, expirado ou corrompido."
        dados.status = 401
        console.error("Erro ao processar o token do google, erro: ", erro)
        return dados
    }
}
// Função pra verificar email ou cnpj
const verificarEmailouCNPJ = async (dado: string, tipo: "email" | "cnpj") => {
    // verifica se ambos os dados foram enviados
    if (!dado || !tipo) throw new Error("Algum dos dados está faltante")

    try {
        // checando se esse email ja existe no banco de dados
        const query = `SELECT id FROM motorista WHERE ${tipo} = $1`
        const valores = [dado]
        const { rows } = await database.query(query, valores)
        if (rows.length > 0) {
            const id = rows[0].id
            return id
        }
        return undefined
    } catch (erro) {
        throw new Error("Erro ao verificar no Banco de Dados", { cause: erro })
    }
}

const validarCodigo = async (id: number, tipo: "CRIACAO" | "RECUPERACAO" | "ALTERACAO", cod: string, email?: string) => {
    const valores = [id, tipo]

    /* Essa Query gigantesca basicamente pega o codigo mais recente do banco de dados e 
apenas um só dele, E só se tiver o mesmo id do motorista, o mesmo tipo de código 
e se nao for um codigo expirado, ou seja se nao tiver passado 5 minutos */
    const queryCodigoVerificacao = `SELECT id, cod
    FROM cod_verificacao
    WHERE motorista_id = $1 AND tipo = $2 AND (data_criacao + INTERVAL '5 minutes') > NOW() AND data_uso IS NULL
    ORDER BY data_criacao DESC 
    LIMIT 1`
    try {
        const { rows } = await database.query(queryCodigoVerificacao, valores)

        // Se não receber nenhum resultado, nenhum código foi enviado ao usuario.
        if (rows.length < 1) {
            console.log("Nenhum código encontrado para o motorista:", id, "com o tipo:", tipo, "e código:", cod)
            return null
        }
        // salva o hash de codigo numa constante
        const codigoHash = rows[0].cod

        // salva o id do codigo numa variavel
        const idCodigo: number = rows[0].id

        // checa se bate.
        const codigoParaValidar = tipo === "ALTERACAO" ? `${cod}:${email}` : cod
        const codigoValido = await bcrypt.compare(codigoParaValidar, codigoHash)

        // se o codigo não for valido, da um não autorizado pro nosso filhão
        if (!codigoValido) {
            return null
        }
        return idCodigo
    } catch (erro) {
        console.error("Erro na hora de buscar hash no banco de dados, erro:", erro)
        throw new Error("Erro interno do servidor ao verificar sua conta.", { cause: erro })
    }
}
// Criando o Controller do motorista
export const controllerMotorista = {
    // Controller pra criar um novo motorista vulgo usuario
    criarMotorista: async (req: Request, res: Response) => {
        // dados esperados: nome, cnpj, email, senha
        const dadosBrutos = CriarMotoristaSchema.safeParse(req.body)

        //checa se os dados enviados são validos
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para criar a conta.",
                erro: dadosBrutos.error.format()
            });
        }
        // separando os dados
        const { nome, cnpj, email, senha } = dadosBrutos.data

        // Verifica se Email ou CNPJ ja estão cadastrados
        try {
            const responseEmail = await verificarEmailouCNPJ(email, "email")
            if (responseEmail) {
                return res.status(409).json({
                    msg: "E-mail já cadastrado no Movan."
                })
            }
            const responseCnpj = await verificarEmailouCNPJ(cnpj, "cnpj")
            if (responseCnpj) {
                return res.status(409).json({
                    msg: "CNPJ já cadastrado no Movan."
                })
            }
        } catch (erro) {
            console.error("Erro ao verificar se dados ja estão cadastrados, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }

        // transformando em hash a senha original do usuario
        const senhaHash = await bcrypt.hash(senha, 10)

        // eu começo uma transação com o banco de dados pra efetuar multiplas operações que dependam uma da outra.
        const cliente = await database.connect()
        try {
            // inicio a transação
            await cliente.query('BEGIN')

            //salvando arquivos no banco de dados
            const query = "INSERT INTO motorista (nome, cnpj, email, senha) VALUES ($1, $2, $3, $4) RETURNING id"
            const valores = [nome, cnpj, email, senhaHash]

            // finalmente pega os dados e faz o insert no banco de dados
            const { rows } = await cliente.query(query, valores)
            const id = rows[0].id

            // enviar o email com o codigo pro usuario
            const response = await gerarCodigo(email, "CRIACAO", id, cliente)
            if (!response) throw new Error

            // se tudo ocorrer bem, manda de volta e confirmo as alterações
            await cliente.query('COMMIT')
            const segredoJWT = process.env['SEGREDO_JWT']
            if (!segredoJWT) {
                console.error("Segredo JWT Ausente no ENV")
                return res.status(500).json({
                    msg: "Ocorreu um erro interno no servidor."
                })
            }
            const token = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })
            return res.status(201).cookie('token', token, {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
            }).json({
                msg: "Conta criada com sucesso."
            })
        } catch (erro: unknown) {
            // Se não foi possivel enviar o codigo, apaga o usuario
            console.error("Erro na Hora de mandar o codigo, erro:", erro)
            // usa a transação pra dar rollback
            await cliente.query('ROLLBACK')
            if ((erro as { code?: string })?.code === '23505') {
                return res.status(409).json({
                    msg: "E-mail ou CNPJ já cadastrado no Movan."
                })
            }
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        } finally {
            // libero a conexão
            cliente.release()
        }
    },
    // Controller para realizar o login do motorista usando cnpj ou email
    loginMotorista: async (req: Request, res: Response) => {
        // Dados esperados: senha, cnpj ou email
        const dadosBrutos = LoginMotoristaSchema.safeParse(req.body)

        // Validação pra ver se todos os dados são validos
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para fazer login.",
                erro: dadosBrutos.error.format()
            })
        }
        // Separando os dados já validados em constantes individuais
        const { login, senha } = dadosBrutos.data

        let id: number | null // variavel pra guardar o id do usuario encontrado, caso ele seja encontrado.

        try {
            // Com a Credencial de login, primeiro tenta ver se ela é um cnpj e tenta achar algum cliente com esse cnpj
            id = await verificarEmailouCNPJ(login, "cnpj")

            // agora tenta verificar se é um email se não tiver achado nenhuma conta com o cpf
            if (!id) {
                id = await verificarEmailouCNPJ(login, "email")
            }
        } catch (erro) {
            console.error("Erro ao encontrar conta usando email ou cnpj no login, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }

        // Agora que ambos email e cnpj foram checados, se nenhum deles tiver sido verdadeiro é pq o usuario não existe
        if (!id) {
            return res.status(401).json({
                msg: "E-mail, CNPJ ou senha inválidos."
            })
        }
        let verificado:boolean
        // Pega o hash de senha e a data de exclusão usando o id do usuario e guarda numa variavel
        try {
            const query = "SELECT senha, data_exclusao, verificado FROM motorista WHERE id = $1"
            const { rows } = await database.query(query, [id])

            const hashNoBanco = rows[0].senha
            const data_exclusao: Date | null = rows[0].data_exclusao
            verificado = rows[0].verificado
            // Compara a senha digitada pelo usuario com a senha salva no banco de dados e retorna true ou false
            const senhaValida = await bcrypt.compare(senha, hashNoBanco)

            if (!senhaValida) {
                return res.status(401).json({
                    msg: "E-mail, CNPJ ou senha inválidos."
                })
            }
            // verifica se a conta está agendada para exclusão. se sim, cancela.
            if (data_exclusao) {
                const query = "UPDATE motorista SET data_exclusao = NULL WHERE id = $1"
                await database.query(query, [id])
            }
        } catch (erro) {
            console.error("Erro ao puxar hash de senha salva no banco de dados, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
        // se chegou até aqui, o usuario foi encontrado e sua senha é valida, então só dar seu cookie.
        const segredoJWT = process.env['SEGREDO_JWT']
        if (!segredoJWT) {
            console.error("Segredo JWT Ausente no ENV")
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
        const token = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })


        //cria uma mensagem com base se está verificado ou não.
        const mensagem = verificado ? "Login Realizado com Sucesso." : "Login Realizado com Sucesso, Mas verificação necessaria para obter os dados."

        return res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
        }).json({
            msg: mensagem,
            verificado
        })
    },
    // Controller para deslogar o motorista
    deslogarConta: async (req: Request, res: Response) => {
        return res.status(200).clearCookie("token", {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict'
        }).json({
            msg: "Logout realizado com sucesso."
        })
    },
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
                msg: "O tipo do código não foi informado."
            })
        }
        if (tipo !== "CRIACAO" && tipo !== "RECUPERACAO") {
            return res.status(400).json({
                msg: "Tipo de código inválido."
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
                msg: `Código para ${tipo} da conta enviado com sucesso.`
            })
        } catch (erro) {
            console.error("Erro ao enviar código, erro:", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
                msg: "Conta já verificada."
            })
        }

        //checa se o código enviado é valido
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para verificar a conta.",
                erro: dadosBrutos.error.format()
            });
        }
        // separa em uma constante comum
        const { cod } = dadosBrutos.data

        try {
            const idCodigo = await validarCodigo(id, "CRIACAO", cod) //mudei esse nomes porque por algum motivo que nao sei ele tava reclamando disso, já que a norma é nao colocar acento mudei aqui
            if (idCodigo === null) {
                return res.status(400).json({
                    msg: "Código inválido ou expirado."
                })
            }
            // se o usuario chegou até aqui, então o codigo dele é valido, só verificar a conta dele
            const query = "UPDATE motorista SET verificado = $1 WHERE id = $2"
            const valores = [true, id]
            await database.query(query, valores)

            // marca uma data de uso pro codigo antigo
            await database.query(queryAtualizarUsoCodigo, [idCodigo])

            // retorna
            return res.status(200).json({
                msg: "Conta verificada com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao salvar o status de verificado como true no banco de dados, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
                msg: "Dados inválidos para recuperação de senha.",
                erro: dadosBrutos.error.format()
            })
        }
        const { email } = dadosBrutos.data
        // Agora que o usuario chegou aqui, só vamos checar se esse email existe
        try {
            const id = await verificarEmailouCNPJ(email, "email")
            if (!id) {
                return res.status(404).json({
                    msg: "Nenhuma conta encontrada com o e-mail informado."
                })
            }
            // se ja chegou aqui, a conta existe e já temos um id de conta, então hora de enviar o código
            const response = await gerarCodigo(email, "RECUPERACAO", id)
            if (!response) throw new Error("Não foi possível enviar o código de recuperação.")

            // deu tudo certo, só retornar.
            return res.status(200).json({
                msg: "Código de recuperação enviado com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao enviar código para recuperação de conta, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
                msg: "Dados inválidos para alterar o e-mail.",
                erro: dadosBrutos.error.format()
            })
        }
        const { email } = dadosBrutos.data

        try {
            const idEmail = await verificarEmailouCNPJ(email, "email")
            if (idEmail) {
                if (idEmail === id) {
                    return res.status(400).json({
                        msg: "Este já é o seu e-mail atual."
                    })
                }
                return res.status(409).json({
                    msg: "E-mail já cadastrado no Movan."
                })
            }

            const response = await gerarCodigo(email, "ALTERACAO", id)
            if (!response) throw new Error("Não foi possível enviar o código de alteração de e-mail.")

            return res.status(200).json({
                msg: "Código para alteração de e-mail enviado com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao enviar código para alteração de email, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
                msg: "Dados inválidos para recuperação de senha.",
                erro: dadosBrutos.error.format()
            })
        }
        const { email, cod, senha: novaSenha } = dadosBrutos.data

        // checar se o email existe novamente só pra desencargo de consciencia, já que a conta pode ter sido deletada no processo.
        try {
            const id = await verificarEmailouCNPJ(email, "email")
            if (!id) {
                return res.status(404).json({
                    msg: "Nenhuma conta encontrada com o e-mail informado."
                })
            }
            // beleza, conta existe, agora verificar código se bate com o banco de dados. 
            const idCodigo = await validarCodigo(id, "RECUPERACAO", cod)
            if (idCodigo === null) {
                return res.status(400).json({
                    msg: "Código inválido ou expirado."
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
                msg: "Senha alterada com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao salvar senha nova do usuário, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    },
    // controller para efetivar o soft delete da conta.
    deletarConta: async (req: Request, res: Response) => {
        const id = req.userId
        const dadosBrutos = DeletarMotoristaSchema.safeParse(req.body)

        // Checagem basica pra ver se o usuario digitou a senha e se ela é valida
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Senha para excluir a conta ausente ou inválida.",
                erro: dadosBrutos.error.format()
            })
        }
        // separa a senha numa variavel
        const { senha } = dadosBrutos.data

        try {
            // pega o hash de senha do usuario no bd
            const queryBuscarSenha = "SELECT senha FROM motorista WHERE id = $1"
            const valoresBuscarSenha = [id]
            const { rows: ResultadoBuscarSenha } = await database.query(queryBuscarSenha, valoresBuscarSenha)

            if (ResultadoBuscarSenha.length < 1) throw new Error("Não achou nenhum campo com o ID.")
            const senhaHash = ResultadoBuscarSenha[0].senha

            // ve se a senha digitada bate com a senha do banco de dados
            const senhaValida = await bcrypt.compare(senha, senhaHash)

            if (!senhaValida) {
                return res.status(401).json({
                    msg: "Senha inválida."
                })
            }
            // senha valida, então agr so aplicar o delete do garoto
            const queryAplicarDelete = "UPDATE motorista SET data_exclusao = now() WHERE id = $1"
            await database.query(queryAplicarDelete, [id])

            // Data de exclusão colocada (soft delete) ent agora só apagar a sessão dele e retornar
            return res.status(200).clearCookie("token", {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict'
            }).json({
                msg: "Conta agendada para exclusão com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao Deletar conta do usúario, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    },
    // Controller para editar os dados do motorista, como nome, email e cnpj
    editarConta: async (req: Request, res: Response) => {
        // pegando id da requisição como sempre
        const id = req.userId
        
        // tratando os dados usando o mesmo modelo de criação, mas com o metodo partial pra todos os dados virarem opcionais.
        const dadosBrutos = EditarMotoristaSchema.safeParse(req.body)

        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados inválidos para editar a conta.",
                erro: dadosBrutos.error.format()
            })
        }
        // determina se tal dado veio ou não e coloca a clausula dele
        const { nome, email, cnpj, senha, cod } = dadosBrutos.data
        // Inicialização de arrays para conter os campos a serem modificados e seus valores correspondentes
        const campos: string[] = []
        const valores: (string | number)[] = []

        if (nome) {
            campos.push(`nome = $${valores.length + 1}`)
            valores.push(nome)
        }
        if (email) {
            try {
                const idEmail = await verificarEmailouCNPJ(email, "email")
                if (idEmail && idEmail !== id) {
                    return res.status(409).json({
                        msg: "E-mail já cadastrado no Movan."
                    })
                }

                const idCodigo = await validarCodigo(id, "ALTERACAO", cod!, email)
                if (idCodigo === null) {
                    return res.status(400).json({
                        msg: "Código inválido ou expirado."
                    })
                }

                await database.query(queryAtualizarUsoCodigo, [idCodigo])
            } catch (erro) {
                console.error("Erro ao validar código para alterar email, erro: ", erro)
                return res.status(500).json({
                    msg: "Ocorreu um erro interno no servidor."
                })
            }
            campos.push(`email = $${valores.length + 1}`)
            valores.push(email)
        }
        if (cnpj) {
            try {
                // verifica se o cnpj pro qual ele quer trocar não está em uso por outro motorista.
                const idCNPJ = await verificarEmailouCNPJ(cnpj, "cnpj")
                if (idCNPJ && idCNPJ !== id) {
                    return res.status(409).json({
                        msg: "CNPJ já cadastrado no Movan."
                    })
                }
            } catch (erro) {
                console.error("Erro ao verificar CNPJ do motorista, erro: ", erro)
                return res.status(500).json({
                    msg: "Ocorreu um erro interno no servidor."
                })
            }
            campos.push(`cnpj = $${valores.length + 1}`)
            valores.push(cnpj)
        }
        if (senha) {
            campos.push(`senha = $${valores.length + 1}`)

            // transforma a senha em hash
            const senhaHash = await bcrypt.hash(senha, 10)
            valores.push(senhaHash)
        }

        // se nenhum campo tiver sido enviado, manda embora
        if (campos.length < 1) {
            return res.status(400).json({
                msg: "Informe pelo menos um campo para editar a conta."
            })
        }
        try {
            const query = `
            UPDATE motorista
            SET ${campos.join(", ")}
            WHERE id = $${valores.length + 1}
            `
            valores.push(id)
            await database.query(query, valores)

            //se chegou aqui, tudo ocorreu bem. hora de retornar.
            return res.status(200).json({
                msg: campos.length === 1
                    ? "1 campo editado com sucesso."
                    : `${campos.length} campos editados com sucesso.`
            })
        } catch (erro) {
            console.error("Erro ao editar dados do usuario, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    },
    // controller para obter os dados do motorista
    obterDados: async (req: Request, res: Response) => {
        // pega o id e o status de verificado do cookie
        const id = req.userId

        // pega os dados do motorista e envia de volta
        try {
            const query = "SELECT id, nome, email, cnpj, data_exclusao, verificado FROM motorista WHERE id = $1"
            const { rows } = await database.query(query, [id])
            if (rows.length < 1) throw new Error("Nenhum dado retornado.")

            const motorista = rows[0]

            return res.status(200).json({
                msg: "Dados da conta obtidos com sucesso.",
                motorista
            })
        } catch (erro) {
            console.error("Erro ao obter dados do motorista, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    },
    // controller para autenticar o motorista usando o google, caso ele tenha uma conta vinculada ao google, ou criar uma nova conta caso ele não tenha.
    authGoogle: async (req: Request, res: Response) => {
        // Dados Esperados: token jwt enviado pelo google
        const dadosBrutos = GoogleTokenSchema.safeParse(req.body)

        // Validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para autenticar com o google.",
                erro: dadosBrutos.error.format()
            })
        }
        const { token } = dadosBrutos.data
        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                msg: usuario.msg
            })
        }
        // Se chegou aqui, já temos todos os dados do google certinho, então vamos tentar buscar o usuario pelo id google
        try {
            // iniciando variavel booleana pra ver se ja achou o usuario.
            let achouUsuario: boolean = false

            const queryBuscarID = "SELECT id, data_exclusao FROM motorista WHERE google_id = $1"
            const resultadoID = await database.query(queryBuscarID, [usuario.googleId])

            // se tiver achado algo, marca q achou, loga e devolve cookie jwt.
            if (resultadoID.rows.length > 0) {
                // deixa id e data exclusão mais legiveis
                const id = resultadoID.rows[0].id
                const data_exclusao = resultadoID.rows[0].data_exclusao

                //marca que achou usuario
                achouUsuario = true

                // verifica se a conta está agendada para exclusão. se sim, cancela.
                if (data_exclusao) {
                    const query = "UPDATE motorista SET data_exclusao = NULL WHERE id = $1"
                    await database.query(query, [id])
                }
                // se chegou até aqui, o usuario foi encontrado com o google_id então só dar seu cookie.
                const segredoJWT = process.env['SEGREDO_JWT']
                if (!segredoJWT) {
                    console.error("Segredo JWT Ausente no ENV")
                    return res.status(500).json({
                        msg: "Ocorreu um erro interno no servidor."
                    })
                }
                const jwtToken = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })
                return res.status(200).cookie('token', jwtToken, {
                    httpOnly: true,
                    secure: process.env['NODE_ENV'] === 'production',
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
                }).json({
                    msg: "Login realizado com sucesso."
                })
            }

            if (!achouUsuario) {
                // se não achou com o id da google, tenta achar usando o email.
                const queryBuscarEmail = "SELECT id, data_exclusao FROM motorista WHERE email = $1"
                const resultadoEmail = await database.query(queryBuscarEmail, [usuario.email])

                if (resultadoEmail.rows.length > 0) {
                    achouUsuario = true
                    return res.status(409).json({
                        msg: "Conta Encontrada, mas não vinculada ao google."
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
                msg: "Conta não encontrada. iniciando criação de conta com o google.",
                CREATION_REQUIRED: true,
                dadosGoogle: dadosParaCriacao
            })
        } catch (erro) {
            console.error("Erro ao  processar dados usando os dados obtidos pelo google, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
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
                msg: "Dados Inválidos para vincular sua conta google.",
                erro: dadosBrutos.error.format()
            })
        }
        // separação dos dados
        const { token } = dadosBrutos.data

        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                msg: usuario.msg
            })
        }

        // agr que temos os dados, fazer um select para verificar se essa conta google não está vinculada ja e depois vincular
        try {
            const check = await database.query("SELECT id FROM motorista WHERE google_id = $1", [usuario.googleId]);
            if (check.rows.length > 0) {
                return res.status(409).json({ msg: "Esta conta do Google já está vinculada a outro usuário." });
            }
            const query = "UPDATE motorista SET google_id = $1 WHERE id = $2"
            const valores = [usuario.googleId, id]
            await database.query(query, valores)

            // agr com a conta vinculada, só retornar.
            return res.status(200).json({
                msg: "Conta vinculada ao google com sucesso."
            })
        } catch (erro) {
            console.error("Erro ao vincular a conta google do usuario, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    },
    // Controller para criar uma nova conta usando o google.
    criarContaGoogle: async (req: Request, res: Response) => {
        // dados esperados: Nome, email, senha, cnpj e token do google
        const dadosBrutos = CriarMotoristaGoogleSchema.safeParse(req.body)

        // Validação de dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criação da conta.",
                erro: dadosBrutos.error.format()
            })
        }
        /* Edited by Carlos Vinicius
            +RESPECT */
        // separando os dados
        const { nome, cnpj, token, senha } = dadosBrutos.data
        const usuario = await desembalarGoogle(token)
        if (!usuario.sucesso) {
            return res.status(usuario.status!).json({
                msg: usuario.msg
            })
        }
        const { email, googleId } = usuario
        if (!email || !googleId) {
            throw new Error("Email do google não encontrado.")
        }

        // Verifica se Email ou CNPJ ou googleid ja estão cadastrados
        try {
            const responseEmail = await verificarEmailouCNPJ(email, "email")
            if (responseEmail) {
                return res.status(409).json({
                    msg: "E-mail já cadastrado no Movan."
                })
            }
            const responseCnpj = await verificarEmailouCNPJ(cnpj, "cnpj")
            if (responseCnpj) {
                return res.status(409).json({
                    msg: "CNPJ já cadastrado no Movan."
                })
            }
            const check = await database.query("SELECT id FROM motorista WHERE google_id = $1", [usuario.googleId]);
            if (check.rows.length > 0) {
                return res.status(409).json({ msg: "Esta conta do Google já está vinculada a outro usuário." });
            }
        } catch (erro) {
            console.error("Erro ao verificar se dados ja estão cadastrados, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }

        // transformando em hash a senha original do usuario
        const senhaHash = await bcrypt.hash(senha, 10)

        // eu começo uma transação com o banco de dados pra efetuar multiplas operações que dependam uma da outra.
        const cliente = await database.connect()
        try {
            // inicio a transação
            await cliente.query('BEGIN')

            //salvando arquivos no banco de dados
            const query = "INSERT INTO motorista (nome, cnpj, email, senha, google_id, verificado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id"
            const valores = [nome, cnpj, email, senhaHash, googleId, true]

            // finalmente pega os dados e faz o insert no banco de dados
            const { rows } = await cliente.query(query, valores)
            const id = rows[0].id

            // se tudo ocorrer bem, manda de volta e confirmo as alterações
            await cliente.query('COMMIT')
            const segredoJWT = process.env['SEGREDO_JWT']
            if (!segredoJWT) {
                console.error("Segredo JWT Ausente no ENV")
                return res.status(500).json({
                    msg: "Ocorreu um erro interno no servidor."
                })
            }
            const token = jwt.sign({ id }, segredoJWT, { expiresIn: '30d' })
            return res.status(201).cookie('token', token, {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
            }).json({
                msg: "Conta criada com sucesso."
            })
        } catch (erro: unknown) {
            // Se não foi possivel enviar o codigo, apaga o usuario
            console.error("Erro na Hora de mandar o codigo, erro:", erro)
            // usa a transação pra dar rollback
            await cliente.query('ROLLBACK')
            if ((erro as { code?: string })?.code === '23505') {
                return res.status(409).json({
                    msg: "E-mail, CNPJ ou Conta Google já cadastrado no Movan."
                })
            }
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        } finally {
            // libero a conexão
            cliente.release()
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
                msg: "Conta Google Desvinculada com Sucesso."
            })
        } catch (erro) {
            console.error("Erro ao desvincular conta google, erro: ", erro)
            return res.status(500).json({
                msg: "Ocorreu um erro interno no servidor."
            })
        }
    }
}
