import { useEffect, useRef } from 'react'
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

const dados = {
    labels: meses,
    datasets: [
        {
            label: 'Lucros',
            data: [1000, 3000, 1800, 6767, 7000, 3500, 3500, 3500, 3500, 0, 0, 0],
            backgroundColor: corDoTema('success'),
            borderRadius: 2,
        },
        {
            label: 'Despesas',
            data: [1200, 2000, 1400, 1800, 300, 3500, 3500, 3500, 3500, 0, 0, 0],
            backgroundColor: corDoTema('danger'),
            borderRadius: 2,
        },
    ],
}

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

const Comparativo = () => {
    const { theme } = useTheme()
    const graficoRef = useRef(null)

    useEffect(() => {
        const chart = graficoRef.current
        if (!chart) return

        // A legenda do Chart.js lê a cor diretamente das opções do plugin.
        chart.options.plugins.legend.labels.color = corDosRotulos({ chart })
        chart.update('none')
    }, [theme])

    return (
        <DefaultCard title="Comparativo de lucros e despesas">
            <div className={styles['grafico']}>
                <Bar ref={graficoRef} data={dados} options={opcoes} />
            </div>
        </DefaultCard>
)
}

export default Comparativo
