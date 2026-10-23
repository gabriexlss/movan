import { FaChevronRight, FaInfoCircle, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { alunos } from '../clientes-data'
import SecaoDetalhes, { CampoDetalhe } from './SecaoDetalhes'
import styles from './clienteDetalhes.module.css'

const DetalhesEscola = ({ cliente: escola }) => {
    const alunosVinculados = alunos.filter((aluno) => aluno.escolaId === escola.id)

    return (
        <>
            <SecaoDetalhes title="Informações de cadastro" Icone={FaInfoCircle}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="Telefone para contato">{escola.telefone}</CampoDetalhe>
                    <CampoDetalhe label="Horário de funcionamento">{escola.funcionamento}</CampoDetalhe>
                </div>
            </SecaoDetalhes>

            <SecaoDetalhes title="Endereço" Icone={FaMapMarkerAlt}>
                <address className={styles.endereco}>{escola.endereco}</address>
            </SecaoDetalhes>

            <SecaoDetalhes title="Alunos registrados na escola" Icone={FaUserGraduate}>
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
                    <p className={styles.estadoVazio}>Nenhum aluno vinculado.</p>
                )}
                <p className={styles.contagem}>{alunosVinculados.length} aluno(s) vinculado(s)</p>
            </SecaoDetalhes>
        </>
    )
}

export default DetalhesEscola
