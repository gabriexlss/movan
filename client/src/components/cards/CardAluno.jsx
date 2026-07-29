import DefaultCard from "../DefaultCard";
import './CardAluno.css'

import { PiStudentBold } from "react-icons/pi";
import { BiSolidUserX } from "react-icons/bi";

const CardAluno = () => {
    const alunos = [
        {titulo: "Alunos cadastrados", qntd: "36", icon: <PiStudentBold />, cor: "#FFC33A"},
        {titulo: "Alunos ausentes", qntd: "5", icon: <BiSolidUserX />, cor: "#E55723"}
    ];

    return(
        <DefaultCard title="Alunos" link="clientes">
            <div className="aluno-container">
                {alunos.map((alunos, index) => (
                    <div className="statusAluno" key={index}>
                        <div className="iconAluno">
                            {alunos.icon}
                        </div>

                        <h2>{alunos.titulo}</h2>
                        <p>{alunos.qntd}</p>
                    </div>
                ))}
            </div>
        </DefaultCard>
    );
}

export default CardAluno;