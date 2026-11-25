import styles from './resumo-financ.module.css'
import { FaRegArrowAltCircleDown as SetaBaixo, FaRegArrowAltCircleUp as SetaCima } from 'react-icons/fa'
import DefaultCard from '../../../components/cards/DefaultCard'
import { useEffect, useState } from 'react'
import { obterSumarioFinanceiro } from '../../../services/financeiro'

const ResumoFinanc = ({ className, periodo, atualizacao }) => {
    const [totalLucro, setTotalLucro] = useState(0)
    const [totalDespesa, setTotalDespesa] = useState(0)
    const [lucroMensal, setLucroMensal] = useState(0)
    const [despesaMensal, setDespesaMensal] = useState(0)

    useEffect(() => {
        const buscarResumo = async () => {
            try {
                const ano = periodo.getFullYear()
                const mes = String(periodo.getMonth() + 1).padStart(2, '0')
                const data = `${ano}-${mes}`

                const [lucro, despesa, lucroMes, despesaMes] = await Promise.all([
                    obterSumarioFinanceiro({ tipo: 'ENTRADA' }),
                    obterSumarioFinanceiro({ tipo: 'SAIDA' }),
                    obterSumarioFinanceiro({ data, tipo: 'ENTRADA' }),
                    obterSumarioFinanceiro({ data, tipo: 'SAIDA' })
                ])

                setTotalLucro(lucro)
                setTotalDespesa(Math.abs(despesa))
                setLucroMensal(lucroMes)
                setDespesaMensal(Math.abs(despesaMes))

            } catch (error) {
                console.error('Erro ao buscar resumo financeiro:', error)
            }
        }

        buscarResumo()
    }, [periodo, atualizacao])

    const infos = [
        { label: 'Lucro total', valor: totalLucro, Icone: SetaCima, tipo: 'lucro' },
        { label: 'Despesa total', valor: totalDespesa, Icone: SetaBaixo, tipo: 'despesa' },
        { label: 'Lucro mensal', valor: lucroMensal, Icone: SetaCima, tipo: 'lucro' },
        { label: 'Despesa mensal', valor: despesaMensal, Icone: SetaBaixo, tipo: 'despesa' },
    ]



    return (
        <DefaultCard title="Resumo financeiro" className={className}>
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
