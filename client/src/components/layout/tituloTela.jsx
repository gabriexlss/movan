import styles from './tituloTela.module.css';

import { FaBell } from "react-icons/fa";

const TituloTela = ({ title, className='' }) => {
    const data = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
    return (
        <div className={`${styles['TituloTela-container']} ${className}`}>
            <div className={styles.texto}>
                <h1 className={styles.titulo}>{title}</h1>
                <h2 className={styles.subtitulo}>{data}</h2> {/* ps pro back-end: aqui tem que colocar a data do dispositivo */}
            </div>                                    {/* resolvido, ps: gabriel */}

            <div className={styles.iconeNotificacao}>
                <FaBell size={26} color="#FFC33A" />
            </div>
        </div>
    )
}

export default TituloTela
