import multer from "multer"

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