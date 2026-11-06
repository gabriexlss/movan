import { useEffect, useState } from 'react'
import { FaChevronRight, FaInfoCircle, FaMapMarkerAlt, FaUserGraduate } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { obterEndereco } from '../../../services/googlePlaces'
import { listarAluno } from '../../../services/aluno'
import SecaoDetalhes, { CampoDetalhe } from './SecaoDetalhes'
import styles from './clienteDetalhes.module.css'

const DetalhesEscola = ({ cliente: escola }) => {
    const [alunos, setAlunos] = useState([])
    const [enderecoPorCoordenadas, setEnderecoPorCoordenadas] = useState('')

    useEffect(() => {
        let ativo = true

        listarAluno().then((dados) => {
            if (ativo) setAlunos(dados)
        })

        return () => {
            ativo = false
        }
    }, [])

    useEffect(() => {
        const latitude = Number(escola.latitude)
        const longitude = Number(escola.longitude)
        const possuiCoordenadas = escola.latitude !== null && escola.latitude !== ''
            && escola.longitude !== null && escola.longitude !== ''
            && Number.isFinite(latitude) && Number.isFinite(longitude)

        if (escola.endereco || !possuiCoordenadas) {
            return undefined
        }

        let ativo = true
        obterEndereco(latitude, longitude)
            .then((endereco) => {
                if (ativo) setEnderecoPorCoordenadas(endereco)
            })
            .catch(() => {
                if (ativo) setEnderecoPorCoordenadas('')
            })

        return () => {
            ativo = false
        }
    }, [escola.endereco, escola.latitude, escola.longitude])

    const alunosVinculados = alunos.filter((aluno) => (
        String(aluno.escola_id ?? aluno.escolaId) === String(escola.id)
    ))

    return (
        <>
            <SecaoDetalhes title="Informações de cadastro" Icone={FaInfoCircle}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="Telefone para contato">{escola.telefone}</CampoDetalhe>
                </div>
            </SecaoDetalhes>

            <SecaoDetalhes title="Endereço" Icone={FaMapMarkerAlt}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="Endereço" destaque>
                        <address className={styles.endereco}>
                            {escola.endereco || enderecoPorCoordenadas || 'Endereço não informado'}
                        </address>
                    </CampoDetalhe>
                </div>
            </SecaoDetalhes>

            <SecaoDetalhes title="Alunos registrados na escola" Icone={FaUserGraduate}>
                {alunosVinculados.length > 0 ? (
                    <ul className={styles.listaRelacionada}>
                        {alunosVinculados.map((aluno) => (
                            <li key={aluno.id}>
                                <Link
                                    to={`/clientes/aluno/${aluno.id}`}
                                    state={{ registro: {
                                        ...aluno,
                                        dataNascimento: aluno.dataNascimento || aluno.data_nasc,
                                        anoEscolar: aluno.anoEscolar || aluno.ano_escolar,
                                        responsavelId: aluno.responsavelId || aluno.responsavel_id,
                                        escolaId: aluno.escolaId || aluno.escola_id,
                                    } }}
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
