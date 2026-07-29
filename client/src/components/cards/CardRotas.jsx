import DefaultCard from '../DefaultCard';
import './CardRotas.css';

import { RiGraduationCapLine } from "react-icons/ri";

const CardRotas = ({ title, children }) => {
	const escolas = [
				{ nome: "Escola 1", horario: "manhã" },
				{ nome: "Escola 2", horario: "tarde" },
				{ nome: "Escola 3", horario: "noite" }
			];
	return(
		<DefaultCard title="Rotas Diárias" link="/rota">

			<div className="containerEscolas">
				{escolas.map((escola) => (
					<div className="escola" key={escola.nome}>
						<RiGraduationCapLine className="iconEscola" size={20} />

						<div className="textoEscola">
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