import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, r2 } from "../db/r2.js";

export const deletarR2 = async (key: string) => {
    await r2.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        })
    )
}