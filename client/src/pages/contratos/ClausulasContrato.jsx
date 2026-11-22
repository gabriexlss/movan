import { useCallback, useEffect, useState } from 'react'
import {
    FaArrowDown,
    FaArrowUp,
    FaBan,
    FaChevronRight,
    FaEdit,
    FaExternalLinkAlt,
    FaFilePdf,
    FaLink,
    FaPenNib,
    FaPlus,
    FaTrash,
} from 'react-icons/fa'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import DialogContrato from './dialogs/DialogContrato'
import DialogNovaClausula from './dialogs/DialogNovaClausula'
import DialogConfirmarAcao from './dialogs/DialogConfirmarAcao'
import DialogCancelarContrato from './dialogs/DialogCancelarContrato'
import {
    cancelarContrato,
    criarClausula,
    criarClausulaPadrao,
    editarClausula,
    editarClausulaPadrao,
    editarContrato,
    excluirClausula,
    excluirClausulaPadrao,
    excluirContrato,
    finalizarContrato,
    listarClausulasPadrao,
    moverClausula,
    moverClausulaPadrao,
    obterContrato,
    recriarLinkContrato,
} from '../../services/contrato'
import { apiErrorToast, getApiErrorMessage, successToast } from '../../services/toastManager'
import { formatarData, formatarMoeda, normalizarSituacaoContrato, situacoesContrato } from './contratos-data'
import styles from './fluxoContratos.module.css'

