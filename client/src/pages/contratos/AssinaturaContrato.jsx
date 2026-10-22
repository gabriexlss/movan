import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import styles from './fluxoContratos.module.css'

const AssinaturaContrato = () => (
    <ContratoLayout>
        <AvisoContrato title="Assinatura do contratante">
            Registro da assinatura do responsável.
        </AvisoContrato>

        <section className={`${styles.card} ${styles.cardAssinatura}`} aria-labelledby="titulo-assinatura">
            <h2 id="titulo-assinatura" className={styles.tituloSecao}>Assinatura</h2>
            <div className={styles.areaAssinatura} role="img" aria-label="Área reservada para a assinatura" />
            <div className={styles.acoesAssinatura}>
                <button type="button" className={styles.botaoPrincipal}>Limpar</button>
                <button type="button" className={styles.botaoPrincipal}>Confirmar</button>
            </div>
        </section>
    </ContratoLayout>
)

export default AssinaturaContrato
