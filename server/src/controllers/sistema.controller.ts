import { Request, Response } from "express"
import { database } from "../db/postgre.js"
import { Motorista } from "../models/motorista.model.js";
import { BUCKET_NAME, r2 } from "../db/r2.js";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// função feita pelo goat gpt 6.1 Sol
async function deletarPasta(prefix: string) {
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

export const controllerSistema = {
    // Rotina de limpeza de usuarios que estão com a conta agendada para deleção tem mais de 30 dias.
    deletarUsuarios: async (req: Request, res: Response) => {
        let usuariosDeletados: number = 0
        let arquivosDeletados: number = 0
        // deletando as assinaturas do bucket do r2
        try {
            // pego todos os IDs dos usuarios que vão ser excluidos
            const { rows: usuarios } = await database.query<Motorista>(
                "SELECT id FROM motorista WHERE excluido_em IS NOT NULL AND excluido_em <= now() - INTERVAL '30 days'"
            )
            // faço um For maroto pra deletar cada usuario na constante usuarios
            for (const usuario of usuarios) {
                const key = `motoristas/${usuario.id}`

                // chamo a função god feita pelo chatgpt ja que o maldito cloudflare não aceita deletar uma pasta toda
                arquivosDeletados += await deletarPasta(key)

                // agr sim excluo do banco de dados
                await database.query(`DELETE FROM motorista WHERE id = $1`, [usuario.id])
                usuariosDeletados++
            }
        } catch (erro) {
            console.error("Erro na limpeza de usuários:", erro)
            return res.status(500).json({
                msg: `Erro interno durante a limpeza. ${usuariosDeletados} usuários excluídos e ${arquivosDeletados} arquivos excluídos.`,
            })
        }
        return res.status(200).json({
            msg: `Limpeza concluída! ${usuariosDeletados} usuários excluídos e ${arquivosDeletados} arquivos excluídos.`
        })
    }
}
