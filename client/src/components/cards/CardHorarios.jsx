import DefaultCard from '../DefaultCard';
import './CardHorarios.css';

import { TbSunFilled } from "react-icons/tb";
import { TbSunset2Filled } from "react-icons/tb";
import { IoMoon } from "react-icons/io5";

const CardHorarios = ({ title, children }) => {
    const horarios = [
        { titulo: "Manhã", hora: "06:30 - 8:00", icon: <TbSunFilled size={30} color="#F4C51F" /> },
        { titulo: "Tarde", hora: "11:30 - 13:00", icon: <TbSunset2Filled size={30} color="#e7a01c" /> },
        { titulo: "Noite", hora: "17:00 - 19:00", icon: <IoMoon size={30} color="#a6e7f3" /> }
    ];

    return (
        <DefaultCard title="Horários Diários">

            <div className="containerHorarios">
                {horarios.map((horarios) => (
                    <div className="horario" key={horarios.titulo}>
                        <div className="iconHorario">
                            {horarios.icon}
                        </div>

                        <div className="texto">
                            <h2 className="tituloHorario">{horarios.titulo}</h2>
                            <p className="hora">{horarios.hora}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    )
}

export default CardHorarios