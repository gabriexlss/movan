import { S3Client } from "@aws-sdk/client-s3"

export const CDN_URL: string = String(process.env['CDN_URL']!).replace(/\/+$/, '')
export const BUCKET_NAME: string = String(process.env['R2_BUCKET_NAME']!)

// configura o r2 do cloudflare
export const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env['R2_ACCESS_KEY_ID']!,
        secretAccessKey: process.env['R2_SECRET_ACCESS_KEY']!
    }
})
