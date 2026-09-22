import styles from './tituloTela.module.css';
import DialogNotif from '../dialog/dialog-notif/dialogNotif';
import ListaNotificacoes from '../notificacoes/ListaNotificacoes'
import { notificacoes, quantidadeNotificacoesNaoLidas } from '../notificacoes/notificacoes'

import { useId, useRef, useState } from 'react'
import { FaBell } from "react-icons/fa";
import { PiCaretRightBold } from 'react-icons/pi'
import { Link } from 'react-router-dom'

const TituloTela = ({ title, className='' }) => {
    const data = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());

    const [notifAberta, setNotifAberta] = useState(false)
    const botaoNotificacaoRef = useRef(null)
    const notificacoesId = useId()

    return (
        <div className={`${styles['TituloTela-container']} ${className}`}>
            <div className={styles.texto}>
                <h1 className={styles.titulo}>{title}</h1>
                <h2 className={styles.subtitulo}>{data}</h2>
            </div>

            <div className={styles.notificacoes}>
                <button
                    ref={botaoNotificacaoRef}
                    type="button"
                    className={styles.iconeNotificacao}
                    aria-label={quantidadeNotificacoesNaoLidas > 0
                        ? `Abrir notificações. ${quantidadeNotificacoesNaoLidas} não lidas.`
                        : 'Abrir notificações'}
                    aria-expanded={notifAberta}
                    aria-controls={notifAberta ? notificacoesId : undefined}
                    onClick={() => setNotifAberta((aberta) => !aberta)}
                >
                    <FaBell aria-hidden="true" size={26} color="#FFC33A" />
                </button>

                {quantidadeNotificacoesNaoLidas > 0 && (
                    <span
                        className={styles.notificacaoNaoLida}
                        role="img"
                        aria-label={`${quantidadeNotificacoesNaoLidas} notificações não lidas`}
                    />
                )}

                <DialogNotif
                    id={notificacoesId}
                    isOpen={notifAberta}
                    onClose={() => setNotifAberta(false)}
                    anchorRef={botaoNotificacaoRef}
                    notificationCount={notificacoes.length}
                >
                    <ListaNotificacoes variant="popup" />
                    <Link className={styles.verTodas} to="/notificacoes">
                        Ver todas as notificações
                        <PiCaretRightBold aria-hidden="true" />
                    </Link>
                </DialogNotif>
            </div>
        </div>
    )
}

export default TituloTela
