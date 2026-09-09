import DefaultCard from './DefaultCard';
import styles from './CardRotas.module.css';

import { RiGraduationCapLine } from "react-icons/ri";

const CardRotas = () => {
	const escolas = [
				{ nome: "Escola 1", horario: "manhã" },
				{ nome: "Escola 2", horario: "tarde" },
				{ nome: "Escola 3", horario: "noite" }
			];
	return(
		<DefaultCard title="Rotas Diárias" link="/rota">

			<div className={styles.containerEscolas}>
				{escolas.map((escola) => (
					<div className={styles.escola} key={escola.nome}>
						<RiGraduationCapLine className={styles.iconEscola} size={20} />

						<div className={styles.textoEscola}>
							<p>{escola.nome}</p>
							<span>{"horário: " +escola.horario}</span>
						</div>
					</div>
				))}
			</div>
		</DefaultCard>
	);
}

export default CardRotas;
