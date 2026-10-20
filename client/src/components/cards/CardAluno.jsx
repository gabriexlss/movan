import DefaultCard from "./DefaultCard";
import styles from './CardAluno.module.css'

import { PiStudentBold } from "react-icons/pi";
import { BiSolidUserX } from "react-icons/bi";

const CardAluno = () => {
    const alunos = [
        {titulo: "Alunos cadastrados", qntd: "36", icon: <PiStudentBold />, cor: "#FFC33A"},
        {titulo: "Alunos ausentes", qntd: "5", icon: <BiSolidUserX />, cor: "#E55723"}
    ];

    return(
        <DefaultCard title="Alunos" link="/clientes">
            <div className={styles['aluno-container']}>
                {alunos.map((alunos, index) => (
                    <div className={styles.statusAluno} key={index}>
                        <h2 className={styles.tituloAluno} style={{ color: alunos.cor }}>{alunos.titulo}</h2>

                        <div className={styles.containerTexto}>
                            <div className={styles.iconAluno} style={{ color: alunos.cor }}>
                                {alunos.icon}
                            </div>

                            <p className={styles.quantidadeAluno}>{alunos.qntd}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    );
}

export default CardAluno;
