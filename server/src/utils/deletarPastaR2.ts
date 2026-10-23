import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BUCKET_NAME, r2 } from "../db/r2.js";

// função feita pelo goat gpt 6.1 Sol
export async function deletarPastaR2(prefix: string) {
    if (!prefix.trim()) {
        throw new Error("Prefixo inválido");
    }

    const Prefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
    const Bucket = BUCKET_NAME;

    let total = 0;

    while (true) {
        const resultado = await r2.send(
            new ListObjectsV2Command({
                Bucket,
                Prefix,
                MaxKeys: 1000
            })
        );

        const arquivos = (resultado.Contents ?? [])
            .filter(obj => obj.Key !== undefined)
            .map(obj => ({ Key: obj.Key! }));

        if (arquivos.length === 0) break;

        const exclusao = await r2.send(
            new DeleteObjectsCommand({
                Bucket,
                Delete: { Objects: arquivos }
            })
        );

        if (exclusao.Errors?.length) {
            throw new Error("Falha ao excluir alguns arquivos do R2");
        }

        total += arquivos.length;
    }

    return total;
}