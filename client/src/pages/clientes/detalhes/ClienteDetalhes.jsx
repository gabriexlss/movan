import { useState } from 'react'
import { FaArrowLeft, FaPencilAlt, FaTrash } from 'react-icons/fa'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import fotoPlaceholder from '../../../assets/media/img/placeholders/placeholder.jpg'
import TituloTela from '../../../components/layout/tituloTela'
import DialogExcluirCliente from '../dialogs/DialogExcluirCliente'
import DialogFormularioCliente from '../dialogs/DialogFormularioCliente'
import { buscarCliente, responsaveis } from '../clientes-data'
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

    const registroRecebido = state?.registro?.id === id ? state.registro : null
    const registroEncontrado = registroRecebido || buscarCliente(tipo, id)
    const cliente = registroAlterado?.id === id ? registroAlterado : registroEncontrado
    const ConteudoDetalhes = componentesPorTipo[tipo]

    if (!cliente || !ConteudoDetalhes) {
        return (
            <main className={styles.container}>
                <TituloTela title="Veja seus clientes." />
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

    const salvarEdicao = (valores) => {
        setRegistroAlterado((registroAtual) => ({
            ...(registroAtual || cliente),
            ...valores,
        }))
        setDialog(null)
    }

    return (
        <main className={styles.container}>
            <TituloTela title="Veja seus clientes." />

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
                <ConteudoDetalhes cliente={cliente} />
            </div>

            {dialog === 'editar' && (
                <DialogFormularioCliente
                    acao="editar"
                    tipo={tipo}
                    registro={cliente}
                    responsaveis={nomesResponsaveis}
                    onClose={() => setDialog(null)}
                    onSave={salvarEdicao}
                />
            )}

            {dialog === 'excluir' && (
                <DialogExcluirCliente
                    tipo={tipo}
                    registro={cliente}
                    onClose={() => setDialog(null)}
                    onConfirm={() => navigate('/clientes', { replace: true })}
                />
            )}
        </main>
    )
}

export default ClienteDetalhes
