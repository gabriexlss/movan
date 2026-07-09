import crypto from "crypto"
import bcrypt from "bcrypt"
import { database } from "../db/postgre.js"
import { Resend } from "resend"

export const gerarCodigo = async (email: string, tipo: string, id: number) => {
    // Gera um numero unico e salva no banco de dados
    const codigo = crypto.randomInt(100000, 999999).toString();
    const codigoHash = await bcrypt.hash(codigo, 10);

    // verifica se pelo menos os valores de email, tipo e id foram enviados
    if (!email || !tipo || !id) {
        throw new Error("Email, tipo e id sao obrigatorios")
    }

    // salva codigo no banco de dados
    try{
        const query = "INSERT INTO cod_verificacao (cod, tipo, motorista_id) VALUES ($1, $2, $3)"
        const valores = [codigoHash, tipo, id];

        await database.query(query, valores)
    }catch(erro){
        throw new Error("Erro ao Salvar Codigo no Banco de Dados", { cause: erro });
    }
    // Manda o Email com o codigo pro destinatario
    try{
        const resend = new Resend(process.env['RESEND_API_KEY']);
        const response = await resend.emails.send({
            from: "Movan <noreply@movan.org>",
            to: email,
            subject: "Código de Verificação do Movan",
            html: `<p>Olá! Seu código de verificação do movan é</p> <br> <b><h2>${codigo}<h2><b>`,
        });
        if(response.error) throw new Error(response.error.message)
    }catch(erro: unknown){
        throw new Error("Erro ao enviar codigo por email", { cause: erro })
    }
    return true
}