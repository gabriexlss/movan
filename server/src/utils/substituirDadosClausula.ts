import type { ContratoView } from "../models/contrato/contratoView.model.js";
import type { Motorista } from "../models/motorista/motorista.model.js";

const formatarData = (data: Date | string): string => {
    if (data instanceof Date) {
        return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }
    const partes = String(data).slice(0, 10).split("-");
    if (partes.length === 3) {
        const [ano, mes, dia] = partes;
        if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
    }
    return String(data);
};

export const substituirDadosClausula = (texto: string, substituicoes: Record<string, string>): string => {
    let resultado = texto;
    for (const [busca, troca] of Object.entries(substituicoes)) {
        resultado = resultado.replaceAll(busca, troca);
    }
    return resultado;
};

export const montarSubstituicoesContrato = (
    dadosContrato?: Partial<ContratoView>,
    dadosMotorista?: Pick<Motorista, "nome" | "credencial">
): Record<string, string> => {
    const substituicoes: Record<string, string> = {};

    if (dadosContrato) {
        if (dadosContrato.valor_mensal !== undefined && dadosContrato.valor_mensal !== null) {
            substituicoes["{{contrato_valor_mensal}}"] = `${dadosContrato.valor_mensal}`;
        }
        if (dadosContrato.dia_vencimento !== undefined && dadosContrato.dia_vencimento !== null) {
            substituicoes["{{contrato_dia_vencimento}}"] = `${dadosContrato.dia_vencimento}`;
        }
        if (dadosContrato.nome_aluno) {
            substituicoes["{{aluno_nome}}"] = `${dadosContrato.nome_aluno}`;
        }
        if (dadosContrato.nome_responsavel) {
            substituicoes["{{responsavel_nome}}"] = `${dadosContrato.nome_responsavel}`;
        }
        if (dadosContrato.cpf_responsavel) {
            substituicoes["{{responsavel_cpf}}"] = `${dadosContrato.cpf_responsavel}`;
        }
        if (dadosContrato.nome_escola) {
            substituicoes["{{escola_nome}}"] = `${dadosContrato.nome_escola}`;
        }
        if (dadosContrato.endereco_escola) {
            substituicoes["{{escola_endereco}}"] = `${dadosContrato.endereco_escola}`;
        }
        if (dadosContrato.endereco_aluno) {
            substituicoes["{{aluno_endereco}}"] = `${dadosContrato.endereco_aluno}`;
        }
        if (dadosContrato.data_inicio && dadosContrato.data_fim) {
            substituicoes["{{contrato_periodo}}"] = `${formatarData(dadosContrato.data_inicio)} a ${formatarData(dadosContrato.data_fim)}`;
        }
    }

    if (dadosMotorista) {
        if (dadosMotorista.nome) {
            substituicoes["{{motorista_nome}}"] = `${dadosMotorista.nome}`;
        }
        if (dadosMotorista.credencial) {
            substituicoes["{{motorista_documento}}"] = `${dadosMotorista.credencial}`;
        }
    }

    return substituicoes;
};

export const aplicarSubstituicoesClausulas = <T extends { conteudo: string }>(
    clausulas: T[],
    substituicoes: Record<string, string>
): T[] => {
    if (Object.keys(substituicoes).length === 0) {
        return clausulas;
    }

    return clausulas.map((clausula) => ({
        ...clausula,
        conteudo: substituirDadosClausula(clausula.conteudo, substituicoes),
    }));
};
