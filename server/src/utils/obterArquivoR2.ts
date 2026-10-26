import { GetObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, CDN_URL, r2 } from "../db/r2.js";

export const obterChaveR2 = (caminhoArquivo: string): string => {
    const base = new URL(`${CDN_URL}/`)
    const arquivo = new URL(caminhoArquivo)

    if(arquivo.origin !== base.origin || !arquivo.pathname.startsWith(base.pathname)){
        throw new Error("O Arquivo não pertence ao armazenamento do Movan.")
    }
    // URLs salvas antes da normalização da CDN podem ter barras duplicadas antes da chave.
    const key = decodeURIComponent(arquivo.pathname.slice(base.pathname.length)).replace(/^\/+/, '')
    if(!key){
        throw new Error("Caminho do arquivo inválido.")
    }
    return key
}

export const obterArquivoR2 = async (caminhoArquivo: string): Promise<Buffer> => {
    const resposta = await r2.send(new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: obterChaveR2(caminhoArquivo)
    }))
    if(!resposta.Body){
        throw new Error("Arquivo não encontrado no armazenamento.")
    }
    return Buffer.from(await resposta.Body.transformToByteArray())
}
