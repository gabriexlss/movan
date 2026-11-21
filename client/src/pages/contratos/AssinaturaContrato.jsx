import { useCallback, useEffect, useRef, useState } from 'react'
import { FaCheckCircle, FaEraser, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa'
import { LuUndo2 } from 'react-icons/lu'
import { PiCheckBold, PiPenNibBold } from 'react-icons/pi'
import { useParams } from 'react-router-dom'
import CampoAssinatura from '../../components/assinatura/CampoAssinatura'
import DefaultDialog from '../../components/dialog/dialogDefault'
import { assinarContratoResponsavel, obterContratoParaAssinatura } from '../../services/assinatura'
import { apiErrorToast, getApiErrorMessage, successToast } from '../../services/toastManager'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import dialogStyles from '../perfil/assinaturaPerfil.module.css'
import styles from './fluxoContratos.module.css'

const AssinaturaContrato = () => {
    const { token } = useParams()
    const assinaturaRef = useRef(null)
    const envioRef = useRef(false)

    const [pdfUrl, setPdfUrl] = useState('')
    const [pdfAssinado, setPdfAssinado] = useState('')
    const [carregando, setCarregando] = useState(true)
    const [erroCarregamento, setErroCarregamento] = useState('')
    const [temAssinatura, setTemAssinatura] = useState(false)
    const [rascunho, setRascunho] = useState(null)
    const [enviando, setEnviando] = useState(false)
    const [erroAssinatura, setErroAssinatura] = useState('')

    const carregarContrato = useCallback(async (signal) => {
        if (!token) {
            setErroCarregamento('Link de assinatura inválido.')
            setCarregando(false)
            return
        }

        setCarregando(true)
        setErroCarregamento('')
        try {
            const dados = await obterContratoParaAssinatura(token, signal)
            if (!signal?.aborted) {
                setPdfUrl(dados.pdf || '')
            }
        } catch (error) {
            if (!signal?.aborted) {
                setErroCarregamento(getApiErrorMessage(error, 'RESOURCE_NOT_FOUND'))
            }
        } finally {
            if (!signal?.aborted) {
                setCarregando(false)
            }
        }
    }, [token])

    useEffect(() => {
        const controller = new AbortController()
        const timer = window.setTimeout(() => carregarContrato(controller.signal), 0)
        return () => {
            window.clearTimeout(timer)
            controller.abort()
        }
    }, [carregarContrato])

    useEffect(() => () => {
        if (rascunho) URL.revokeObjectURL(rascunho.url)
    }, [rascunho])

    const limpar = () => {
        setErroAssinatura('')
        assinaturaRef.current?.limpar()
    }

    const prepararConfirmacao = async () => {
        if (!temAssinatura || rascunho || envioRef.current) return
        setErroAssinatura('')
        try {
            const imagem = await assinaturaRef.current.exportar()
            setRascunho({ imagem, url: URL.createObjectURL(imagem) })
        } catch (error) {
            setErroAssinatura(error.message)
        }
    }

    const enviarAssinatura = async () => {
        if (!rascunho || envioRef.current) return
        envioRef.current = true
        setEnviando(true)
        setErroAssinatura('')
        try {
            const resposta = await assinarContratoResponsavel(token, rascunho.imagem)
            setRascunho(null)
            setPdfAssinado(resposta.pdf || pdfUrl)
            successToast('CONTRACT_SIGNED')
        } catch (error) {
            setRascunho(null)
            setErroAssinatura(getApiErrorMessage(error, 'CONTRACT_SIGN_FAILED'))
            apiErrorToast(error, 'CONTRACT_SIGN_FAILED')
        } finally {
            envioRef.current = false
            setEnviando(false)
        }
    }

    if (carregando) {
        return (
            <ContratoLayout subtitle="Assinatura do contrato">
                <p className={styles.mensagem} role="status">Carregando contrato para assinatura...</p>
            </ContratoLayout>
        )
    }

    if (erroCarregamento) {
        return (
            <ContratoLayout subtitle="Assinatura do contrato">
                <div className={styles.alertaErro} role="alert">
                    <p>{erroCarregamento}</p>
                    <button type="button" className={styles.botaoSecundario} onClick={() => carregarContrato()}>
                        Tentar novamente
                    </button>
                </div>
            </ContratoLayout>
        )
    }

    if (pdfAssinado) {
        return (
            <ContratoLayout subtitle="Contrato assinado">
                <section className={`${styles.card} ${styles.sucessoBox}`} aria-live="polite">
                    <FaCheckCircle aria-hidden="true" />
                    <h2 className={styles.tituloSecao}>Contrato assinado com sucesso!</h2>
                    <p>Sua assinatura foi registrada e incorporada ao documento. Você pode abrir ou baixar sua via do PDF abaixo.</p>
                    <a
                        href={pdfAssinado}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.botaoPrincipal}
                    >
                        <FaFilePdf aria-hidden="true" />
                        Abrir PDF assinado
                        <FaExternalLinkAlt aria-hidden="true" style={{ fontSize: '.75rem' }} />
                    </a>
                </section>
            </ContratoLayout>
        )
    }

    return (
        <ContratoLayout subtitle="Assinatura do contrato">
            <AvisoContrato title="Assinatura do contratante" icon={<PiPenNibBold aria-hidden="true" />}>
                Confira o documento do contrato abaixo e desenhe sua assinatura no campo ao final da página para concluir.
            </AvisoContrato>

            {pdfUrl && (
                <section className={styles.card} aria-labelledby="titulo-documento-contrato">
                    <h2 id="titulo-documento-contrato" className={styles.tituloSecao}>Documento do contrato</h2>
                    <iframe
                        src={pdfUrl}
                        title="Pré-visualização do contrato em PDF"
                        className={styles.previaPdf}
                    />
                    <div className={styles.acoesPdf}>
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.botaoSecundario}
                        >
                            <FaFilePdf aria-hidden="true" />
                            Abrir PDF em nova aba
                            <FaExternalLinkAlt aria-hidden="true" style={{ fontSize: '.75rem' }} />
                        </a>
                    </div>
                </section>
            )}

            <section className={`${styles.card} ${styles.cardAssinatura}`} aria-labelledby="titulo-assinatura" aria-busy={enviando}>
                <h2 id="titulo-assinatura" className={styles.tituloSecao}>Assinatura do responsável</h2>
                <CampoAssinatura
                    ref={assinaturaRef}
                    bloqueado={enviando || Boolean(rascunho)}
                    onChange={setTemAssinatura}
                    label="Desenhe a assinatura do responsável"
                />
                {erroAssinatura && <p className={dialogStyles.erro} role="alert">{erroAssinatura}</p>}
                <div className={styles.acoesAssinatura}>
                    <button
                        type="button"
                        className={styles.botaoSecundario}
                        onClick={() => assinaturaRef.current?.desfazer()}
                        disabled={!temAssinatura || enviando || Boolean(rascunho)}
                    >
                        <LuUndo2 aria-hidden="true" /> Desfazer
                    </button>
                    <button
                        type="button"
                        className={styles.botaoSecundario}
                        onClick={limpar}
                        disabled={!temAssinatura || enviando || Boolean(rascunho)}
                    >
                        <FaEraser aria-hidden="true" /> Limpar
                    </button>
                    <button
                        type="button"
                        className={styles.botaoPrincipal}
                        onClick={prepararConfirmacao}
                        disabled={!temAssinatura || enviando || Boolean(rascunho)}
                    >
                        <PiCheckBold aria-hidden="true" /> Confirmar assinatura
                    </button>
                </div>
            </section>

            {rascunho && (
                <DefaultDialog
                    isOpen
                    onClose={() => {
                        if (!enviando) setRascunho(null)
                    }}
                    title="Confirmar assinatura do contrato"
                    description="Ao confirmar, sua assinatura será aplicada ao PDF e o contrato passará para o status ativo. Esta ação não pode ser desfeita."
                    icon={<PiPenNibBold />}
                    className={dialogStyles.confirmacao}
                >
                    <img src={rascunho.url} alt="Prévia da assinatura do responsável" className={dialogStyles.previa} />
                    <div className={dialogStyles.acoes}>
                        <button
                            type="button"
                            className={dialogStyles.secundario}
                            onClick={() => setRascunho(null)}
                            disabled={enviando}
                            data-autofocus="true"
                        >
                            Voltar e revisar
                        </button>
                        <button
                            type="button"
                            className={dialogStyles.primario}
                            onClick={enviarAssinatura}
                            disabled={enviando}
                        >
                            {enviando ? 'Enviando assinatura…' : 'Assinar contrato'}
                        </button>
                    </div>
                </DefaultDialog>
            )}
        </ContratoLayout>
    )
}

export default AssinaturaContrato
