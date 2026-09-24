import styles from './financeiro.module.css'

import TituloTela from  '../../components/layout/tituloTela'

import ResumoFinanc from './cards/resumo-financ'
import Comparativo from './cards/comparativo'

const Financeiro = () => {
    return (
        <div className={styles['financ-container']}>
            <TituloTela title="Controle Financeiro" />

            <ResumoFinanc />
            <Comparativo />
        </div>
    )
}

export default Financeiro