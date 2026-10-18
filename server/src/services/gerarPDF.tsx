import { fileURLToPath } from "node:url";
import { Document, Font, Page, Path, Svg, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ContratoView } from "../models/contrato.model.js";
import type { Clausula } from "../models/clausula.model.js";

export interface DadosContrato extends ContratoView {
    clausulas: Clausula[];
}

// Assets do próprio servidor: funcionam tanto em src/services quanto em dist/services.
Font.register({
    family: "Poppins",
    fonts: [
        { src: fileURLToPath(new URL("../../assets/fonts/Poppins-Regular.ttf", import.meta.url)) },
        { src: fileURLToPath(new URL("../../assets/fonts/Poppins-SemiBold.ttf", import.meta.url)), fontWeight: 600 },
    ],
});
Font.register({
    family: "Bree Serif",
    src: fileURLToPath(new URL("../../assets/fonts/BreeSerif-Regular.ttf", import.meta.url)),
});
Font.register({
    family: "TAN Nimbus",
    src: fileURLToPath(new URL("../../assets/fonts/TAN-NIMBUS.ttf", import.meta.url)),
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
    resumoValor: { width: "38%", paddingRight: 12 },
    resumoDetalhes: { flex: 1, borderLeftWidth: 1, borderLeftColor: "#527BB9", paddingLeft: 16 },
    resumoRotulo: { fontSize: 7, color: cores.branco, marginBottom: 4, letterSpacing: 0.5 },
    valor: { fontSize: 21, fontWeight: 600, color: cores.amarelo },
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

function ContratoDocumento({ dados }: { dados: DadosContrato }) {
    const numeroContrato = String(dados.contrato_id).padStart(6, "0");
    const valorMensal = Number(dados.valor_mensal).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
    const vigencia = dados.data_fim
        ? `${formatarData(dados.data_inicio)} a ${formatarData(dados.data_fim)}`
        : `A partir de ${formatarData(dados.data_inicio)}`;

    return (
        <Document title={`Contrato de Transporte Escolar - ${numeroContrato}`} author="Movan" subject="Contrato de transporte escolar" language="pt-BR">
            <Page size="A4" style={styles.pagina}>
                <View style={styles.cabecalho} fixed>
                    <Text style={styles.marca}>MO<Text style={styles.marcaFinal}>VAN</Text></Text>
                    <Text style={styles.slogan}>Seu caminho seguro na palma da mão</Text>
                    <View style={styles.identificacao}>
                        <Text>CONTRATO DE SERVIÇO</Text>
                        <Text style={styles.numeroContrato}>Nº {numeroContrato}</Text>
                    </View>
                    <Svg width="595.28" height="22" viewBox="0 0 595.28 22" style={styles.curva}>
                        <Path d="M0 19 C170 19 280 19 385 7 C470 -4 540 0 595.28 3 L595.28 22 L0 22 Z" fill={cores.amarelo} />
                        <Path d="M0 21 C170 21 300 22 405 13 C490 5 550 9 595.28 10 L595.28 22 L0 22 Z" fill={cores.branco} />
                    </Svg>
                </View>

                <View wrap={false}>
                    <Text style={styles.categoria}>TRANSPORTE ESCOLAR</Text>
                    <Text style={styles.titulo}>Contrato de transporte escolar</Text>
                    <View style={styles.destaque} />
                    <View style={styles.resumo}>
                        <View style={styles.resumoValor}>
                            <Text style={styles.resumoRotulo}>VALOR MENSAL</Text>
                            <Text style={styles.valor}>{valorMensal}</Text>
                        </View>
                        <View style={styles.resumoDetalhes}>
                            <Text style={styles.resumoRotulo}>VENCIMENTO</Text>
                            <Text style={styles.resumoTexto}>Dia {dados.dia_vencimento} de cada mês</Text>
                            <View style={styles.vigencia}>
                                <Text style={styles.resumoRotulo}>VIGÊNCIA</Text>
                                <Text style={styles.resumoTexto}>{vigencia}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.secao} minPresenceAhead={80}>Dados do contrato</Text>
                <View style={styles.participantes} wrap={false}>
                    <View style={styles.linha}>
                        <View style={styles.campo}>
                            <Text style={styles.rotulo}>ALUNO</Text>
                            <Text style={styles.dado}>{dados.nome_aluno}</Text>
                        </View>
                        <View style={styles.campo}>
                            <Text style={styles.rotulo}>ESCOLA</Text>
                            <Text style={styles.dado}>{dados.nome_escola}</Text>
                        </View>
                    </View>
                    <View style={styles.linha}>
                        <View style={styles.campo}>
                            <Text style={styles.rotulo}>RESPONSÁVEL</Text>
                            <Text style={styles.dado}>{dados.nome_responsavel}</Text>
                        </View>
                        <View style={styles.campo}>
                            <Text style={styles.rotulo}>CPF DO RESPONSÁVEL</Text>
                            <Text style={styles.dado}>{dados.cpf_responsavel}</Text>
                        </View>
                    </View>
                    {dados.motorista_id !== null && (
                        <View style={styles.motorista}>
                            <Text style={styles.rotulo}>IDENTIFICAÇÃO DO MOTORISTA</Text>
                            <Text style={styles.dado}>Cadastro nº {dados.motorista_id}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.secao} minPresenceAhead={70}>Condições do contrato</Text>
                {dados.clausulas.length === 0 && <Text style={styles.vazio}>Nenhuma cláusula cadastrada.</Text>}
                {dados.clausulas.map((clausula, indice) => (
                    <View key={clausula.id} style={styles.clausula}>
                        <View style={styles.tituloClausula} wrap={false} minPresenceAhead={42}>
                            <Text style={styles.indice}>{String(indice + 1).padStart(2, "0")}</Text>
                            <Text style={styles.subtitulo}>{clausula.titulo}</Text>
                        </View>
                        <Text style={styles.paragrafo} orphans={3} widows={3}>{clausula.conteudo}</Text>
                    </View>
                ))}

                <View style={styles.rodape} fixed>
                    <Text><Text style={styles.rodapeMarca}>MOVAN</Text>  /  Contrato nº {numeroContrato}</Text>
                    <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
}

export async function gerarContratoPdf(dados: DadosContrato): Promise<Buffer> {
    return renderToBuffer(<ContratoDocumento dados={dados} />);
}
