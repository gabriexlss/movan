import { FaChevronRight, FaInfoCircle, FaSchool, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { escolas, responsaveis } from '../clientes-data'
import SecaoDetalhes, { CampoDetalhe } from './SecaoDetalhes'
import styles from './clienteDetalhes.module.css'

const formatarData = (data) => {
    if (!data) return 'Não informada'
    const [ano, mes, dia] = data.split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const DetalhesAluno = ({ cliente: aluno }) => {
    const responsavel = responsaveis.find((item) => item.nome === aluno.responsavel)
        || responsaveis.find((item) => item.id === aluno.responsavelId)
    const escola = escolas.find((item) => item.id === aluno.escolaId)

    return (
        <>
            <SecaoDetalhes title="Informações de cadastro" Icone={FaInfoCircle}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="Data de nascimento">{formatarData(aluno.dataNascimento)}</CampoDetalhe>
                    <CampoDetalhe label="Turno">{aluno.turno}</CampoDetalhe>
                    <CampoDetalhe label="Ano escolar">{aluno.anoEscolar}</CampoDetalhe>
                    <CampoDetalhe label="Informações gerais" destaque>
                        {aluno.informacoesGerais || 'Nenhuma informação adicional.'}
                    </CampoDetalhe>
                </div>
            </SecaoDetalhes>

            <SecaoDetalhes title="Responsável" Icone={FaUser}>
                {responsavel ? (
                    <>
                        <Link
                            to={`/clientes/responsavel/${responsavel.id}`}
                            state={{ registro: responsavel }}
                            className={styles.itemRelacionado}
                        >
                            <FaUser aria-hidden="true" />
                            <span>{responsavel.nome}</span>
                            <FaChevronRight className={styles.setaItem} aria-hidden="true" />
                        </Link>
                        <div className={styles.gradeDados}>
                            <CampoDetalhe label="Telefone">{responsavel.telefone}</CampoDetalhe>
                            <CampoDetalhe label="E-mail">{responsavel.email}</CampoDetalhe>
                        </div>
                    </>
                ) : (
                    <p className={styles.estadoVazio}>{aluno.responsavel || 'Responsável não informado.'}</p>
                )}
            </SecaoDetalhes>

            <SecaoDetalhes title="Escola" Icone={FaSchool}>
                {escola ? (
                    <Link
                        to={`/clientes/escola/${escola.id}`}
                        state={{ registro: escola }}
                        className={styles.itemRelacionado}
                    >
                        <FaSchool aria-hidden="true" />
                        <span>{escola.nome}</span>
                        <FaChevronRight className={styles.setaItem} aria-hidden="true" />
                    </Link>
                ) : (
                    <p className={styles.estadoVazio}>Escola não informada.</p>
                )}
            </SecaoDetalhes>
        </>
    )
}

export default DetalhesAluno
