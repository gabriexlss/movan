import { FaChevronRight, FaFileContract, FaInfoCircle, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { alunos } from '../clientes-data'
import SecaoDetalhes, { CampoDetalhe } from './SecaoDetalhes'
import styles from './clienteDetalhes.module.css'

const nomesSituacao = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    atrasado: 'Atrasado',
}

const DetalhesResponsavel = ({ cliente: responsavel }) => {
    const alunosVinculados = alunos.filter((aluno) => (
        aluno.responsavelId === responsavel.id || aluno.responsavel === responsavel.nome
    ))
    const contratos = responsavel.contratos || []

    return (
        <>
            <SecaoDetalhes title="Informações gerais" Icone={FaInfoCircle}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="CPF ou CNPJ">{responsavel.cpf}</CampoDetalhe>
                    <CampoDetalhe label="Telefone">{responsavel.telefone}</CampoDetalhe>
                    <CampoDetalhe label="E-mail">{responsavel.email}</CampoDetalhe>
                    <CampoDetalhe label="Observações" destaque>
                        {responsavel.informacoesGerais || 'Nenhuma informação adicional.'}
                    </CampoDetalhe>
                </div>
            </SecaoDetalhes>

            <SecaoDetalhes title="Crianças vinculadas" Icone={FaUserGraduate}>
                {alunosVinculados.length > 0 ? (
                    <ul className={styles.listaRelacionada}>
                        {alunosVinculados.map((aluno) => (
                            <li key={aluno.id}>
                                <Link
                                    to={`/clientes/aluno/${aluno.id}`}
                                    state={{ registro: aluno }}
                                    className={styles.itemRelacionado}
                                >
                                    <FaUserGraduate aria-hidden="true" />
                                    <span>{aluno.nome}</span>
                                    <FaChevronRight className={styles.setaItem} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.estadoVazio}>Nenhuma criança vinculada.</p>
                )}
                <p className={styles.contagem}>{alunosVinculados.length} criança(s) vinculada(s)</p>
            </SecaoDetalhes>

            <SecaoDetalhes title="Contratos" Icone={FaFileContract}>
                {contratos.length > 0 ? (
                    <ul className={styles.listaContratos}>
                        {contratos.map((contrato) => (
                            <li className={styles.contrato} key={contrato.id}>
                                <div className={styles.contratoCabecalho}>
                                    <strong>{contrato.nome}</strong>
                                    <span className={`${styles.status} ${styles[`status-${contrato.situacao}`]}`}>
                                        {nomesSituacao[contrato.situacao] || contrato.situacao}
                                    </span>
                                </div>
                                <span>{contrato.id}</span>
                                <span>{contrato.valor} · Vencimento: {contrato.vencimento}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.estadoVazio}>Nenhum contrato cadastrado.</p>
                )}
            </SecaoDetalhes>

            <SecaoDetalhes title="Endereço" Icone={FaMapMarkerAlt}>
                <address className={styles.endereco}>{responsavel.endereco}</address>
            </SecaoDetalhes>
        </>
    )
}

export default DetalhesResponsavel
