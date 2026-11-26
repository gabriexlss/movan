import { useEffect, useMemo, useRef, useState } from 'react'
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

import styles from './comparativo.module.css'

import DefaultCard from "../../../components/cards/DefaultCard"
import { useTheme } from '../../../theme/theme-context'
import { obterSumarioFinanceiro } from '../../../services/financeiro'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.weight = 'bold'
ChartJS.defaults.font.size = 13

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// O canvas do Chart.js precisa receber a cor resolvida do CSS.
const corDoTema = (token) => ({ chart }) => (
    getComputedStyle(chart.canvas).getPropertyValue(`--theme-${token}`).trim()
)

const corDosRotulos = corDoTema('text-secondary')

const opcoes = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: { usePointStyle: true },
        },
    },
    scales: {
        y: {
            min: 0,
            max: 10000,
            ticks: {
                color: corDosRotulos,
                stepSize: 2000,
                callback: (valor) => valor === 0 ? '0' : `${valor / 1000}k`,
            },
            grid: { color: corDoTema('chart-grid') },
        },
        x: {
            ticks: { color: corDosRotulos },
            grid: { display: false },
        },
    },
}

const Comparativo = ({ className, ano, atualizacao }) => {
    const { theme } = useTheme()
    const graficoRef = useRef(null)
    const [valores, setValores] = useState({ lucro: Array(12).fill(0), despesa: Array(12).fill(0) })

    useEffect(() => {
        let ativo = true
        Promise.all(meses.map((_, indice) => {
            const data = `${ano}-${String(indice + 1).padStart(2, '0')}`
            return Promise.all([
                obterSumarioFinanceiro({ data, tipo: 'ENTRADA' }),
                obterSumarioFinanceiro({ data, tipo: 'SAIDA' }),
            ])
        })).then(resultados => {
            if (!ativo) return
            setValores({
                lucro: resultados.map(([lucro]) => lucro),
                despesa: resultados.map(([, despesa]) => Math.abs(despesa)),
            })
        }).catch(error => console.error('Erro ao buscar comparativo financeiro:', error))
        return () => { ativo = false }
    }, [ano, atualizacao])

    const dados = useMemo(() => ({
        labels: meses,
        datasets: [
            { label: 'Lucros', data: valores.lucro, backgroundColor: corDoTema('success'), borderRadius: 2 },
            { label: 'Despesas', data: valores.despesa, backgroundColor: corDoTema('danger'), borderRadius: 2 },
        ],
    }), [valores])

    useEffect(() => {
        const chart = graficoRef.current
        if (!chart) return

        // A legenda do Chart.js lê a cor diretamente das opções do plugin.
        chart.options.plugins.legend.labels.color = corDosRotulos({ chart })
        chart.update('none')
    }, [theme])

    return (
        <DefaultCard title="Comparativo de lucros e despesas" className={className}>
            <div className={styles['grafico']}>
                <Bar ref={graficoRef} data={dados} options={opcoes} />
            </div>
        </DefaultCard>
)
}

export default Comparativo
