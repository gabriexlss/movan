import { useEffect, useRef, useState } from 'react'
import Atrament, { MODE_DISABLED, MODE_DRAW } from 'atrament'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import styles from './fluxoContratos.module.css'

const AssinaturaContrato = () => {
    const canvasRef = useRef(null)
    const assinaturaRef = useRef(null)
    const [confirmada, setConfirmada] = useState(false)

    useEffect(() => {
        const assinatura = new Atrament(canvasRef.current, {
            color: '#1c1c1c',
            weight: 2,
            adaptiveStroke: false,
        })
        assinaturaRef.current = assinatura

        return () => {
            assinatura.destroy()
            assinaturaRef.current = null
        }
    }, [])

    const limpar = () => {
        assinaturaRef.current.clear()
        assinaturaRef.current.mode = MODE_DRAW
        setConfirmada(false)
    }

    const confirmar = () => {
        if (!assinaturaRef.current.dirty) return

        // A confirmação é apenas local; exportar a imagem ficará para depois.
        assinaturaRef.current.mode = MODE_DISABLED
        setConfirmada(true)
    }

    return (
        <ContratoLayout>
            <AvisoContrato title="Assinatura do contratante">
                Registro da assinatura do responsável.
            </AvisoContrato>

            <section className={`${styles.card} ${styles.cardAssinatura}`} aria-labelledby="titulo-assinatura">
                <h2 id="titulo-assinatura" className={styles.tituloSecao}>Assinatura</h2>
                <canvas
                    ref={canvasRef}
                    width={1000}
                    height={625}
                    className={styles.areaAssinatura}
                    aria-label="Desenhe a assinatura do responsável"
                />
                <div className={styles.acoesAssinatura}>
                    <button type="button" className={styles.botaoPrincipal} onClick={limpar}>Limpar</button>
                    <button
                        type="button"
                        className={styles.botaoPrincipal}
                        onClick={confirmar}
                        aria-pressed={confirmada}
                        disabled={confirmada}
                    >
                        Confirmar
                    </button>
                </div>
            </section>
        </ContratoLayout>
    )
}

export default AssinaturaContrato
