import './tituloTela.css';

import { FaBell } from "react-icons/fa";

const TituloTela = ({ title }) => {
    const data = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
    return (
        <div className="TituloTela-container">
            <div className="texto">
                <h1 className="titulo">{title}</h1>
                <h2 className="subtitulo">{data}</h2> {/* ps pro back-end: aqui tem que colocar a data do dispositivo */}
            </div>                                    {/* resolvido, ps: gabriel */}

            <div className="iconeNotificacao">
                <FaBell size={26} color="#FFC33A" />
            </div>
        </div>
    )
}

export default TituloTela