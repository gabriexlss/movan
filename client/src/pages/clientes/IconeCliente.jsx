import { PiBuildingsBold, PiStudentBold, PiUserBold } from 'react-icons/pi'

const iconesPorTipo = {
    responsavel: PiUserBold,
    aluno: PiStudentBold,
    escola: PiBuildingsBold,
}

const IconeCliente = ({ tipo }) => {
    const Icone = iconesPorTipo[tipo] || PiUserBold

    return <Icone aria-hidden="true" />
}

export default IconeCliente
