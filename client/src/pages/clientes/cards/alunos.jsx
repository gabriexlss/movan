import { useEffect, useState } from 'react'
import { alterarAluno, criarAluno, excluirAluno, listarAluno } from '../../../services/aluno'
import ListaClientes from './ListaClientes'

const MESES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

const formatarData = (data) => {
    if (!data) return ''
    const [ano, mes, dia] = String(data).slice(0, 10).split('-')
    const mesIndex = Number(mes) - 1
    if (ano && mes && dia && mesIndex >= 0 && mesIndex < 12) {
        return `${Number(dia)} de ${MESES[mesIndex]} de ${ano}`
    }
    return data
}

const adaptarParaLista = (aluno, turnos) => {
    const escolaTurnoId = aluno.escolaTurnoId || aluno.escola_turno_id
    const turnoCadastrado = turnos.find((turno) => String(turno.id) === String(escolaTurnoId))

    // Mantém YYYY-MM-DD no dataNascimento (necessário para o formulário e input type="date")
    const dataNascimentoIso = (aluno.dataNascimento || aluno.data_nasc || '').slice(0, 10)
    // Converte para DD/MM/AAAA para exibição na lista
    const dataNascimentoExibicao = formatarData(dataNascimentoIso)

    return {
        ...aluno,
        dataNascimento: dataNascimentoIso,
        anoEscolar: aluno.anoEscolar || aluno.ano_escolar,
        informacoesGerais: aluno.informacoesGerais || aluno.observacao || '',
        responsavelId: aluno.responsavelId || aluno.responsavel_id,
        escolaId: aluno.escolaId || aluno.escola_id,
        escolaTurnoId,
        turno: turnoCadastrado?.turno || aluno.turno,
        detalhes: [
            aluno.responsavel && `Responsável: ${aluno.responsavel}`,
            [
                aluno.anoEscolar || aluno.ano_escolar,
                turnoCadastrado?.turno || aluno.turno,
                dataNascimentoExibicao,
            ]
                .filter(Boolean)
                .join(' · '),
        ].filter(Boolean),
    }
}

const Alunos = ({ responsaveis, escolas, turnos }) => {
    const [alunos, setAlunos] = useState([])

    useEffect(() => {
        listarAluno().then((dadosAlunos) => {
            setAlunos(dadosAlunos.map((aluno) => adaptarParaLista(aluno, turnos)))
        })
    }, [turnos])

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