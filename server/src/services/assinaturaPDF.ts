import { PDFDocument, PDFTextField, PageSizes, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";

export const CAMPO_ASSINATURA_RESPONSAVEL = "assinatura_responsavel"

// O PDF aceita PNG, enquanto as assinaturas são recebidas em WebP.
export const converterAssinaturaPng = async (imagem: Buffer): Promise<Buffer> => {
    return sharp(imagem, { limitInputPixels: 16000000 })
        .rotate()
        .resize({ width: 900, height: 300, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer()
}

export const assinarContratoPdf = async (
    pdfOriginal: Buffer,
    assinaturaResponsavel: Buffer,
    assinaturaMotorista: Buffer
): Promise<Buffer> => {
    const documento = await PDFDocument.load(pdfOriginal)
    const formulario = documento.getForm()
    const campo = formulario.getFieldMaybe(CAMPO_ASSINATURA_RESPONSAVEL)
    const imagemResponsavel = await documento.embedPng(await converterAssinaturaPng(assinaturaResponsavel))

    if(campo instanceof PDFTextField){
        // Preenche o espaço reservado sem recriar o texto ou a assinatura do motorista.
        campo.setImage(imagemResponsavel)
        formulario.flatten({ updateFieldAppearances: false })
    }else{
        // Documentos finalizados com o modelo antigo ainda não têm os campos de assinatura.
        const pagina = documento.addPage(PageSizes.A4)
        const fonte = await documento.embedFont(StandardFonts.Helvetica)
        const fonteTitulo = await documento.embedFont(StandardFonts.HelveticaBold)
        const azul = rgb(0.05, 0.28, 0.63)
        pagina.drawText('MOVAN', { x: 40, y: 770, size: 24, font: fonteTitulo, color: azul })
        pagina.drawText('Assinaturas do contrato', { x: 40, y: 720, size: 18, font: fonteTitulo, color: azul })
        pagina.drawText('Este quadro integra o contrato das páginas anteriores.', { x: 40, y: 690, size: 10, font: fonte })

        const imagemMotorista = await documento.embedPng(await converterAssinaturaPng(assinaturaMotorista))
        for(const [indice, imagem] of [imagemMotorista, imagemResponsavel].entries()){
            const x = 40 + indice * 270
            const tamanho = imagem.scaleToFit(245, 90)
            pagina.drawImage(imagem, { x: x + (245 - tamanho.width) / 2, y: 545 + (90 - tamanho.height) / 2, ...tamanho })
            pagina.drawLine({ start: { x, y: 535 }, end: { x: x + 245, y: 535 }, color: azul, thickness: 0.7 })
            const titulo = indice === 0 ? 'Motorista' : 'Responsável'
            pagina.drawText(titulo, { x: x + (245 - fonte.widthOfTextAtSize(titulo, 10)) / 2, y: 515, size: 10, font: fonte })
        }

        // Atualiza a contagem de páginas dos contratos antigos ao acrescentar as assinaturas.
        for(const [indice, paginaAtual] of documento.getPages().entries()){
            const texto = `Página ${indice + 1} de ${documento.getPageCount()}`
            const largura = paginaAtual.getWidth()
            paginaAtual.drawRectangle({ x: largura - 150, y: 20, width: 115, height: 20, color: rgb(1, 1, 1) })
            paginaAtual.drawText(texto, { x: largura - 40 - fonte.widthOfTextAtSize(texto, 7), y: 27, size: 7, font: fonte, color: rgb(0.39, 0.44, 0.52) })
        }
    }

    documento.setModificationDate(new Date())
    return Buffer.from(await documento.save())
}
