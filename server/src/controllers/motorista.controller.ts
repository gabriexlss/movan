import { Request, Response } from "express"
import { CriarMotoristaSchema, LoginMotoristaSchema } from "../models/motorista.model.js"
import { validarCodigo } from "../models/codigo_verificacao.js"
import { database } from "../db/postgre.js"
import bcrypt from "bcrypt"
import { gerarCodigo } from "../utils/mandarCodigo.js"
import jwt from "jsonwebtoken"

// Função pra verificar email ou cnpj
const verificarEmailouCNPJ = async (dado: string, tipo: "email" | "cnpj") => {
    // verifica se ambos os dados foram enviados
    if(!dado || !tipo) throw new Error("Algum dos dados está faltante")
        
    try {
            // checando se esse email ja existe no banco de dados
            const query = `SELECT id FROM motorista WHERE ${tipo} = $1`
            const valores = [dado]
            const { rows } = await database.query(query, valores)
            if(rows.length > 0){
                const id = rows[0].id
                return id
            }
            return undefined
        }catch(erro){
            throw new Error("Erro ao verificar no Banco de Dados", { cause: erro })
        }
}

// Criando o Controller do motorista
export const controllerMotorista = {
    // Controller pra criar um novo motorista vulgo usuario
    criarMotorista: async (req: Request, res: Response) => {
        // dados esperados: nome, cnpj, email, senha
        const dadosBrutos = CriarMotoristaSchema.safeParse(req.body)

        //checa se os dados enviados são validos
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Invalidos para criação do motorista",
                erro: dadosBrutos.error.format()
            });
        }
        // separando os dados
        const {nome, cnpj, email, senha} = dadosBrutos.data
        let userId: number

        // Verifica se Email ou CNPJ ja estão cadastrados
        try{
            const responseEmail = await verificarEmailouCNPJ(email, "email")
            if(responseEmail) {
                return res.status(409).json({
                    msg: "Email Já Cadastrado no Movan."
                })
            }
            const responseCnpj = await verificarEmailouCNPJ(cnpj, "cnpj")
            if(responseCnpj) {
                return res.status(409).json({
                    msg: "CNPJ Já Cadastrado no Movan."
                })
            }
        } catch(erro){
            console.error("Erro ao verificar se dados ja estão cadastrados, erro: ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }

        // transformando em hash a senha original do usuario
        const senhahash = await bcrypt.hash(senha, 10)
        
        //salvando arquivos no banco de dados
        try{
            const query = "INSERT INTO motorista (nome, cnpj, email, senha) VALUES ($1, $2, $3, $4) RETURNING id"
            const valores = [nome, cnpj, email, senhahash]
            
            // finalmente pega os dados e faz o insert no banco de dados
            const { rows } = await database.query(query, valores)
            userId = rows[0].id
        }catch(erro){
            // tratamento de dados, basicamente da uma mensagem no console do servidor com o erro onde nenhum usuario ve e pro usuario manda uma msg bonitinha
            console.error("Erro ao criar usúario, ", erro)
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }

        try{
            // enviar o email com o codigo pro usuario
            const response = await gerarCodigo(email, "criação", userId)
            if(!response) throw new Error
            return res.status(201).json({
                msg: "Motorista criado com sucesso!"
            })
        }catch(erro){
            // Se não foi possivel enviar o codigo, apaga o usuario
            console.error("Erro na Hora de mandar o codigo, erro:", erro)
            try{
                const query = "DELETE FROM motorista WHERE id = $1"
                const valores = [userId]
                await database.query(query, valores)
            }catch(erro){
                console.error("ERRO AO DELETAR USUARIO, ERRO: ", erro)
            }
            return res.status(500).json({
                msg: "Erro ao criar seu usuario, tente novamente mais tarde ou entre em contato."
            })
        }
    },
    // Controller para realizar o login do motorista usando cnpj ou email
    loginMotorista: async (req: Request, res: Response) => {
        // Dados esperados: senha, cnpj ou email
        const dados = LoginMotoristaSchema.safeParse(req.body)

        // Validação pra ver se todos os dados são validos
        if(!dados.success){
            return res.status(400).json({
                msg: "Dados Invalidos para login do motorista",
                erro: dados.error.format()
            })
        }
        // Separando os dados já validados em constantes individuais
        const {login, senha } = dados.data

        let id: number | undefined // variavel pra guardar o id do usuario encontrado, caso ele seja encontrado.

        // Com a Credencial de login, primeiro tenta ver se ela é um cnpj e tenta achar algum cliente com esse cnpj
        try{
            const response = await verificarEmailouCNPJ(login, "cnpj")
            if(response) id = response
        }catch(erro){
            console.error("Erro ao Verificar Credencial do usuario, erro: ", erro)
            return res.status(500).json({
                msg: "Erro ao fazer Login. Tente Novamente mais Tarde."
            })
        }
        if(!id){
            // Com a Credencial de login, agora tenta ver se é um email ja que não é um cnpj
        try{
            const response = await verificarEmailouCNPJ(login, "email")
            if(response) id = response
        }catch(erro){
            console.error("Erro ao Verificar Credencial do usuario, erro: ", erro)
            return res.status(500).json({
                msg: "Erro ao fazer Login. Tente Novamente mais Tarde."
            })
        }
        }

        // Agora que ambos email e cnpj foram checados, se nenhum deles tiver sido verdadeiro é pq o usuario não existe
        if(!id){
            return res.status(404).json({
                msg: "Nenhum Usuario Encontrado com o Email ou CNPJ Fornecidos"
            })
        }

        // Pega o hash de senha usando o id do usuario e guarda numa variavel
        try{
            const query = "SELECT senha FROM motorista WHERE id = $1"
            const valores = [id]

            const { rows } = await database.query(query, valores)
            const hashNoBanco = rows[0].senha

            // Compara a senha digitada pelo usuario com a senha salva no banco de dados e retorna true ou false
            const senhaValida = await bcrypt.compare(senha, hashNoBanco)

            if(!senhaValida){
                return res.status(401).json({
                    msg: "Senha Invalida"
                })
            }
        }catch(erro){
            console.error("Erro ao puxar hash de senha salva no banco de dados, erro: ", erro)
            return res.status(500).json({
                msg: "Erro ao fazer Login. Tente Novamente mais Tarde."
            })
        }
        // se chegou até aqui, o usuario foi encontrado e sua senha é valida, então só dar seu cookie.
        const segredoJWT = process.env['SEGREDO_JWT']
        if(!segredoJWT){
            console.error("Segredo JWT Ausente no ENV")
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
        const token = jwt.sign({id}, segredoJWT, {expiresIn: '30d'})

        return res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // o cookie expira em 30 dias
        }).json({
            msg: "Login Realizado com Sucesso."
        })
    },
    // rota para pegar o id do usuario logado e o tipo de codigo que ele quer receber (criação ou recuperação)
    enviarCodigo: async (req: Request, res: Response) => {
        const id = req.userId
        // pega o tipo de codigo que ele quer enviar por meio das parametros da rota, tipo motorista/codigo/criação
        const { tipo } = req.params

        // se o tipo não for indicado ou não for nem criação ou recuperação, dá erro de bad request
        if(!tipo) {
            return res.status(400).json({
                msg: "Erro Interno do Servidor.",
                erro: "Falta de tipo nos parametros da requisição"
            })
        }
        if(tipo !== "criação" && tipo !== "recuperação"){
            return res.status(400).json({
                msg: "Erro Interno do Servidor",
                erro: "Tipo não corresponde nem a criação nem a recuperação de conta"
            })
        }
        try{
            // pega o email do motorista por meio do ID
            const query = "SELECT email FROM motorista WHERE id = $1"
            const valores = [id]
            const { rows } = await database.query(query, valores)
            // coloca o email na constante email
            const email = rows[0].email
            // manda o codigo pro usuario e gera e salva o codigo no banco de dados
            const response = await gerarCodigo(email, tipo, id)
            if(!response) throw new Error("Erro ao Enviar o codigo de verificação")
            return res.status(200).json({
                msg: `Código para ${tipo} da conta enviado com sucesso.`
            })
        }catch(erro){
            console.error("Erro na rota de enviarCodigo, Erro:", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor"
            })
        }
    },
    verificarConta: async (req: Request, res: Response) => {
        const dadosBrutos = validarCodigo.safeParse(req.body)
        const id = req.userId
        const verificado = req.verificado

        // Verifica se a conta já foi verificada anteriormente, se sim, não tem motivo para ser verificada dnv
        if(verificado){
            return res.status(400).json({
                msg: "Conta já verificada."
            })
        }

        //checa se o código enviado é valido
        if(!dadosBrutos.success){
            return res.status(400).json({
                msg: "Dados Invalidos para verificação da conta",
                erro: dadosBrutos.error.format()
            });
        }
        // separa em uma constante comum
        const { cod } = dadosBrutos.data

        // pega o codigo em hash do usuario
        try{
            /* Essa Query gigantesca basicamente pega o codigo mais recente do banco de dados e 
            apenas um só dele, E só se tiver o mesmo id do motorista, o mesmo tipo de código 
            e se nao for um codigo expirado, ou seja se nao tiver passado 5 minutos */
            const query = `SELECT cod
            FROM cod_verificacao
            WHERE motorista_id = $1 AND tipo = $2 AND (data_criacao + INTERVAL '5 minutes') > $3
            ORDER BY data_criacao DESC 
            LIMIT 1`
            const dataAtual = new Date().toISOString();
            const valores = [id, "criação", dataAtual]
            const { rows } = await database.query(query, valores)
            
            // Se não receber nenhum resultado, nenhum código foi enviado ao usuario.
            if(rows.length < 1){
                return res.status(401).json({
                    msg: "Código digitado invalido ou expirado."
                })
            }
            // salva o hash de codigo numa constante
            const codigoHash = rows[0].cod

            // checa se bate.
            const codigoValido = await bcrypt.compare(cod, codigoHash)

            // se o codigo não for valido, da um não autorizado pro nosso filhão
            if(!codigoValido){
                return res.status(401).json({
                    msg: "Código digitado invalido ou expirado."
                })
            }
        }catch(erro){
            console.error("Erro na hora de buscar hash no banco de dados, erro:", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor ao verificar sua conta."
            })
        }
        // se o usuario chegou até aqui, então o codigo dele é valido, só verificar a conta dele
        try{
            const query = "UPDATE motorista SET verificado = $1 WHERE id = $2"
            const valores = [true, id]
            await database.query(query, valores)
            return res.status(200).json({
                msg: "Conta Verificada com Sucesso."
            })
        }catch(erro){
            console.error("Erro ao salvar o status de verificado como true no banco de dados, erro: ", erro)
            return res.status(500).json({
                msg: "Erro interno do servidor ao verificar sua conta."
            })
        }
    }
}
