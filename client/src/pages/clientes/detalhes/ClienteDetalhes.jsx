import { useEffect, useState } from 'react'
import { FaArrowLeft, FaPencilAlt, FaTrash } from 'react-icons/fa'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import fotoPlaceholder from '../../../assets/media/img/placeholders/placeholder.jpg'
import TituloTela from '../../../components/layout/tituloTela'
import DialogExcluirCliente from '../dialogs/DialogExcluirCliente'
import DialogFormularioCliente from '../dialogs/DialogFormularioCliente'
import { buscarCliente, responsaveis } from '../clientes-data'
import { alterarAluno, excluirAluno, obterAluno } from '../../../services/aluno'
import { alterarEscola, excluirEscola, listarEscola, obterEscola } from '../../../services/escola'
import { alterarResponsavel, excluirResponsavel, listarResponsaveis, obterResponsavel } from '../../../services/responsaveis'
import { listarTurnosEscola } from '../../../services/turnosEscola'
import DetalhesAluno from './DetalhesAluno'
import DetalhesEscola from './DetalhesEscola'
import DetalhesResponsavel from './DetalhesResponsavel'
import styles from './clienteDetalhes.module.css'

const componentesPorTipo = {
    aluno: DetalhesAluno,
    escola: DetalhesEscola,
    responsavel: DetalhesResponsavel,
}

const nomesPorTipo = {
    aluno: 'Aluno',
    escola: 'Escola',
    responsavel: 'Responsável',
}

const nomesSituacao = {
    ativo: 'Contrato ativo',
    pendente: 'Contrato pendente',
    atrasado: 'Contrato atrasado',
}

