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

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
ChartJS.defaults.font.family = 'Poppins, sans-serif'
ChartJS.defaults.font.weight = 'bold'

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const cinza = Array(3).fill('#c7c7c7')

const dados = {
    labels: meses,
    datasets: [
        {
            label: 'Lucros',
            data: [1000, 3000, 1800, 6767, 7000, 3500, 3500, 3500, 3500, 0, 0, 0],
            backgroundColor: [...Array(9).fill('#15720C'), ...cinza],
            borderRadius: 2,
        },
        {
            label: 'Despesas',
            data: [1200, 2000, 1400, 1800, 300, 3500, 3500, 3500, 3500, 0, 0, 0],
            backgroundColor: [...Array(9).fill('#720C0C'), ...cinza],
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
                stepSize: 2000,
                callback: (valor) => valor === 0 ? '0' : `${valor / 1000}k`,
            },
            grid: { color: '#d0d0d0' },
        },
        x: {
            grid: { display: false },
        },
    },
}

const Comparativo = (link) => {
    return (
        <DefaultCard title="Comparativo de lucros e despesas">
            <div className={styles['grafico']}>
                <Bar data={dados} options={opcoes} />
            </div>
        </DefaultCard>
)
}

export default Comparativo