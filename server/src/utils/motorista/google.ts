import { OAuth2Client } from "google-auth-library"

export const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID']
// Iniciando o google client do OAuth2, para autenticação
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

export const desembalarGoogle = async (token: string) => {
    // interface para tipar a constante de resposta
    interface dadosGoogle {
        email: string | undefined,
        nome: string | undefined,
        token: string | null,
        status: number | null,
        msgCode: string | null,
        sucesso: boolean,
        googleId: string | null
    }
    const dados: dadosGoogle = {
        email: undefined,
        nome: undefined,
        token: null,
        status: null,
        msgCode: null,
        sucesso: false,
        googleId: null
    }
    try {
        if (!GOOGLE_CLIENT_ID) throw new Error("ID do cliente Google ausente.")
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
            dados.msgCode = "GOOGLE_TOKEN_INVALID"
            dados.status = 401
            return dados
        }

        // checa pra ver se a conta google pertencente a esse token foi verificada.
        if (!payload.email_verified) {
            dados.msgCode = "GOOGLE_EMAIL_NOT_VERIFIED"
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
            throw new Error(`Erro ao receber todos os dados necessários do token do Google.`)
        }
        return dados
    } catch (erro) {
        dados.msgCode = "GOOGLE_TOKEN_INVALID"
        dados.status = 401
        console.error("Erro ao processar o token do Google, erro: ", erro)
        return dados
    }
}