const ClienteDetalhes = () => {
    const { tipo, id } = useParams()
    const { state } = useLocation()
    const navigate = useNavigate()
    const [registroAlterado, setRegistroAlterado] = useState(null)
    const [dialog, setDialog] = useState(null)
    const [registroApi, setRegistroApi] = useState(null)
    const [opcoes, setOpcoes] = useState({ responsaveis: [], escolas: [], turnos: [] })

    useEffect(() => {
        if (!id) return undefined

        let ativo = true
        const obterRegistro = tipo === 'aluno'
            ? obterAluno
            : tipo === 'escola'
                ? obterEscola
                : obterResponsavel

        obterRegistro(id)
            .then((registro) => {
                if (ativo) setRegistroApi(registro)
            })

        return () => {
            ativo = false
        }
    }, [tipo, id])

    useEffect(() => {
        if (tipo !== 'aluno' && tipo !== 'escola') return undefined

        let ativo = true
        Promise.all([
            tipo === 'aluno' ? listarResponsaveis() : Promise.resolve([]),
            listarEscola(),
            listarTurnosEscola(),
        ]).then(([dadosResponsaveis, dadosEscolas, dadosTurnos]) => {
            if (ativo) setOpcoes({ responsaveis: dadosResponsaveis, escolas: dadosEscolas, turnos: dadosTurnos })
        })

        return () => {
            ativo = false
        }
    }, [tipo])

    const registroRecebido = state?.registro && String(state.registro.id) === id ? state.registro : null
    const registroEncontrado = registroApi || registroRecebido || buscarCliente(tipo, id)
    const cliente = String(registroAlterado?.id) === id ? registroAlterado : registroEncontrado
    const ConteudoDetalhes = componentesPorTipo[tipo]

    if (!cliente || !ConteudoDetalhes) {
        return (
            <main className={styles.container}>
                <TituloTela title="Detalhes do cliente" />
                <section className={styles.naoEncontrado}>
                    <h1>Cliente não encontrado</h1>
                    <p>O tipo ou o identificador informado não corresponde a um cliente cadastrado.</p>
                    <Link to="/clientes">Voltar para clientes</Link>
                </section>
            </main>
        )
    }

    const situacaoContrato = tipo === 'responsavel' ? cliente.situacaoContrato : null
    const nomesResponsaveis = responsaveis.map((responsavel) => responsavel.nome)

    const alterarPorTipo = {
        aluno: alterarAluno,
        escola: alterarEscola,
        responsavel: alterarResponsavel,
    }

    const excluirPorTipo = {
        aluno: excluirAluno,
        escola: excluirEscola,
        responsavel: excluirResponsavel,
    }

    const salvarEdicao = async (valores) => {
        const registroAtualizado = await alterarPorTipo[tipo](cliente.id, valores) //mando os dados alterados para o backend
        setRegistroAlterado((registroAtual) => ({
            ...(registroAtual || cliente),
            ...registroAtualizado,
            ...valores,
        })) //atualizo os dados mostrados na tela
        setDialog(null) //fecho o formulario de edicao
    }

    const excluirRegistro = async () => {
        await excluirPorTipo[tipo](cliente.id) //mando o id do registro para o backend excluir
        navigate('/clientes', { replace: true }) //volto para a lista depois da exclusao
    }

    return (
        <main className={styles.container}>
            <TituloTela
                title={`Detalhes ${tipo === 'escola' ? 'da' : 'do'} ${nomesPorTipo[tipo].toLocaleLowerCase('pt-BR')}: ${cliente.nome}`}
                className={styles.tituloDetalhes}
            />

            <div className={styles.barraNavegacao}>
                <Link to="/clientes" className={styles.voltar}>
                    <FaArrowLeft aria-hidden="true" />
                    Voltar para clientes
                </Link>
            </div>

            <section className={styles.identificacao}>
                <span className={styles.avatar} aria-hidden="true">
                    <img src={fotoPlaceholder} alt="" />
                </span>

                <div className={styles.identificacaoTexto}>
                    <span className={styles.tipoCliente}>{nomesPorTipo[tipo]}</span>
                    <h1 className={`${styles.nomeCliente} ${situacaoContrato ? styles[`nome-${situacaoContrato}`] : ''}`}>
                        {cliente.nome}
                    </h1>
                    {situacaoContrato && (
                        <span className={`${styles.status} ${styles[`status-${situacaoContrato}`]}`}>
                            {nomesSituacao[situacaoContrato] || situacaoContrato}
                        </span>
                    )}
                </div>

                <div className={styles.acoes}>
                    <button
                        type="button"
                        className={styles.editar}
                        aria-label={`Editar ${cliente.nome}`}
                        title={`Editar ${cliente.nome}`}
                        onClick={() => setDialog('editar')}
                    >
                        <FaPencilAlt aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className={styles.excluir}
                        aria-label={`Excluir ${cliente.nome}`}
                        title={`Excluir ${cliente.nome}`}
                        onClick={() => setDialog('excluir')}
                    >
                        <FaTrash aria-hidden="true" />
                    </button>
                </div>
            </section>

            <div className={styles.secoes}>
                <ConteudoDetalhes cliente={cliente} turnos={opcoes.turnos} />
            </div>

            {dialog === 'editar' && (
                <DialogFormularioCliente
                    acao="editar"
                    tipo={tipo}
                    registro={cliente}
                    responsaveis={tipo === 'aluno' ? opcoes.responsaveis : nomesResponsaveis}
                    escolas={opcoes.escolas}
                    turnos={opcoes.turnos}
                    onTurnosChange={(atualizar) => setOpcoes((estadoAtual) => ({
                        ...estadoAtual,
                        turnos: typeof atualizar === 'function' ? atualizar(estadoAtual.turnos) : atualizar,
                    }))}
                    onClose={() => setDialog(null)}
                    onSave={salvarEdicao}
                />
            )}

            {dialog === 'excluir' && (
                <DialogExcluirCliente
                    tipo={tipo}
                    registro={cliente}
                    onClose={() => setDialog(null)}
                    onConfirm={excluirRegistro}
                />
            )}
        </main>
    )
}

export default ClienteDetalhes
