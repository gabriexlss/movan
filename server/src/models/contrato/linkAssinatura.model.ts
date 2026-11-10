// Dados do link usado pelo responsável para assinar o documento.
export interface LinkAssinatura {
    id: number;
    token_hash: string;
    expira_em: Date;
    utilizado_em: Date | null;
    revogado_em: Date | null;
    criado_em: Date;
    agente_usuario: string | null;
    endereco_ip: string | null;
    contrato_documento_id: number;
    responsavel_id: number;
}
