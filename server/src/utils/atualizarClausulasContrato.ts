import { PoolClient } from "pg";
import { ClausulaMotorista, ClausulaPadrao, InserirClausulaContrato } from "../models/clausula.model.js";

interface atualizarClausulasProps{
    cliente: PoolClient,
    motoristaID: number,
    contratoID: number
}

export const atualizarClausulasContrato = async ({ cliente, motoristaID, contratoID }: atualizarClausulasProps): Promise<void> => {

    // pego todas as clausulas padrões do sistema.  
    const BuscarClausulasPadraoQuery = "SELECT * FROM clausula_padrao WHERE excluido = $1 ORDER BY ordem ASC"
    const BuscarClausulasMotoristaQuery = "SELECT * FROM clausula_motorista WHERE motorista_id = $1 AND excluido = $2 ORDER BY ordem ASC"

    const [ { rows: ClausulasPadroes }, { rows: ClausulasMotorista } ] = await Promise.all([
        cliente.query<ClausulaPadrao>(BuscarClausulasPadraoQuery, [false]),
        cliente.query<ClausulaMotorista>(BuscarClausulasMotoristaQuery, [motoristaID, false])
    ])

    // iniciando constante com os dados pra atualizar as clausulas.
    const Clausulas: InserirClausulaContrato[] = []

    // encho o array clausula com todas as clausulas padrões
    ClausulasPadroes.map(clausula => Clausulas.push({
        titulo: clausula.titulo,
        conteudo: clausula.conteudo,
        ordem: clausula.ordem,
        editavel: false,
        origem: "PADRAO",
        contrato_id: contratoID,
        clausula_padrao_id: clausula.id,
        clausula_motorista_id: null
    }))
    // registro a ultima ordem do array clausulas padrão
    const ultimaOrdemPadrao = ClausulasPadroes.at(-1)?.ordem ?? 0

    ClausulasMotorista.map(clausula => Clausulas.push({
        titulo: clausula.titulo,
        conteudo: clausula.conteudo,
        ordem: clausula.ordem + ultimaOrdemPadrao,
        editavel: true,
        origem: "MOTORISTA",
        contrato_id: contratoID,
        clausula_padrao_id: null,
        clausula_motorista_id: clausula.id
    }))
    // coloco nas clausulas do contrato gerado anteriormente.
    const queryAtualizarSistema = `INSERT INTO contrato_clausula
            (titulo, conteudo, ordem, editavel, origem, contrato_id, clausula_padrao_id, clausula_motorista_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `
    const queryDeletarClausulas = `
    DELETE FROM contrato_clausula
    WHERE contrato_id = $1
    `
    // deleta todas as clausulas anteriores desse contrato
    await cliente.query(queryDeletarClausulas, [contratoID])
    /*
    vai inserindo as clausulas padrão nas do contrato motorista uma por uma.
    Sinceramente nem sei como isso tá funcionando e nem sei se é o jeito mais rapido e eficiente e rápido de fazer isso mas fi, esqueça tudo, deu certo
    */
    for (const clausula of Clausulas) {
        await cliente.query(queryAtualizarSistema, Object.values(clausula))
    }

    return
}