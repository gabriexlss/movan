import { createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, Font, Image, Page, Path, Svg, Text, TextInput, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { PDFDocument } from "pdf-lib";
import type { ContratoView } from "../models/contrato/contratoView.model.js";
import type { Clausula } from "../models/contrato/clausula.model.js";
import { CAMPO_ASSINATURA_RESPONSAVEL, converterAssinaturaPng } from "./assinaturaPDF.js";

export interface DadosContrato extends ContratoView {
    clausulas: Clausula[];
    assinatura_motorista: Buffer;
    nome_motorista: string;
}

// Referências explícitas para o bundler da Vercel (@vercel/nft) rastrear as fontes do servidor e do pdfkit.
try {
    const requireCjs = createRequire(import.meta.url);
    requireCjs("pdfkit/standard-fonts/Courier");
    requireCjs("pdfkit/standard-fonts/CourierBold");
    requireCjs("pdfkit/standard-fonts/CourierBoldOblique");
    requireCjs("pdfkit/standard-fonts/CourierOblique");
    requireCjs("pdfkit/standard-fonts/Helvetica");
    requireCjs("pdfkit/standard-fonts/HelveticaBold");
    requireCjs("pdfkit/standard-fonts/HelveticaBoldOblique");
    requireCjs("pdfkit/standard-fonts/HelveticaOblique");
    requireCjs("pdfkit/standard-fonts/Symbol");
    requireCjs("pdfkit/standard-fonts/TimesBold");
    requireCjs("pdfkit/standard-fonts/TimesBoldItalic");
    requireCjs("pdfkit/standard-fonts/TimesItalic");
    requireCjs("pdfkit/standard-fonts/TimesRoman");
    requireCjs("pdfkit/standard-fonts/ZapfDingbats");
} catch {
    const requireFromReactPdf = createRequire(import.meta.resolve("@react-pdf/renderer"));
    const pdfkitJsDir = dirname(requireFromReactPdf.resolve("pdfkit"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/Courier.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/CourierBold.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/CourierBoldOblique.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/CourierOblique.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/Helvetica.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/HelveticaBold.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/HelveticaBoldOblique.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/HelveticaOblique.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/Symbol.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/TimesBold.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/TimesBoldItalic.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/TimesItalic.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/TimesRoman.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/ZapfDingbats.cjs"));
    void readFileSync(join(pdfkitJsDir, "standard-fonts/chunks/standardGlyphNames-DNHAb7rp.cjs"));
}
const poppinsRegularPath = fileURLToPath(new URL("../../assets/fonts/Poppins-Regular.ttf", import.meta.url));
const poppinsSemiBoldPath = fileURLToPath(new URL("../../assets/fonts/Poppins-SemiBold.ttf", import.meta.url));
const breeSerifRegularPath = fileURLToPath(new URL("../../assets/fonts/BreeSerif-Regular.ttf", import.meta.url));
const tanNimbusPath = fileURLToPath(new URL("../../assets/fonts/TAN-NIMBUS.ttf", import.meta.url));

void readFileSync(poppinsRegularPath);
void readFileSync(poppinsSemiBoldPath);
void readFileSync(breeSerifRegularPath);
void readFileSync(tanNimbusPath);

// Assets do próprio servidor: funcionam tanto em src/services quanto em dist/services.
Font.register({
    family: "Poppins",
    fonts: [
        { src: poppinsRegularPath },
        { src: poppinsSemiBoldPath, fontWeight: 600 },
    ],
});
Font.register({
    family: "Bree Serif",
    src: breeSerifRegularPath,
});
Font.register({
    family: "TAN Nimbus",
    src: tanNimbusPath,
});

const cores = {
    azul: "#0D47A1",
    amarelo: "#FFC33A",
    claro: "#F8F5F5",
    branco: "#FFFFFF",
    texto: "#24344B",
    secundario: "#637085",
    borda: "#DFE5EF",
};

const styles = StyleSheet.create({
    pagina: {
        paddingTop: 126,
        paddingBottom: 64,
        paddingHorizontal: 40,
        fontFamily: "Poppins",
        fontSize: 9,
        color: cores.texto,
        backgroundColor: cores.branco,
    },
    cabecalho: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 104,
        backgroundColor: cores.azul,
    },
    marca: {
        position: "absolute",
        top: 25,
        left: 40,
        fontFamily: "TAN Nimbus",
        fontSize: 25,
        color: cores.amarelo,
    },
    marcaFinal: { color: cores.branco },
    slogan: {
        position: "absolute",
        top: 63,
        left: 40,
        fontFamily: "Bree Serif",
        fontSize: 9,
        color: cores.branco,
    },
    identificacao: {
        position: "absolute",
        top: 33,
        right: 40,
        textAlign: "right",
        color: cores.branco,
        fontSize: 8,
    },
    numeroContrato: { fontWeight: 600, fontSize: 12, color: cores.amarelo },
    curva: { position: "absolute", bottom: -1, left: 0 },
    categoria: { fontSize: 8, fontWeight: 600, letterSpacing: 1.5, color: cores.azul, marginBottom: 6 },
    titulo: { fontFamily: "Bree Serif", fontSize: 26, color: cores.azul, marginBottom: 12 },
    destaque: { width: 42, height: 4, backgroundColor: cores.amarelo, borderRadius: 2, marginBottom: 16 },
    resumo: {
        flexDirection: "row",
        backgroundColor: cores.azul,
        borderRadius: 10,
        padding: 16,
        marginBottom: 18,
    },
    resumoValor: { width: "38%", paddingHorizontal: 12, justifyContent: "center", alignItems: "center" },
    resumoDetalhes: { flex: 1, borderLeftWidth: 1, borderLeftColor: "#527BB9", paddingLeft: 16 },
    resumoRotulo: { fontSize: 7, color: cores.branco, marginBottom: 4, letterSpacing: 0.5 },
    valor: { fontSize: 21, fontWeight: 600, color: cores.amarelo, textAlign: "center" },
    resumoTexto: { fontSize: 9, color: cores.branco, fontWeight: 600 },
    vigencia: { marginTop: 9 },
    secao: { fontSize: 12, fontWeight: 600, color: cores.azul, marginBottom: 8 },
    participantes: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: cores.claro,
        marginBottom: 20,
    },
    linha: { flexDirection: "row", marginBottom: 12 },
    campo: { width: "50%", paddingRight: 14 },
    rotulo: { fontSize: 7, color: cores.secundario, marginBottom: 3, letterSpacing: 0.4 },
    dado: { fontSize: 9, fontWeight: 600 },
    motorista: { borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: 10 },
    clausula: { marginBottom: 14 },
    tituloClausula: { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
    indice: {
        width: 25,
        marginRight: 9,
        borderRadius: 5,
        backgroundColor: cores.amarelo,
        color: cores.azul,
        textAlign: "center",
        paddingVertical: 2,
        fontWeight: 600,
        fontSize: 9,
    },
    subtitulo: { flex: 1, fontWeight: 600, fontSize: 10, color: cores.azul, paddingTop: 2 },
    paragrafo: { textAlign: "justify" },
    vazio: { color: cores.secundario },
    assinaturas: { marginTop: 20 },
    assinaturasCampos: { flexDirection: "row", marginTop: 12 },
    assinaturaCampo: { width: "50%", paddingHorizontal: 12, alignItems: "center" },
    assinaturaImagem: { width: 220, height: 80, objectFit: "contain" },
    assinaturaLinha: { width: "100%", borderTopWidth: 0.7, borderTopColor: cores.azul, marginTop: 6, paddingTop: 6 },
    assinaturaNome: { fontSize: 9, fontWeight: 600, textAlign: "center" },
    assinaturaTipo: { fontSize: 8, color: cores.secundario, textAlign: "center", marginTop: 3 },
    rodape: {
        position: "absolute",
        bottom: 25,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: cores.borda,
        paddingTop: 9,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 7,
        color: cores.secundario,
    },
    rodapeMarca: { color: cores.azul, fontWeight: 600 },
});

function formatarData(data: string | Date): string {
    if (data instanceof Date) {
        const dia = String(data.getDate()).padStart(2, "0");
        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const ano = String(data.getFullYear());
        return `${dia}/${mes}/${ano}`;
    }
    // As datas do contrato são civis (YYYY-MM-DD), sem conversão de fuso horário.
    const [ano, mes, dia] = data.slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
}

function ClausulaDocumento({ clausula, indice }: { clausula: Clausula; indice: number }) {
    return _jsxs(View, {
        style: styles.clausula,
        wrap: false,
        children: [
            _jsxs(View, {
                style: styles.tituloClausula,
                children: [
                    _jsx(Text, { style: styles.indice, children: String(indice + 1).padStart(2, "0") }),
                    _jsx(Text, { style: styles.subtitulo, children: clausula.titulo }),
                ],
            }),
            _jsx(Text, { style: styles.paragrafo, children: clausula.conteudo }),
        ],
    });
}

function ContratoDocumento({ dados }: { dados: DadosContrato }) {
    const numeroContrato = String(dados.contrato_id).padStart(6, "0");
    const valorMensal = Number(dados.valor_mensal).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
    const vigencia = dados.data_fim
        ? `${formatarData(dados.data_inicio)} a ${formatarData(dados.data_fim)}`
        : `A partir de ${formatarData(dados.data_inicio)}`;

    return createElement(
        Document,
        {
            title: `Contrato de Transporte Escolar - ${numeroContrato}`,
            author: "Movan",
            subject: "Contrato de transporte escolar",
            language: "pt-BR",
        },
        _jsxs(Page, {
            size: "A4",
            style: styles.pagina,
            children: [
                _jsxs(View, {
                    style: styles.cabecalho,
                    fixed: true,
                    children: [
                        _jsxs(Text, {
                            style: styles.marca,
                            children: ["MO", _jsx(Text, { style: styles.marcaFinal, children: "VAN" })],
                        }),
                        _jsx(Text, { style: styles.slogan, children: "Seu caminho seguro na palma da mão" }),
                        _jsxs(View, {
                            style: styles.identificacao,
                            children: [
                                _jsx(Text, { children: "CONTRATO DE SERVIÇO" }),
                                _jsxs(Text, { style: styles.numeroContrato, children: ["Nº ", numeroContrato] }),
                            ],
                        }),
                        _jsxs(Svg, {
                            width: "595.28",
                            height: "22",
                            viewBox: "0 0 595.28 22",
                            style: styles.curva,
                            children: [
                                _jsx(Path, {
                                    d: "M0 19 C170 19 280 19 385 7 C470 -4 540 0 595.28 3 L595.28 22 L0 22 Z",
                                    fill: cores.amarelo,
                                }),
                                _jsx(Path, {
                                    d: "M0 21 C170 21 300 22 405 13 C490 5 550 9 595.28 10 L595.28 22 L0 22 Z",
                                    fill: cores.branco,
                                }),
                            ],
                        }),
                    ],
                }),
                _jsxs(View, {
                    wrap: false,
                    children: [
                        _jsx(Text, { style: styles.categoria, children: "TRANSPORTE ESCOLAR" }),
                        _jsx(Text, { style: styles.titulo, children: "Contrato de transporte escolar" }),
                        _jsx(View, { style: styles.destaque }),
                        _jsxs(View, {
                            style: styles.resumo,
                            children: [
                                _jsxs(View, {
                                    style: styles.resumoValor,
                                    children: [
                                        _jsx(Text, { style: styles.resumoRotulo, children: "VALOR MENSAL" }),
                                        _jsx(Text, { style: styles.valor, children: valorMensal }),
                                    ],
                                }),
                                _jsxs(View, {
                                    style: styles.resumoDetalhes,
                                    children: [
                                        _jsx(Text, { style: styles.resumoRotulo, children: "VENCIMENTO" }),
                                        _jsxs(Text, {
                                            style: styles.resumoTexto,
                                            children: ["Dia ", dados.dia_vencimento, " de cada mês"],
                                        }),
                                        _jsxs(View, {
                                            style: styles.vigencia,
                                            children: [
                                                _jsx(Text, { style: styles.resumoRotulo, children: "VIGÊNCIA" }),
                                                _jsx(Text, { style: styles.resumoTexto, children: vigencia }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                _jsx(Text, { style: styles.secao, minPresenceAhead: 80, children: "Dados do contrato" }),
                _jsxs(View, {
                    style: styles.participantes,
                    wrap: false,
                    children: [
                        _jsxs(View, {
                            style: styles.linha,
                            children: [
                                _jsxs(View, {
                                    style: styles.campo,
                                    children: [
                                        _jsx(Text, { style: styles.rotulo, children: "ALUNO" }),
                                        _jsx(Text, { style: styles.dado, children: dados.nome_aluno }),
                                    ],
                                }),
                                _jsxs(View, {
                                    style: styles.campo,
                                    children: [
                                        _jsx(Text, { style: styles.rotulo, children: "ESCOLA" }),
                                        _jsx(Text, { style: styles.dado, children: dados.nome_escola }),
                                    ],
                                }),
                            ],
                        }),
                        _jsxs(View, {
                            style: styles.linha,
                            children: [
                                _jsxs(View, {
                                    style: styles.campo,
                                    children: [
                                        _jsx(Text, { style: styles.rotulo, children: "RESPONSÁVEL" }),
                                        _jsx(Text, { style: styles.dado, children: dados.nome_responsavel }),
                                    ],
                                }),
                                _jsxs(View, {
                                    style: styles.campo,
                                    children: [
                                        _jsx(Text, { style: styles.rotulo, children: "CPF DO RESPONSÁVEL" }),
                                        _jsx(Text, { style: styles.dado, children: dados.cpf_responsavel }),
                                    ],
                                }),
                            ],
                        }),
                        dados.motorista_id !== null &&
                            _jsxs(View, {
                                style: styles.motorista,
                                children: [
                                    _jsx(Text, { style: styles.rotulo, children: "IDENTIFICAÇÃO DO MOTORISTA" }),
                                    _jsxs(Text, { style: styles.dado, children: ["Cadastro nº ", dados.motorista_id] }),
                                ],
                            }),
                    ],
                }),
                _jsx(Text, { style: styles.secao, minPresenceAhead: 70, children: "Condições do contrato" }),
                dados.clausulas.length === 0 &&
                    _jsx(Text, { style: styles.vazio, children: "Nenhuma cláusula cadastrada." }),
                dados.clausulas.map((clausula, indice) =>
                    _jsx(ClausulaDocumento, { clausula: clausula, indice: indice }, clausula.id)
                ),
                _jsxs(View, {
                    style: styles.assinaturas,
                    wrap: false,
                    children: [
                        _jsx(Text, { style: styles.secao, children: "Assinaturas" }),
                        _jsxs(View, {
                            style: styles.assinaturasCampos,
                            children: [
                                _jsxs(View, {
                                    style: styles.assinaturaCampo,
                                    children: [
                                        _jsx(Image, {
                                            src: { data: dados.assinatura_motorista, format: "png" },
                                            style: styles.assinaturaImagem,
                                        }),
                                        _jsxs(View, {
                                            style: styles.assinaturaLinha,
                                            children: [
                                                _jsx(Text, {
                                                    style: styles.assinaturaNome,
                                                    children: dados.nome_motorista,
                                                }),
                                                _jsx(Text, { style: styles.assinaturaTipo, children: "Motorista" }),
                                            ],
                                        }),
                                    ],
                                }),
                                _jsxs(View, {
                                    style: styles.assinaturaCampo,
                                    children: [
                                        _jsx(TextInput, {
                                            name: CAMPO_ASSINATURA_RESPONSAVEL,
                                            readOnly: true,
                                            value: "",
                                            style: styles.assinaturaImagem,
                                        }),
                                        _jsxs(View, {
                                            style: styles.assinaturaLinha,
                                            children: [
                                                _jsx(Text, {
                                                    style: styles.assinaturaNome,
                                                    children: dados.nome_responsavel,
                                                }),
                                                _jsxs(Text, {
                                                    style: styles.assinaturaTipo,
                                                    children: ["Responsável · CPF ", dados.cpf_responsavel],
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                _jsxs(View, {
                    style: styles.rodape,
                    fixed: true,
                    children: [
                        _jsxs(Text, {
                            children: [
                                _jsx(Text, { style: styles.rodapeMarca, children: "MOVAN" }),
                                "  /  Contrato nº ",
                                numeroContrato,
                            ],
                        }),
                        _jsx(Text, {
                            render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
                                `Página ${pageNumber} de ${totalPages}`,
                        }),
                    ],
                }),
            ],
        })
    );
}

export async function gerarContratoPdf(dados: DadosContrato): Promise<Buffer> {
    // Mede os blocos na mesma largura do A4 para não gerar cláusulas cortadas.
    if (dados.clausulas.length) {
        const medidas = await renderToBuffer(
            createElement(
                Document,
                null,
                dados.clausulas.map((clausula, indice) =>
                    createElement(
                        Page,
                        {
                            key: clausula.id,
                            size: { width: 595.28 },
                            wrap: false,
                            style: [styles.pagina, { paddingTop: 0, paddingBottom: 0 }],
                        },
                        createElement(ClausulaDocumento, { clausula, indice })
                    )
                )
            )
        );
        const documento = await PDFDocument.load(medidas);
        for (const [indice, pagina] of documento.getPages().entries()) {
            if (pagina.getHeight() > 841.89 - 126 - 64) {
                throw new ClausulaMuitoLongaError(
                    `A cláusula "${dados.clausulas[indice]!.titulo}" excede uma página A4. Reduza o conteúdo para manter a cláusula inteira.`
                );
            }
        }
    }

    const assinatura = await converterAssinaturaPng(dados.assinatura_motorista);
    return renderToBuffer(ContratoDocumento({ dados: { ...dados, assinatura_motorista: assinatura } }));
}

export class ClausulaMuitoLongaError extends Error {
    override name = "ClausulaMuitoLongaError";
}
