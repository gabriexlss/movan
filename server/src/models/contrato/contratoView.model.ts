// Dados da view de detalhes do contrato e seus participantes.
export type ContratoStatus = 'ATIVO' | 'INATIVO' | 'PENDENTE' | 'CANCELADO';

export interface ContratoView {
    contrato_id: number;
    status: ContratoStatus;
    data_inicio: Date;
    data_fim: Date;
    dia_vencimento: number;
    valor_mensal: number;
    aluno_id: number;
    nome_aluno: string;
    escola_id: number;
    nome_escola: string;
    responsavel_id: number;
    nome_responsavel: string;
    cpf_responsavel: string;
    motorista_id: number;
    endereco_aluno: string;
    endereco_escola: string;
}
