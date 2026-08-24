import { Request, Response } from "express";
import { CriarEscolaSchema, EditarEscolaSchema } from "../models/escola.model.js";
import { database } from "../db/postgre.js";

export const controllerEscola = {
    // controller para criar uma nova escola
    criarEscola: async (req: Request, res: Response) => {
        // pega id do motorista do controller
        const motoristaId = req.userId
        // dados esperados: nome, endereço, telefone, hora_abertura, hora_fechamento, latitude, longitude
        const dadosBrutos = CriarEscolaSchema.safeParse(req.body)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para criar escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // realizar desestruturação dos dados
        const { nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude } = dadosBrutos.data

        // realizando a operação
        try {
            const query = `INSERT INTO escola 
            (nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude, motorista_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`
            const valores = [nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude, motoristaId]

            const escola = await database.query(query, valores)

            return res.status(201).json({
                msg: "Escola criada com sucesso!",
                escola: escola.rows[0]
            })
        } catch (erro) {
            console.error("Erro no endpoint de criar escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    },
    editarEscola: async (req: Request, res: Response) => {
        // pegando id do motorista do middleware
        const motoristaId = req.userId
        // dados esperados: id. dados opcionais: nome, endereço, telefone, hora abertura e hora fechamento, latitude e longitude
        const dadosBrutos = EditarEscolaSchema.safeParse(req.body)

        // validação dos dados
        if (!dadosBrutos.success) {
            return res.status(400).json({
                msg: "Dados Inválidos para editar a escola.",
                erro: dadosBrutos.error.format()
            })
        }
        // desestruturação dos dados
        const { id, nome, endereco, tel, hora_abertura, hora_fechamento, latitude, longitude } = dadosBrutos.data

        // iniciando arrays para guardar os dados recebidos.
        const campos: string[] = []
        const valores: (string | number)[] = []

        // checagem para verificar quais campos foram recebidos.
        if (!id) {
            return res.status(400).json({
                msg: "id é necessario para editar uma escola"
            })
        }
        if(nome){
            campos.push(`nome = $${valores.length + 1}`)
            valores.push(nome)
        }
        if(endereco){
            campos.push(`endereco = $${valores.length + 1}`)
            valores.push(endereco)
        }
        if(tel){
            campos.push(`tel = $${valores.length + 1}`)
            valores.push(tel)
        }
        if(hora_abertura){
            campos.push(`hora_abertura = $${valores.length + 1}`)
            valores.push(hora_abertura)
        }
        if(hora_fechamento){
            campos.push(`hora_fechamento = $${valores.length + 1}`)
            valores.push(hora_fechamento)
        }
        if(latitude){
            campos.push(`latitude = $${valores.length + 1}`)
            valores.push(latitude)
        }
        if(longitude){
            campos.push(`longitude = $${valores.length + 1}`)
            valores.push(longitude)
        }
        
        // se nenhum campo for recebido, manda embora
        if(campos.length < 1){
            return res.status(400).json({
                msg: "É necessario pelo menos um campo para realizar a edição."
            })
        }

        // Okay, agr realizar a operação
        try{
            const query = `
            UPDATE escola
            SET ${campos.join(', ')}
            WHERE id = $${valores.length + 1} AND motorista_id = $${valores.length + 2} 
            `
            valores.push(id)
            valores.push(motoristaId)
            await database.query(query, valores)

            return res.status(200).json({
                msg: "Escola editada com sucesso!"
            })
        }catch(erro){
            console.error("Erro no endpoint de editar escola, erro: ", erro)
            return res.status(500).json({
                msg: "Erro Interno do Servidor."
            })
        }
    }
}