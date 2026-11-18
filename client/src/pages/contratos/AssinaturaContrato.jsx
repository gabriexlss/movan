import { useRef, useState } from 'react'
import CampoAssinatura from '../../components/assinatura/CampoAssinatura'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import styles from './fluxoContratos.module.css'

const AssinaturaContrato = () => {
    const assinaturaRef = useRef(null)
    const [confirmada, setConfirmada] = useState(false)
    const [temAssinatura, setTemAssinatura] = useState(false)

    const limpar = () => {
        setConfirmada(false)
        // A limpeza acontece após reabilitar o campo no próximo render.
        requestAnimationFrame(() => assinaturaRef.current?.limpar())
    }

    const confirmar = () => {
        if (!temAssinatura) return

        // A confirmação é apenas local; exportar a imagem ficará para depois.
        setConfirmada(true)
    }

    return (
        <ContratoLayout>
            <AvisoContrato title="Assinatura do contratante">
                Registro da assinatura do responsável.
            </AvisoContrato>

            <section className={`${styles.card} ${styles.cardAssinatura}`} aria-labelledby="titulo-assinatura">
                <h2 id="titulo-assinatura" className={styles.tituloSecao}>Assinatura</h2>
                <CampoAssinatura
                    ref={assinaturaRef}
                    bloqueado={confirmada}
                    onChange={setTemAssinatura}
                    label="Desenhe a assinatura do responsável"
                />
                <div className={styles.acoesAssinatura}>
                    <button type="button" className={styles.botaoPrincipal} onClick={limpar}>Limpar</button>
                    <button
                        type="button"
                        className={styles.botaoPrincipal}
                        onClick={confirmar}
                        aria-pressed={confirmada}
                        disabled={confirmada || !temAssinatura}
                    >
                        Confirmar
                    </button>
                </div>
            </section>
        </ContratoLayout>
    )
}

export default AssinaturaContrato
