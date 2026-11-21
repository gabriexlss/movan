import { Link } from 'react-router-dom'
import { LuUndo2 } from 'react-icons/lu'
import styles from './fluxoContratos.module.css'

const ContratoLayout = ({ subtitle = 'Contrato gerado', voltar = false, children }) => (
    <main className={styles.container}>
        <header className={styles.cabecalho}>
            <div>
                <h1>Contratos</h1>
                <p>{subtitle}</p>
            </div>
            {voltar && (
                <Link to="/contratos" className={styles.voltar} aria-label="Voltar para contratos">
                    <LuUndo2 aria-hidden="true" />
                </Link>
            )}
        </header>
        {children}
    </main>
)

export const AvisoContrato = ({ title, icon, children }) => (
    <aside className={styles.aviso}>
        <h2>{icon}{title}</h2>
        <p>{children}</p>
    </aside>
)

export default ContratoLayout
