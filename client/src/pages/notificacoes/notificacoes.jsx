import { Link } from 'react-router-dom'
import { PiArrowLeftBold } from 'react-icons/pi'

import ListaNotificacoes from '../../components/notificacoes/ListaNotificacoes'
import styles from './notificacoes.module.css'

const Notificacoes = () => {
    return (
        <main className={styles.pagina}>
            <header className={styles.cabecalho}>
                <Link className={styles.voltar} to="/" aria-label="Voltar para o início">
                    <PiArrowLeftBold aria-hidden="true" />
                </Link>

                <div>
                    <h1>Notificações</h1>
                    <p>Últimos 15 dias</p>
                </div>
            </header>

            <ListaNotificacoes />
        </main>
    )
}

export default Notificacoes
