import multer from "multer"
import type { NextFunction, Request, Response } from "express"
import sharp from "sharp"
import { converterAssinaturaPng } from "../services/assinaturaPDF.js"

export const receberImagem = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024, // 1 megabyte, acho impossivel uma assinatura ser mais pesada q isso
    },
    fileFilter: (_, file, cb) => {
    if (!["image/webp"].includes(file.mimetype)) {
        return cb(
            Object.assign(new Error("Formato inválido"), {
                status: 415
            })
        );
    }

    cb(null, true);
}
    
})

// O mimetype vem do cliente. Também verifica se os bytes formam uma imagem WebP válida.
export const validarImagemAssinatura = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        next()
        return
    }
    try {
        const imagem = await sharp(req.file.buffer, { limitInputPixels: 16000000 }).metadata()
        if (imagem.format !== 'webp') {
            return res.status(400).json({
                msg: "A assinatura deve ser uma imagem WebP válida."
            })
        }
        // Decodifica a imagem inteira para também rejeitar arquivos incompletos.
        await converterAssinaturaPng(req.file.buffer)
    } catch {
        return res.status(400).json({
            msg: "A assinatura deve ser uma imagem WebP válida."
        })
    }
    next()
    return
}
