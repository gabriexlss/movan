import multer from "multer"
import type { NextFunction, Request, Response } from "express"
import sharp from "sharp"
import { converterAssinaturaPng } from "../services/assinaturaPDF.js"

const MIME_POR_FORMATO: Record<string, string> = {
    webp: "image/webp",
    png: "image/png",
}
const MIMES_PERMITIDOS = new Set(Object.values(MIME_POR_FORMATO))

export const receberImagem = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024, // 1 megabyte, acho impossivel uma assinatura ser mais pesada q isso
    },
    fileFilter: (_, file, cb) => {
    if (!MIMES_PERMITIDOS.has(file.mimetype)) {
        return cb(
            Object.assign(new Error("Formato inválido"), {
                status: 415
            })
        );
    }

    cb(null, true);
}
    
})

// O mimetype vem do cliente. Também verifica se os bytes formam uma imagem WebP ou PNG válida.
export const validarImagemAssinatura = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        next()
        return
    }
    try {
        const imagem = await sharp(req.file.buffer, { limitInputPixels: 16000000 }).metadata()
        const mimeEsperado = imagem.format ? MIME_POR_FORMATO[imagem.format] : undefined
        if (!mimeEsperado || req.file.mimetype !== mimeEsperado) {
            return res.status(400).json({
                msg: "A assinatura deve ser uma imagem WebP ou PNG válida."
            })
        }
        // Decodifica a imagem inteira para também rejeitar arquivos incompletos.
        await converterAssinaturaPng(req.file.buffer)
    } catch {
        return res.status(400).json({
            msg: "A assinatura deve ser uma imagem WebP ou PNG válida."
        })
    }
    next()
    return
}
