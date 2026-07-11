import './tituloTela.css';

const TituloTela = ({ title, subtitle }) => {
    return (
        <div className="TituloTela-container">
            <h1 className="titulo">{title}</h1>
            <h2 className="subtitulo">{subtitle}</h2> {/* ps pro back-end: aqui tem que colocar a data do dispositivo */}
        </div>
    )
}

export default TituloTela