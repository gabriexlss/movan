import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LuUndo2 } from 'react-icons/lu'
import { PiCheckBold, PiLockKeyBold, PiPenNibBold } from 'react-icons/pi'
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
            if (!signal?.aborted) setAssinatura(salva)
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
        envioRef.current = true
        setSalvando(true)
        setErro('')
        try {
            const salva = await salvarAssinaturaMotorista(rascunho.imagem)
            setAssinatura(salva)
            setRascunho(null)
            successToast('SIGNATURE_SAVED')
        } catch (error) {
            apiErrorToast(error, 'SIGNATURE_SAVE_FAILED')
            setRascunho(null)
            // Consulta novamente caso o envio tenha sido salvo antes de uma falha de conexão.
            try {
                const salva = await obterAssinaturaMotorista()
                setAssinatura(salva)
                if (!salva) setErro('Não foi possível salvar sua assinatura. Seu desenho foi mantido; tente novamente.')
            } catch {
                setFalhaCarregamento(true)
                setTemAssinatura(false)
                setErro('Não foi possível verificar se sua assinatura foi salva. Tente carregar novamente antes de continuar.')
            }
        } finally {
            envioRef.current = false
            setSalvando(false)
        }
    }

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
                <p>{assinatura
                    ? 'Sua assinatura está salva e reservada para seus contratos. Ela não pode ser alterada.'
                    : 'Desenhe sua assinatura no campo abaixo. Você pode desfazer os traços antes de concluir. Após a confirmação, ela será salva uma única vez.'}</p>
            </aside>

            <section className={`${fluxo.card} ${fluxo.cardAssinatura}`} aria-labelledby="titulo-minha-assinatura" aria-busy={carregando || salvando}>
                <h2 id="titulo-minha-assinatura" className={fluxo.tituloSecao}>Assinatura</h2>
                {carregando ? <p className={styles.texto} role="status">Carregando assinatura…</p> : assinatura ? (
                    <>
                        <img src={assinatura.caminho_arquivo} alt="Sua assinatura cadastrada" className={styles.previa} />
                        <p className={styles.status} role="status"><PiLockKeyBold aria-hidden="true" /> Assinatura salva definitivamente</p>
                    </>
                ) : falhaCarregamento ? (
                    <>
                        <p className={styles.erro} role="alert">{erro}</p>
                        <button type="button" className={fluxo.botaoPrincipal} onClick={() => carregar()}>Tentar novamente</button>
                    </>
                ) : (
                    <>
                        <p className={styles.texto}>Assine com o dedo, uma caneta digital ou o mouse.</p>
                        <CampoAssinatura ref={campoRef} bloqueado={Boolean(rascunho) || salvando} onChange={setTemAssinatura} label="Desenhe sua assinatura de motorista" />
                        {erro && <p className={styles.erro} role="alert">{erro}</p>}
                        <div className={fluxo.acoesAssinatura}>
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
                    salvando={salvando}
                    onClose={fecharConfirmacao}
                    onConfirm={salvar}
                />
            )}
        </main>
    )
}

export default AssinaturaPerfil
