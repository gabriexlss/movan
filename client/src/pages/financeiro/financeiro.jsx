import styles from './financeiro.module.css'

import TituloTela from  '../../components/layout/tituloTela'

import ResumoFinanc from './cards/resumo-financ'

const Financeiro = () => {
    return (
        <div className={styles['financ-container']}>
            <TituloTela title="Controle Financeiro" />

            <ResumoFinanc />
        </div>
    )
}

export default Financeiro