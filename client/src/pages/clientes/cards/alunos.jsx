import { useEffect, useState } from 'react'
import { alterarAluno, criarAluno, excluirAluno, listarAluno } from '../../../services/aluno'
import { listarResponsaveis } from '../../../services/responsaveis'
import { listarEscola } from '../../../services/escola'
import { listarTurnosEscola } from '../../../services/turnosEscola'
import ListaClientes from './ListaClientes'

const adaptarParaLista = (aluno, turnos) => {
    const escolaTurnoId = aluno.escolaTurnoId || aluno.escola_turno_id
    const turnoCadastrado = turnos.find((turno) => String(turno.id) === String(escolaTurnoId))

    return {
    ...aluno,
    dataNascimento: aluno.dataNascimento || aluno.data_nasc,
    anoEscolar: aluno.anoEscolar || aluno.ano_escolar,
    responsavelId: aluno.responsavelId || aluno.responsavel_id,
    escolaId: aluno.escolaId || aluno.escola_id,
    escolaTurnoId,
    turno: turnoCadastrado?.turno || aluno.turno,
    detalhes: [
        aluno.responsavel && `Responsável: ${aluno.responsavel}`,
        [aluno.anoEscolar || aluno.ano_escolar, turnoCadastrado?.turno || aluno.turno, aluno.dataNascimento || aluno.data_nasc]
            .filter(Boolean)
            .join(' · '),
    ].filter(Boolean),
    }
}

const Alunos = () => {
    const [alunos, setAlunos] = useState([])
    const [responsaveis, setResponsaveis] = useState([])
    const [escolas, setEscolas] = useState([])
    const [turnos, setTurnos] = useState([])

    useEffect(() => {
        const carregarAlunos = async () => {
            const [dadosAlunos, dadosResponsaveis, dadosEscolas, dadosTurnos] = await Promise.all([
                listarAluno(),
                listarResponsaveis(),
                listarEscola(),
                listarTurnosEscola(),
            ])

            setAlunos(dadosAlunos.map((aluno) => adaptarParaLista(aluno, dadosTurnos)))
            setResponsaveis(dadosResponsaveis)
            setEscolas(dadosEscolas)
            setTurnos(dadosTurnos)
        }

        carregarAlunos()
    }, [])

    const salvarNovoAluno = async (valores) => {
        const alunoCriado = await criarAluno(valores)

        setAlunos((listaAtual) => [
            adaptarParaLista(alunoCriado, turnos),
            ...listaAtual,
        ])
    }

    //====================
    //ALTERAR ALUNO
    //====================
    const salvarAlunoAlterado = (id, valores) => alterarAluno(id, valores) //mando os dados alterados para o backend

    //====================
    //EXCLUIR ALUNO
    //====================
    const excluirAlunoDoBanco = async (id) => {
        await excluirAluno(id)
        setAlunos((listaAtual) => listaAtual.filter((aluno) => aluno.id !== id))
    }

    return (
        <ListaClientes
            title="Lista de alunos"
            tipo="aluno"
            registros={alunos}
            responsaveis={responsaveis}
            escolas={escolas}
            turnos={turnos}
            onCriar={salvarNovoAluno}
            onEditar={salvarAlunoAlterado}
            onExcluir={excluirAlunoDoBanco}
        />
    )
}

export default Alunos