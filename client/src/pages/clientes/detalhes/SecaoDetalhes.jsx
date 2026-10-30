import styles from './clienteDetalhes.module.css'

export const CampoDetalhe = ({ label, children, destaque = false }) => (
    <div className={`${styles.campo} ${destaque ? styles.campoDestaque : ''}`}>
        <span className={styles.rotulo}>{label}</span>
        <span className={styles.valor}>{children || 'Não informado'}</span>
    </div>
)

const SecaoDetalhes = ({ title, Icone, children }) => (
    <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>
            <Icone aria-hidden="true" />
            {title}
        </h2>
        <div className={styles.corpoSecao}>{children}</div>
    </section>
)

export default SecaoDetalhes
