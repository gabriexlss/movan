import crypto from "crypto"
import bcrypt from "bcrypt"
import { database } from "../db/postgre.js"
import { Resend } from "resend"
import { PoolClient } from "pg";

export const gerarCodigo = async (email: string, tipo: "criação" | "recuperação" | "edição", id: number, cliente?: PoolClient) => {
    // Gera um numero unico e salva no banco de dados
    const codigo = crypto.randomInt(100000, 999999).toString();
    // Para edição, o hash também guarda o vínculo do código com o novo email.
    // Assim, um código enviado para um email não pode confirmar outro endereço.
    const codigoHash = await bcrypt.hash(tipo === "edição" ? `${codigo}:${email}` : codigo, 10);

    // verifica se pelo menos os valores de email, tipo e id foram enviados
    if (!email || !tipo || !id) {
        throw new Error("Email, tipo e id sao obrigatorios")
    }

    // salva codigo no banco de dados
    try{
        const query = "INSERT INTO cod_verificacao (cod, tipo, motorista_id) VALUES ($1, $2, $3)"
        const valores = [codigoHash, tipo, id];

        if(cliente){
            await cliente.query(query,valores)
        }else {
            await database.query(query, valores)
        }
    }catch(erro){
        throw new Error("Erro ao Salvar Codigo no Banco de Dados", { cause: erro });
    }
    // Define o codigo html para enviar o email
    let htmlcod:string
    switch(tipo){
        case "criação": htmlcod = `<p>Olá! Seu código de verificação para criar sua conta do Movan é:</p><h2><b>${codigo}</b></h2>`
        break
        case "recuperação": htmlcod = `<p>Olá! Seu código de verificação para recuperar sua senha do Movan é:</p><h2><b>${codigo}</b></h2>`
        break
        case "edição": htmlcod = `<p>Olá! Seu código de verificação para alterar o e-mail da sua conta do Movan é:</p><h2><b>${codigo}</b></h2>`
        break
        default: throw new Error("tipo invalido")
    }

    // Manda o Email com o codigo pro destinatario
    try{
        const resend = new Resend(process.env['RESEND_API_KEY']);
        const response = await resend.emails.send({
            from: "Movan <noreply@movan.org>",
            to: email,
            subject: "Código de Verificação do Movan",
            html: htmlcod,
        });
        if(response.error) throw new Error(response.error.message)
    }catch(erro: unknown){
        throw new Error("Erro ao enviar codigo por email", { cause: erro })
    }
    return true
}
