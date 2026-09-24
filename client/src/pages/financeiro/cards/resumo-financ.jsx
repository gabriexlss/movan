import styles from './resumo-financ.module.css'
import { FaRegArrowAltCircleDown as SetaBaixo, FaRegArrowAltCircleUp as SetaCima } from 'react-icons/fa'
import DefaultCard from '../../../components/cards/DefaultCard'

const infos = [
    { label: 'Lucro total', valor: 'R$ 12.450,00', Icone: SetaCima, tipo: 'lucro' },
    { label: 'Despesa total', valor: 'R$ 6.230,00', Icone: SetaBaixo, tipo: 'despesa' },
    { label: 'Lucro mensal', valor: 'R$ 4.450,00', Icone: SetaCima, tipo: 'lucro' },
    { label: 'Despesa mensal', valor: 'R$ 2.350,00', Icone: SetaBaixo, tipo: 'despesa' },
]

const ResumoFinanc = () => {
    return (
        <DefaultCard title="Resumo Financeiro">
            <div className={styles['resumo-container']}>
                {infos.map(({ label, valor, Icone, tipo }) => (
                    <div className={`${styles.item} ${styles[tipo]}`} key={label}>
                        <Icone className={styles.icone} aria-hidden="true" />
                        <div className={styles.textos}>
                            <span className={styles.label}>{label}</span>
                            <strong className={styles.valor}>{valor}</strong>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    )
}

export default ResumoFinanc