const ClausulasContrato = ({ gerado = false }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const modoContrato = Boolean(gerado && id)

    const [contrato, setContrato] = useState(null)
    const [clausulasFixas, setClausulasFixas] = useState([])
    const [clausulasExtras, setClausulasExtras] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erroCarregamento, setErroCarregamento] = useState('')

    const [dialogClausula, setDialogClausula] = useState(null) // { acao: 'criar' | 'editar', clausula?: object }
    const [clausulaParaExcluir, setClausulaParaExcluir] = useState(null)
    const [dialogEditarContrato, setDialogEditarContrato] = useState(false)
    const [dialogExcluirContrato, setDialogExcluirContrato] = useState(false)
    const [dialogCancelarContrato, setDialogCancelarContrato] = useState(false)
    const [dialogRecriarLink, setDialogRecriarLink] = useState(false)

    const [movendoOrdem, setMovendoOrdem] = useState(null)
    const [finalizando, setFinalizando] = useState(false)
    const [erroFinalizacao, setErroFinalizacao] = useState('')
    const [faltaAssinatura, setFaltaAssinatura] = useState(false)

    const carregarDados = useCallback(async () => {
        setCarregando(true)
        setErroCarregamento('')
        try {
            if (modoContrato) {
                const dados = await obterContrato(id)
                setContrato(dados)
                const lista = [...(dados?.clausula || [])].sort((a, b) => a.ordem - b.ordem)
                const extras = lista.filter((item) => item.editavel || item.origem === 'MOTORISTA' || item.origem === 'PERSONALIZADO')
                const fixas = lista.filter((item) => !extras.includes(item))
                setClausulasFixas(fixas)
                setClausulasExtras(extras)
            } else {
                const { clausulasMotorista, clausulasSistema } = await listarClausulasPadrao()
                setContrato(null)
                setClausulasFixas([...clausulasSistema].sort((a, b) => a.ordem - b.ordem))
                setClausulasExtras([...clausulasMotorista].sort((a, b) => a.ordem - b.ordem))
            }
        } catch (error) {
            setErroCarregamento(getApiErrorMessage(error, 'UNEXPECTED_ERROR'))
        } finally {
            setCarregando(false)
        }
    }, [modoContrato, id])

    useEffect(() => {
        const timer = window.setTimeout(() => carregarDados(), 0)
        return () => window.clearTimeout(timer)
    }, [carregarDados])

    const situacao = contrato ? normalizarSituacaoContrato(contrato.status) : ''
    const isRascunho = modoContrato && contrato?.status === 'RASCUNHO'
    const isAguardando = modoContrato && contrato?.status === 'AGUARDANDO_ASSINATURA'
    const isAtivo = modoContrato && contrato?.status === 'ATIVO'
    const podeGerenciarClausulas = !modoContrato || isRascunho

    const salvarClausula = async (valores) => {
        try {
            if (dialogClausula?.acao === 'editar' && dialogClausula?.clausula) {
                if (modoContrato) {
                    await editarClausula(id, dialogClausula.clausula.ordem, valores)
                } else {
                    await editarClausulaPadrao(dialogClausula.clausula.ordem, valores)
                }
                successToast('CLAUSE_UPDATED')
            } else {
                if (modoContrato) {
                    await criarClausula(id, valores)
                } else {
                    await criarClausulaPadrao(valores)
                }
                successToast('CLAUSE_CREATED')
            }
            setDialogClausula(null)
            await carregarDados()
        } catch (error) {
            apiErrorToast(error, dialogClausula?.acao === 'editar' ? 'CLAUSE_UPDATE_FAILED' : 'CLAUSE_CREATE_FAILED')
        }
    }

    const confirmarExcluirClausula = async () => {
        if (!clausulaParaExcluir) return
        try {
            if (modoContrato) {
                await excluirClausula(id, clausulaParaExcluir.ordem)
            } else {
                await excluirClausulaPadrao(clausulaParaExcluir.ordem)
            }
            successToast('CLAUSE_DELETED')
            setClausulaParaExcluir(null)
            await carregarDados()
        } catch (error) {
            apiErrorToast(error, 'CLAUSE_DELETE_FAILED')
        }
    }

    const moverItem = async (index, direcao) => {
        const destinoIndex = index + direcao
        if (destinoIndex < 0 || destinoIndex >= clausulasExtras.length || movendoOrdem !== null) return

        const atual = clausulasExtras[index]
        const vizinha = clausulasExtras[destinoIndex]
        setMovendoOrdem(atual.ordem)
        try {
            if (modoContrato) {
                await moverClausula(id, atual.ordem, vizinha.ordem)
            } else {
                await moverClausulaPadrao(atual.ordem, vizinha.ordem)
            }
            successToast('CLAUSE_MOVED')
            await carregarDados()
        } catch (error) {
            apiErrorToast(error, 'CLAUSE_MOVE_FAILED')
        } finally {
            setMovendoOrdem(null)
        }
    }

    const salvarEdicaoContrato = async (valores) => {
        try {
            await editarContrato(id, valores)
            successToast('CONTRACT_UPDATED')
            setDialogEditarContrato(false)
            await carregarDados()
        } catch (error) {
            apiErrorToast(error, 'CONTRACT_UPDATE_FAILED')
        }
    }

    const confirmarExcluirContrato = async () => {
        try {
            await excluirContrato(id)
            successToast('CONTRACT_DELETED')
            navigate('/contratos', { replace: true })
        } catch (error) {
            apiErrorToast(error, 'CONTRACT_DELETE_FAILED')
        }
    }

    const concluirEGerarPdf = async () => {
        if (finalizando) return
        setErroFinalizacao('')
        setFaltaAssinatura(false)
        setFinalizando(true)
        try {
            const resposta = await finalizarContrato(id)
            successToast('CONTRACT_FINALIZED')
            let contratoAtualizado = contrato
            try {
                contratoAtualizado = await obterContrato(id)
            } catch {
                contratoAtualizado = { ...contrato, status: 'AGUARDANDO_ASSINATURA' }
            }
            navigate('/contratos/link', {
                state: {
                    contrato: contratoAtualizado,
                    link: resposta.link,
                },
            })
        } catch (error) {
            const mensagem = getApiErrorMessage(error, 'CONTRACT_FINALIZE_FAILED')
            setErroFinalizacao(mensagem)
            if (error.response?.status === 401 && mensagem.toLocaleLowerCase('pt-BR').includes('assinatura')) {
                setFaltaAssinatura(true)
            }
        } finally {
            setFinalizando(false)
        }
    }

    const confirmarRecriarLink = async () => {
        try {
            const resposta = await recriarLinkContrato(id)
            successToast('CONTRACT_LINK_RECREATED')
            setDialogRecriarLink(false)
            navigate('/contratos/link', {
                state: {
                    contrato,
                    link: resposta.link,
                },
            })
        } catch (error) {
            apiErrorToast(error, 'CONTRACT_LINK_RECREATE_FAILED')
        }
    }

    const confirmarCancelarContrato = async (motivo) => {
        try {
            await cancelarContrato(id, motivo)
            successToast('CONTRACT_CANCELLED')
            setDialogCancelarContrato(false)
            await carregarDados()
        } catch (error) {
            apiErrorToast(error, 'CONTRACT_CANCEL_FAILED')
        }
    }

    if (carregando) {
        return (
            <ContratoLayout subtitle={modoContrato ? 'Detalhes do contrato' : 'Cláusulas padrão'} voltar>
                <p className={styles.mensagem} role="status">
                    {modoContrato ? 'Carregando contrato...' : 'Carregando cláusulas padrão...'}
                </p>
            </ContratoLayout>
        )
    }

    if (erroCarregamento || (modoContrato && !contrato)) {
        return (
            <ContratoLayout subtitle={modoContrato ? 'Detalhes do contrato' : 'Cláusulas padrão'} voltar>
                <div className={styles.alertaErro} role="alert">
                    <p>{erroCarregamento || 'Contrato não encontrado.'}</p>
                    <button type="button" className={styles.botaoPrincipal} onClick={carregarDados}>
                        Tentar novamente
                    </button>
                </div>
            </ContratoLayout>
        )
    }

    const resumoContrato = contrato ? [
        ['Código', `#${contrato.contrato_id}`],
        ['Responsável', contrato.nome_responsavel || 'Não informado'],
        ['Aluno', contrato.nome_aluno || 'Não informado'],
        ['Escola', contrato.nome_escola || 'Não informada'],
        ['Início', formatarData(contrato.data_inicio)],
        ['Término', formatarData(contrato.data_fim)],
        ['Dia de vencimento', contrato.dia_vencimento ? `Dia ${contrato.dia_vencimento}` : 'Não informado'],
        ['Valor mensal', formatarMoeda(contrato.valor_mensal)],
        ...(contrato.motivo_cancelamento ? [['Motivo do cancelamento', contrato.motivo_cancelamento]] : []),
    ] : []

    return (
        <ContratoLayout subtitle={modoContrato ? 'Detalhes do contrato' : 'Cláusulas padrão'} voltar>
            <AvisoContrato
                destaque={!modoContrato}
                title={modoContrato
                    ? (isRascunho
                        ? 'Rascunho de contrato'
                        : isAguardando
                            ? 'Aguardando assinatura do responsável'
                            : isAtivo
                                ? 'Contrato ativo'
                                : `Contrato ${(situacoesContrato[situacao] || situacao).toLocaleLowerCase('pt-BR')}`)
                    : 'Atenção! Estas cláusulas serão utilizadas como base para todos os seus contratos.'}
            >
                {modoContrato
                    ? (isRascunho
                        ? 'Revise os dados e personalize as cláusulas antes de gerar o PDF e o link de assinatura.'
                        : isAguardando
                            ? 'O PDF já foi gerado e enviado para assinatura. Você pode visualizar o documento, gerar um novo link ou cancelar o contrato.'
                            : isAtivo
                                ? 'Este contrato foi assinado por ambas as partes e está ativo.'
                                : 'Este contrato não aceita mais alterações.')
                    : 'Além das cláusulas fixas do sistema, você pode criar, editar, remover e reordenar suas cláusulas padrão. Alterações aqui também atualizam contratos em rascunho.'}
            </AvisoContrato>

            {modoContrato && contrato && (
                <section className={styles.card} aria-labelledby="titulo-dados-contrato">
                    <div className={styles.cabecalhoResumo}>
                        <h2 id="titulo-dados-contrato" className={styles.tituloSecao}>Dados do contrato</h2>
                        <span className={`${styles.status} ${styles[situacao] || ''}`}>
                            {situacoesContrato[situacao] || contrato.status}
                        </span>
                    </div>
                    <dl className={styles.resumo}>
                        {resumoContrato.map(([rotulo, valor]) => (
                            <div key={rotulo}>
                                <dt>{rotulo}</dt>
                                <dd>{valor}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className={styles.acoesContrato}>
                        {isRascunho && (
                            <>
                                <button
                                    type="button"
                                    className={styles.botaoSecundario}
                                    onClick={() => setDialogEditarContrato(true)}
                                >
                                    <FaEdit aria-hidden="true" />
                                    Editar dados
                                </button>
                                <button
                                    type="button"
                                    className={styles.botaoPerigo}
                                    onClick={() => setDialogExcluirContrato(true)}
                                >
                                    <FaTrash aria-hidden="true" />
                                    Excluir rascunho
                                </button>
                            </>
                        )}

                        {contrato.pdf && (
                            <a
                                href={contrato.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.botaoPrincipal}
                            >
                                <FaFilePdf aria-hidden="true" />
                                {isAtivo ? 'Abrir PDF assinado' : 'Abrir PDF'}
                                <FaExternalLinkAlt aria-hidden="true" style={{ fontSize: '.75rem' }} />
                            </a>
                        )}

                        {isAguardando && (
                            <button
                                type="button"
                                className={styles.botaoSecundario}
                                onClick={() => setDialogRecriarLink(true)}
                            >
                                <FaLink aria-hidden="true" />
                                Recriar link de assinatura
                            </button>
                        )}

                        {(isAguardando || isAtivo) && (
                            <button
                                type="button"
                                className={styles.botaoPerigo}
                                onClick={() => setDialogCancelarContrato(true)}
                            >
                                <FaBan aria-hidden="true" />
                                Cancelar contrato
                            </button>
                        )}
                    </div>
                </section>
            )}

            <section className={styles.secaoClausulas} aria-labelledby="titulo-clausulas-fixas">
                <h2 id="titulo-clausulas-fixas" className={styles.tituloSecao}>Cláusulas fixas:</h2>
                {clausulasFixas.length > 0 ? (
                    <div className={styles.listaClausulas}>
                        {clausulasFixas.map((clausula) => (
                            <details className={styles.clausula} key={clausula.id || clausula.ordem}>
                                <summary>
                                    <span>{clausula.titulo}</span>
                                    <FaChevronRight aria-hidden="true" />
                                </summary>
                                <div className={styles.textoClausula}>
                                    <p>{clausula.conteudo}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                ) : (
                    <p className={styles.vazioSecao}>Nenhuma cláusula fixa disponível.</p>
                )}
            </section>

            <section className={styles.secaoClausulas} aria-labelledby="titulo-clausulas-extras">
                <div className={styles.cabecalhoExtras}>
                    <h2 id="titulo-clausulas-extras">
                        {modoContrato ? 'Cláusulas extras' : 'Suas cláusulas padrão'}
                    </h2>
                    {podeGerenciarClausulas && (
                        <button
                            type="button"
                            onClick={() => setDialogClausula({ acao: 'criar' })}
                            aria-haspopup="dialog"
                        >
                            <FaPlus aria-hidden="true" />
                            Adicionar cláusula
                        </button>
                    )}
                </div>
                {clausulasExtras.length > 0 ? (
                    <div className={styles.listaClausulas}>
                        {clausulasExtras.map((clausula, index) => (
                            <details className={styles.clausula} key={clausula.id || clausula.ordem}>
                                <summary>
                                    <span>{clausula.titulo}</span>
                                    <FaChevronRight aria-hidden="true" />
                                </summary>
                                <div className={styles.textoClausula}>
                                    <p>{clausula.conteudo}</p>
                                    {podeGerenciarClausulas && (
                                        <div className={styles.acoesClausula}>
                                            <button
                                                type="button"
                                                className={styles.botaoIcone}
                                                disabled={index === 0 || movendoOrdem !== null}
                                                onClick={() => moverItem(index, -1)}
                                                aria-label={`Mover ${clausula.titulo} para cima`}
                                            >
                                                <FaArrowUp aria-hidden="true" /> Subir
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.botaoIcone}
                                                disabled={index === clausulasExtras.length - 1 || movendoOrdem !== null}
                                                onClick={() => moverItem(index, 1)}
                                                aria-label={`Mover ${clausula.titulo} para baixo`}
                                            >
                                                <FaArrowDown aria-hidden="true" /> Descer
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.botaoIcone}
                                                disabled={movendoOrdem !== null}
                                                onClick={() => setDialogClausula({ acao: 'editar', clausula })}
                                            >
                                                <FaEdit aria-hidden="true" /> Editar
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.botaoIconePerigo}
                                                disabled={movendoOrdem !== null}
                                                onClick={() => setClausulaParaExcluir(clausula)}
                                            >
                                                <FaTrash aria-hidden="true" /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </details>
                        ))}
                    </div>
                ) : (
                    <p className={styles.vazioSecao}>
                        {modoContrato
                            ? 'Nenhuma cláusula extra adicionada a este contrato.'
                            : 'Você ainda não cadastrou cláusulas padrão adicionais.'}
                    </p>
                )}
            </section>

            {isRascunho && (
                <>
                    <button
                        type="button"
                        className={styles.botaoPrincipal}
                        disabled={finalizando}
                        onClick={concluirEGerarPdf}
                    >
                        <FaFilePdf aria-hidden="true" />
                        {finalizando ? 'Gerando PDF...' : 'Finalizar e gerar PDF'}
                    </button>
                    {erroFinalizacao && (
                        <div className={styles.alertaErro} role="alert">
                            <p>{erroFinalizacao}</p>
                            {faltaAssinatura && (
                                <Link to="/perfil/assinatura" className={styles.botaoSecundario}>
                                    <FaPenNib aria-hidden="true" />
                                    Cadastrar minha assinatura
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}

            {podeGerenciarClausulas && dialogClausula && (
                <DialogNovaClausula
                    acao={dialogClausula.acao}
                    clausulaInicial={dialogClausula.clausula}
                    padrao={!modoContrato}
                    onClose={() => setDialogClausula(null)}
                    onSave={salvarClausula}
                />
            )}

            {clausulaParaExcluir && (
                <DialogConfirmarAcao
                    title="Excluir cláusula"
                    description={modoContrato
                        ? `Deseja excluir a cláusula "${clausulaParaExcluir.titulo}" deste contrato em rascunho?`
                        : `Deseja excluir a cláusula padrão "${clausulaParaExcluir.titulo}"? Os contratos em rascunho também serão atualizados.`}
                    textoConfirmar="Excluir cláusula"
                    textoProcessando="Excluindo..."
                    destrutivo
                    onClose={() => setClausulaParaExcluir(null)}
                    onConfirm={confirmarExcluirClausula}
                />
            )}

            {isRascunho && dialogEditarContrato && (
                <DialogContrato
                    acao="editar"
                    contratoInicial={contrato}
                    onClose={() => setDialogEditarContrato(false)}
                    onSave={salvarEdicaoContrato}
                />
            )}

            {isRascunho && dialogExcluirContrato && (
                <DialogConfirmarAcao
                    title="Excluir rascunho"
                    description="Esta ação remove permanentemente este rascunho e suas cláusulas. Deseja continuar?"
                    textoConfirmar="Excluir rascunho"
                    textoProcessando="Excluindo..."
                    destrutivo
                    onClose={() => setDialogExcluirContrato(false)}
                    onConfirm={confirmarExcluirContrato}
                />
            )}

            {isAguardando && dialogRecriarLink && (
                <DialogConfirmarAcao
                    title="Recriar link de assinatura"
                    description="Ao gerar um novo link, o link anterior será revogado imediatamente e o novo ficará válido por 15 dias."
                    textoConfirmar="Gerar novo link"
                    textoProcessando="Gerando link..."
                    onClose={() => setDialogRecriarLink(false)}
                    onConfirm={confirmarRecriarLink}
                />
            )}

            {(isAguardando || isAtivo) && dialogCancelarContrato && (
                <DialogCancelarContrato
                    onClose={() => setDialogCancelarContrato(false)}
                    onConfirm={confirmarCancelarContrato}
                />
            )}
        </ContratoLayout>
    )
}

export default ClausulasContrato
