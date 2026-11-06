import { useEffect, useState } from 'react'
import { FaChevronRight, FaInfoCircle, FaSchool, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { obterEscola } from '../../../services/escola'
import { obterResponsavel } from '../../../services/responsaveis'
import { obterEndereco } from '../../../services/googlePlaces'
import SecaoDetalhes, { CampoDetalhe } from './SecaoDetalhes'
import styles from './clienteDetalhes.module.css'

const formatarData = (data) => {
    if (!data) return 'Não informada'
    const [ano, mes, dia] = data.split('-')
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}

const DetalhesAluno = ({ cliente: aluno, turnos = [] }) => {
    const [endereco, setEndereco] = useState('')
    const [responsavel, setResponsavel] = useState(null)
    const [escola, setEscola] = useState(null)

    useEffect(() => {
        let ativo = true
        const responsavelId = aluno.responsavelId || aluno.responsavel_id
        const escolaId = aluno.escolaId || aluno.escola_id

        Promise.all([
            responsavelId ? obterResponsavel(responsavelId) : Promise.resolve(null),
            escolaId ? obterEscola(escolaId) : Promise.resolve(null),
        ]).then(([dadosResponsavel, dadosEscola]) => {
            if (!ativo) return
            setResponsavel(dadosResponsavel)
            setEscola(dadosEscola)
        })

        return () => {
            ativo = false
        }
    }, [aluno.responsavelId, aluno.responsavel_id, aluno.escolaId, aluno.escola_id])

    useEffect(() => {
        const latitude = Number(aluno.latitude)
        const longitude = Number(aluno.longitude)
        const possuiCoordenadas = aluno.latitude !== null && aluno.latitude !== ''
            && aluno.longitude !== null && aluno.longitude !== ''
            && Number.isFinite(latitude) && Number.isFinite(longitude)

        if (!possuiCoordenadas) {
            return undefined
        }

        let ativo = true

        obterEndereco(latitude, longitude)
            .then((valor) => {
                if (ativo) setEndereco(valor || 'Endereço não encontrado.')
            })
            .catch(() => {
                if (ativo) setEndereco('Não foi possível obter o endereço.')
            })

        return () => {
            ativo = false
        }
    }, [aluno.latitude, aluno.longitude])

    const possuiCoordenadas = aluno.latitude !== null && aluno.latitude !== ''
        && aluno.longitude !== null && aluno.longitude !== ''
        && Number.isFinite(Number(aluno.latitude)) && Number.isFinite(Number(aluno.longitude))
    const enderecoExibido = possuiCoordenadas
        ? endereco || 'Carregando endereço...'
        : 'Endereço não informado.'
    const escolaTurnoId = aluno.escolaTurnoId || aluno.escola_turno_id
    const turno = turnos.find((item) => String(item.id) === String(escolaTurnoId))

    return (
        <>
            <SecaoDetalhes title="Informações de cadastro" Icone={FaInfoCircle}>
                <div className={styles.gradeDados}>
                    <CampoDetalhe label="Data de nascimento">{formatarData(aluno.dataNascimento)}</CampoDetalhe>
                    <CampoDetalhe label="Turno">{turno?.turno || aluno.turno}</CampoDetalhe>
                    <CampoDetalhe label="Ano escolar">{aluno.anoEscolar}</CampoDetalhe>
                    <CampoDetalhe label="Endereço" destaque>{enderecoExibido}</CampoDetalhe>
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
