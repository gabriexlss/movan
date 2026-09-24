import styles from './resumo-financ.module.css'

import { FaRegArrowAltCircleDown as SetaBaixo } from "react-icons/fa";
import { FaRegArrowAltCircleUp as SetaCima } from "react-icons/fa";


import DefaultCard from '../../../components/cards/DefaultCard'

const infos = {
    labels: ['Lucro Total', 'Lucro Mensal', 'Despesa Total', 'Despesa Mensal'],
    dados: {
        valores: ['12.450,00', '4.450,00', '6.230,00', '2.350,00'],
        icones: [<SetaCima />, <SetaBaixo />],
        cores: ['#720C0C', '#15720C']
    },

}

const ResumoFinanc = () => {
    return (
        <DefaultCard title="Resumo Financeiro">
            <div className={styles['resumo-container']}>
                <div className={styles['items']}>
                    
                </div>
            </div>
        </DefaultCard>
    )
}

export default ResumoFinanc