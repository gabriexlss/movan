import { Request, Response } from "express"
import { CriarMotoristaSchema, DeletarMotoristaSchema, EditarMotoristaSchema, compararSenhaSchema } from "../../models/motorista/motorista.model.js"
import { database } from "../../db/postgre.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cpf, cnpj } from "cpf-cnpj-validator"
import { tipoCredencial, verificarEmailouCNPJouCPF } from "../../utils/motorista/credencial.js"
import { queryAtualizarUsoCodigo, validarCodigo } from "../../utils/motorista/codigo.js"

export const controllerConta = {
    // Controller pra criar um novo motorista vulgo usuario
    criarMotorista: async (req: Request, res: Response) => {
        // dados esperados: nome, credencial (CPF ou CNPJ), email, senha
        const dadosBrutos = CriarMotoristaSchema.safeParse(req.body)

        //checa se os dados enviados são validos
        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "ACCOUNT_CREATE_INVALID_DATA",
                erro: dadosBrutos.error.format()
            });
        }
        // separando os dados
        const { nome, credencial, email, senha } = dadosBrutos.data

        // verifica se oq veio foi cpf ou cnpj
        let metodo: "cnpj" | "cpf"
        if (credencial.length === 14) {
            metodo = 'cnpj'
        } else if (credencial.length === 11) {
            metodo = 'cpf'
        } else {
            return res.status(400).json({
                'msg-code': "INVALID_CREDENTIAL"
            })
        }
        if (metodo === 'cnpj') {
            const cnpjIsValid = cnpj.isValid(credencial)
            if (!cnpjIsValid) {
                return res.status(400).json({
                    'msg-code': "INVALID_CNPJ"
                })
            }
        } else if (metodo === 'cpf') {
            const cpfIsValid = cpf.isValid(credencial)
            if (!cpfIsValid) {
                return res.status(400).json({
                    'msg-code': "INVALID_CPF"
                })
            }
        }

        // Verifica se Email ou CNPJ ou CPF ja estão cadastrados
        try {
            const responseEmail = await verificarEmailouCNPJouCPF(email, "email")
            if (responseEmail) {
                return res.status(409).json({
                    'msg-code': "EMAIL_ALREADY_REGISTERED"
                })
            }
            // aqui verifica pelo metódo se ou o email ou o cnpj ja estão cadastrados.
            const responseCredencial = await verificarEmailouCNPJouCPF(credencial, metodo)
            if (responseCredencial) {
                return res.status(409).json({
                    'msg-code': metodo === 'cnpj' ? "CNPJ_ALREADY_REGISTERED" : "CPF_ALREADY_REGISTERED"
                })
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
            //salvando arquivos no banco de dados
            const query = `INSERT INTO motorista (nome, ${metodo === "cnpj" ? 'cnpj' : 'cpf'}, email, senha, tipo_pessoa, email_verificado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
            const valores: (string | boolean)[] = [nome, credencial, email, senhaHash]

            if (metodo === 'cnpj') {
                valores.push('PJ')
            } else if (metodo === 'cpf') {
                valores.push('PF')
            }
            valores.push(false)

            // finalmente pega os dados e faz o insert no banco de dados
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
            console.error("Erro ao criar conta do motorista:", erro)
            if ((erro as { code?: string })?.code === '23505') {
                return res.status(409).json({
                    'msg-code': "ACCOUNT_ALREADY_REGISTERED"
                })
            }
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
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
                'msg-code': "ACCOUNT_DELETE_INVALID_DATA",
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

            if (ResultadoBuscarSenha.length < 1) throw new Error("Nenhum registro encontrado com o ID informado.")
            const senhaHash = ResultadoBuscarSenha[0].senha

            // ve se a senha digitada bate com a senha do banco de dados
            const senhaValida = await bcrypt.compare(senha, senhaHash)

            if (!senhaValida) {
                return res.status(401).json({
                    'msg-code': "INVALID_PASSWORD"
                })
            }
            // senha valida, então agr so aplicar o delete do garoto
            const queryAplicarDelete = "UPDATE motorista SET excluido_em = now() WHERE id = $1"
            await database.query(queryAplicarDelete, [id])

            // Data de exclusão colocada (soft delete) ent agora só apagar a sessão dele e retornar
            return res.status(200).cookie("token", "", {
                httpOnly: true,
                secure: process.env['NODE_ENV'] === 'production',
                sameSite: 'strict',
                expires: new Date(0),
                maxAge: 0
            }).json({
                'msg-code': "ACCOUNT_DELETE_SCHEDULED"
            })
        } catch (erro) {
            console.error("Erro ao excluir a conta do usuário, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // Controller para editar os dados do motorista, como nome, email e CPF/CNPJ
    editarConta: async (req: Request, res: Response) => {
        // pegando id da requisição como sempre
        const id = req.userId

        // tratando os dados usando o mesmo modelo de criação, mas com o metodo partial pra todos os dados virarem opcionais.
        const dadosBrutos = EditarMotoristaSchema.safeParse(req.body)

        if (!dadosBrutos.success) {
            return res.status(400).json({
                'msg-code': "ACCOUNT_EDIT_INVALID_DATA",
                erro: dadosBrutos.error.format()
            })
        }
        // determina se tal dado veio ou não e coloca a clausula dele
        const { nome, email, credencial, senha, cod, senhaAtual } = dadosBrutos.data
        // Inicialização de arrays para conter os campos a serem modificados e seus valores correspondentes
        const campos: string[] = []
        const valores: (string | number)[] = []
        let idCodigoEmail: number | undefined

        if (nome) {
            campos.push(`nome = $${valores.length + 1}`)
            valores.push(nome)
        }
        if (email) {
            try {
                const idEmail = await verificarEmailouCNPJouCPF(email, "email")
                if (idEmail && idEmail !== id) {
                    return res.status(409).json({
                        'msg-code': "EMAIL_ALREADY_REGISTERED"
                    })
                }

                const idCodigo = await validarCodigo(id, "ALTERACAO", cod!, email)
                if (idCodigo === null) {
                    return res.status(400).json({
                        'msg-code': "VERIFICATION_CODE_INVALID_OR_EXPIRED"
                    })
                }
                idCodigoEmail = idCodigo
            } catch (erro) {
                console.error("Erro ao validar o código para alterar o e-mail, erro: ", erro)
                return res.status(500).json({
                    'msg-code': "INTERNAL_SERVER_ERROR"
                })
            }
            campos.push(`email = $${valores.length + 1}`)
            valores.push(email)
        }
        if (credencial !== undefined) {
            const tipo = tipoCredencial(credencial)
            if (!tipo) {
                return res.status(400).json({ 'msg-code': "INVALID_DOCUMENT" })
            }
            try {
                const idCredencial = await verificarEmailouCNPJouCPF(credencial, tipo)
                if (idCredencial && idCredencial !== id) {
                    return res.status(409).json({
                        'msg-code': "DOCUMENT_ALREADY_REGISTERED"
                    })
                }
            } catch (erro) {
                console.error("Erro ao verificar CPF ou CNPJ do motorista, erro: ", erro)
                return res.status(500).json({
                    'msg-code': "INTERNAL_SERVER_ERROR"
                })
            }
            campos.push(`${tipo} = $${valores.length + 1}`)
            valores.push(credencial)
            campos.push(`${tipo === "cpf" ? "cnpj" : "cpf"} = NULL`)
            campos.push(`tipo_pessoa = $${valores.length + 1}`)
            valores.push(tipo === "cpf" ? "PF" : "PJ")
        }
        if (senha) {
            campos.push(`senha = $${valores.length + 1}`)

            // verifica se a senha atual bate com a senha do usuario.
            try {
                // pegando o hash da senha do usuario do banco de dados
                const query = "SELECT senha FROM motorista WHERE id = $1"
                const { rows: senhaColuna } = await database.query(query, [id])

                // atribuindo a senha a uma constante
                const senhaUsuario = senhaColuna[0].senha

                // valida se a senha digitada é de fato a senha valida.
                const senhaValida = await bcrypt.compare(senhaAtual ?? "ojvnervoi", senhaUsuario)

                if (!senhaValida) {
                    return res.status(401).json({
                        'msg-code': "INVALID_PASSWORD"
                    })
                }

                // transforma a senha em hash
                const senhaHash = await bcrypt.hash(senha, 10)
                valores.push(senhaHash)
            } catch (erro) {
                console.error("erro no endpoint de editar motorista ao validar senha para troca-lá, erro: ", erro)
                return res.status(500).json({
                    'msg-code': "INTERNAL_SERVER_ERROR"
                })
            }
        }

        // se nenhum campo tiver sido enviado, manda embora
        if (campos.length < 1) {
            return res.status(400).json({
                'msg-code': "ACCOUNT_EDIT_REQUIRES_FIELD"
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
            if (idCodigoEmail !== undefined) {
                await database.query(queryAtualizarUsoCodigo, [idCodigoEmail])
            }

            //se chegou aqui, tudo ocorreu bem. hora de retornar.
            const camposEditados = [nome, email, credencial, senha].filter((valor) => valor !== undefined).length
            return res.status(200).json({
                'msg-code': camposEditados === 1
                    ? "ACCOUNT_EDITED_ONE_FIELD"
                    : `ACCOUNT_EDITED_${camposEditados}_FIELDS`
            })
        } catch (erro) {
            console.error("Erro ao editar os dados do usuário, erro: ", erro)
            if ((erro as { code?: string })?.code === '23505') {
                return res.status(409).json({ 'msg-code': "ACCOUNT_ALREADY_REGISTERED" })
            }
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    // controller para obter os dados do motorista
    obterDados: async (req: Request, res: Response) => {
        // pega o id e o status de verificado do cookie
        const id = req.userId

        // pega os dados do motorista e envia de volta
        try {
            const query = "SELECT id, nome, email, COALESCE(cpf, cnpj) AS credencial, tipo_pessoa, excluido_em, email_verificado, google_id FROM motorista WHERE id = $1"
            const { rows } = await database.query(query, [id])
            if (rows.length < 1) throw new Error("Nenhum dado retornado.")

            const motorista = rows[0]

            // se o google id existir coloca que é google verificado, se não, coloca que não é
            if (!motorista.google_id) {
                motorista.google_verificado = false
            } else {
                motorista.google_verificado = true
            }
            // deleta o google id do objeto
            delete motorista.google_id

            return res.status(200).json({
                'msg-code': "ACCOUNT_DATA_RECEIVED",
                motorista
            })
        } catch (erro) {
            console.error("Erro ao obter dados do motorista, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    },
    compararSenha: async (req: Request, res: Response) => {
        // recebendo a senha bruta do cliente
        const senhaBruta = compararSenhaSchema.safeParse(req.body)

        // pegando o id do motorista
        const motoristaID = req.userId

        // validação
        if (!senhaBruta.success) {
            return res.status(400).json({
                'msg-code': "PASSWORD_COMPARISON_INVALID_DATA"
            })
        }
        const { senha: senhaInserida } = senhaBruta.data
        try {
            // pegando a senha hash do motorista
            const query = "SELECT senha FROM motorista WHERE id = $1"
            const { rows: dados } = await database.query(query, [motoristaID])
            const senhaHash = dados[0].senha

            // fazendo a comparação.
            const senhaValida = await bcrypt.compare(senhaInserida, senhaHash)

            return res.status(200).json({
                'msg-code': "PASSWORD_COMPARISON_SUCCESS",
                senhaValida: senhaValida
            })
        } catch (erro) {
            console.error("Erro ao pegar senha hash do motorista no endpoint de compararSenha, erro: ", erro)
            return res.status(500).json({
                'msg-code': "INTERNAL_SERVER_ERROR"
            })
        }
    }
}
