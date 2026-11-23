import styles from './tituloTela.module.css';

const TituloTela = ({ title, className='', subtitle, acao }) => {
    const dataAtual = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
    const textoSubtitulo = subtitle ?? dataAtual;

    return (
        <div className={`${styles['TituloTela-container']} ${className}`}>
            <div className={styles.texto}>
                <h1 className={styles.titulo}>{title}</h1>
                <h2 className={styles.subtitulo}>{textoSubtitulo}</h2>
            </div>

            {acao}
        </div>
    )
}

export default TituloTela
