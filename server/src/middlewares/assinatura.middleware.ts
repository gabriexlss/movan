import { NextFunction, Request, Response } from "express";
import { createHash } from "crypto";
import { database } from "../db/postgre.js";
import type { Contrato } from "../models/contrato/contrato.model.js";
import type { ContratoDocumento } from "../models/contrato/contratoDocumento.model.js";

export const middlewareAssinatura = async (req: Request, res: Response, next: NextFunction) => {
    // pega o token do link enviado pelo responsável
    const { token: tokenBruto } = req.params
    if(!tokenBruto || !tokenBruto.toString().trim()){
        return res.status(400).json({
            msg: "O Token é necessário para acessar a assinatura do contrato."
        })
    }
    const token = tokenBruto.toString().trim()
    const hashToken = createHash("sha256").update(token).digest("hex")

    try{
        // verifica o link e o estado atual do contrato e do documento
        const { rows: [contratoDados] } = await database.query<Pick<Contrato, 'status'> & Pick<ContratoDocumento, 'status_documento'>>(
            `
            SELECT contrato.status, documento.status_documento
            FROM link_assinatura AS link
            JOIN contrato_documento AS documento ON documento.id = link.contrato_documento_id
            JOIN contrato ON contrato.id = documento.contrato_id
            WHERE link.token_hash = $1 AND link.utilizado_em IS NULL AND link.revogado_em IS NULL AND link.expira_em > now()
            `,
            [hashToken]
        )
        if(!contratoDados){
            return res.status(404).json({
                msg: "Contrato não encontrado com o token fornecido, ou token não é mais válido."
            })
        }
        if(contratoDados.status !== 'AGUARDANDO_ASSINATURA'){
            return res.status(409).json({
                msg: "Só é possível assinar um contrato que esteja aguardando assinatura."
            })
        }
        if(contratoDados.status_documento !== 'ENVIADO'){
            return res.status(409).json({
                msg: "O Documento do contrato não está disponível para assinatura."
            })
        }

        next()
        return
    }catch(erro){
        console.error("erro ao verificar se o contrato pode ser assinado, erro: ", erro)
        return res.status(500).json({
            msg: "Erro Interno do Servidor"
        })
    }
}
