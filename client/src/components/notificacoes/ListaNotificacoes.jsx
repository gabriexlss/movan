import { notificacoes } from './notificacoes'
import styles from './notificacoes.module.css'

const ListaNotificacoes = ({ variant = 'page' }) => {
    const popup = variant === 'popup'

    return (
        <ul className={`${styles.lista} ${popup ? styles.listaPopup : styles.listaPagina}`}>
            {notificacoes.map(({ id, titulo, descricao, tempo, acao, Icone, cor }) => (
                <li className={popup ? styles.itemPopup : styles.itemPagina} key={id}>
                    <span className={styles.icone} style={{ '--cor-notificacao': cor }} aria-hidden="true">
                        <Icone />
                    </span>

                    <div className={styles.texto}>
                        <h3>{titulo}</h3>
                        {!popup && <p>{descricao}</p>}
                    </div>

                    {popup ? (
                        <span className={styles.indicador} style={{ '--cor-notificacao': cor }} aria-label={`${tempo} atrás`} />
                    ) : (
                        <span className={styles.tempo}>{tempo}</span>
                    )}

                    {!popup && (
                        <div className={styles.acoes}>
                            <button type="button">Dispensar</button>
                            <button type="button" className={styles.acaoPrincipal}>{acao}</button>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default ListaNotificacoes
