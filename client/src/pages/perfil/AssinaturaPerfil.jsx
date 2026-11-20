import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuUndo2 } from 'react-icons/lu'
import { PiCheckBold, PiCheckCircleBold, PiPenNibBold } from 'react-icons/pi'
import CampoAssinatura from '../../components/assinatura/CampoAssinatura'
import { obterAssinaturaMotorista, salvarAssinaturaMotorista } from '../../services/assinatura'
import { apiErrorToast, successToast } from '../../services/toastManager'
import DialogConfirmarAssinatura from './DialogConfirmarAssinatura'
import fluxo from '../contratos/fluxoContratos.module.css'
import styles from './assinaturaPerfil.module.css'

const AssinaturaPerfil = () => {
    const campoRef = useRef(null)
    const envioRef = useRef(false)
    const [assinatura, setAssinatura] = useState(null)
    const [editando, setEditando] = useState(false)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [falhaCarregamento, setFalhaCarregamento] = useState(false)
    const [temAssinatura, setTemAssinatura] = useState(false)
    const [rascunho, setRascunho] = useState(null)
    const [salvando, setSalvando] = useState(false)

    const carregar = useCallback(async (signal) => {
        setCarregando(true)
        setTemAssinatura(false)
        setErro('')
        setFalhaCarregamento(false)
        try {
            const salva = await obterAssinaturaMotorista(signal)
            if (!signal?.aborted) {
                setAssinatura(salva)
                setEditando(false)
            }
        } catch (error) {
            if (!signal?.aborted) {
                setErro('Não foi possível carregar sua assinatura. Tente novamente.')
                setFalhaCarregamento(true)
                apiErrorToast(error, 'SIGNATURE_LOAD_FAILED')
            }
        } finally {
            if (!signal?.aborted) setCarregando(false)
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController()
        const inicio = window.setTimeout(() => carregar(controller.signal), 0)
        return () => {
            window.clearTimeout(inicio)
            controller.abort()
        }
    }, [carregar])

    useEffect(() => () => {
        if (rascunho) URL.revokeObjectURL(rascunho.url)
    }, [rascunho])

    const fecharConfirmacao = useCallback(() => setRascunho(null), [])

    const iniciarAlteracao = () => {
        setErro('')
        setTemAssinatura(false)
        setEditando(true)
    }

    const cancelarAlteracao = () => {
        setErro('')
        setTemAssinatura(false)
        setEditando(false)
    }

    const concluir = async () => {
        if (!temAssinatura || rascunho || envioRef.current) return
        try {
            const imagem = await campoRef.current.exportar()
            setRascunho({ imagem, url: URL.createObjectURL(imagem) })
        } catch (error) {
            setErro(error.message)
        }
    }

    const salvar = async () => {
        if (!rascunho || envioRef.current) return
        const jaPossuia = Boolean(assinatura)
        envioRef.current = true
        setSalvando(true)
        setErro('')
        try {
            const salva = await salvarAssinaturaMotorista(rascunho.imagem)
            setAssinatura(salva)
            setEditando(false)
            setTemAssinatura(false)
            setRascunho(null)
            successToast(jaPossuia ? 'SIGNATURE_UPDATED' : 'SIGNATURE_SAVED')
        } catch (error) {
            apiErrorToast(error, 'SIGNATURE_SAVE_FAILED')
            setRascunho(null)
            setErro('Não foi possível salvar sua assinatura. Seu desenho foi mantido; tente novamente.')
        } finally {
            envioRef.current = false
            setSalvando(false)
        }
    }

    const exibirFormulario = !assinatura || editando

    return (
        <main className={fluxo.container}>
            <header className={fluxo.cabecalho}>
                <div>
                    <h1>Minha assinatura</h1>
                    <p>Assinatura do motorista</p>
                </div>
                <Link to="/perfil" className={fluxo.voltar} aria-label="Voltar para o perfil"><LuUndo2 aria-hidden="true" /></Link>
            </header>

            <aside className={fluxo.aviso}>
                <h2><PiPenNibBold aria-hidden="true" /> Sua assinatura nos contratos</h2>
                <p>{assinatura && !editando
                    ? 'Sua assinatura está salva e será usada automaticamente nos próximos contratos finalizados. Alterá-la não modifica contratos já finalizados ou assinados.'
                    : 'Desenhe sua assinatura no campo abaixo. Você pode desfazer os traços antes de concluir. Ela será aplicada automaticamente quando você finalizar um contrato.'}</p>
            </aside>

            <section className={`${fluxo.card} ${fluxo.cardAssinatura}`} aria-labelledby="titulo-minha-assinatura" aria-busy={carregando || salvando}>
                <h2 id="titulo-minha-assinatura" className={fluxo.tituloSecao}>Assinatura</h2>
                {carregando ? (
                    <p className={styles.texto} role="status">Carregando assinatura…</p>
                ) : falhaCarregamento ? (
                    <>
                        <p className={styles.erro} role="alert">{erro}</p>
                        <button type="button" className={fluxo.botaoPrincipal} onClick={() => carregar()}>Tentar novamente</button>
                    </>
                ) : !exibirFormulario ? (
                    <>
                        <img src={assinatura.caminho_arquivo} alt="Sua assinatura cadastrada" className={styles.previa} />
                        <p className={styles.status} role="status"><PiCheckCircleBold aria-hidden="true" /> Assinatura cadastrada</p>
                        <div className={fluxo.acoesAssinatura}>
                            <button type="button" className={styles.secundario} onClick={iniciarAlteracao}>
                                <PiPenNibBold aria-hidden="true" /> Alterar assinatura
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className={styles.texto}>Assine com o dedo, uma caneta digital ou o mouse.</p>
                        <CampoAssinatura ref={campoRef} bloqueado={Boolean(rascunho) || salvando} onChange={setTemAssinatura} label="Desenhe sua assinatura de motorista" />
                        {erro && <p className={styles.erro} role="alert">{erro}</p>}
                        <div className={fluxo.acoesAssinatura}>
                            {assinatura && (
                                <button type="button" className={styles.secundario} disabled={Boolean(rascunho) || salvando} onClick={cancelarAlteracao}>
                                    Cancelar
                                </button>
                            )}
                            <button type="button" className={styles.secundario} disabled={!temAssinatura || Boolean(rascunho) || salvando} onClick={() => campoRef.current.desfazer()}>
                                <LuUndo2 aria-hidden="true" /> Desfazer
                            </button>
                            <button type="button" className={fluxo.botaoPrincipal} disabled={!temAssinatura || Boolean(rascunho) || salvando} onClick={concluir}>
                                <PiCheckBold aria-hidden="true" /> Concluir
                            </button>
                        </div>
                    </>
                )}
            </section>
            {rascunho && (
                <DialogConfirmarAssinatura
                    imagem={rascunho.url}
                    atualizando={Boolean(assinatura)}
                    salvando={salvando}
                    onClose={fecharConfirmacao}
                    onConfirm={salvar}
                />
            )}
        </main>
    )
}

export default AssinaturaPerfil
