import { useState } from 'react'
import { FaRegCalendarAlt } from 'react-icons/fa'
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi'
import styles from './financeiro.module.css'

import TituloTela from  '../../components/layout/tituloTela'

import ResumoFinanc from './cards/resumo-financ'
import Comparativo from './cards/comparativo'
import UltimasEntradas from './cards/ultimas-entradas'
import MensalidadesAlunos from './cards/mensalidades-alunos'

const Financeiro = () => {
    const [periodo, setPeriodo] = useState(() => {
        const hoje = new Date()
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    })

    const alterarMes = (quantidade) => {
        setPeriodo((atual) => new Date(atual.getFullYear(), atual.getMonth() + quantidade, 1))
    }

    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
        .format(periodo)
        .replace('.', '')
    const mesAno = `${mes.charAt(0).toUpperCase()}${mes.slice(1)} / ${periodo.getFullYear()}`

    return (
        <main className={styles['financ-container']}>
            <TituloTela title="Controle Financeiro" />

            <div className={styles.periodo} aria-label={`Período selecionado: ${mesAno}`}>
                <button
                    type="button"
                    className={styles.setaPeriodo}
                    aria-label="Mês anterior"
                    onClick={() => alterarMes(-1)}
                >
                    <PiCaretLeftBold aria-hidden="true" />
                </button>
                <span aria-live="polite">{mesAno}</span>
                <FaRegCalendarAlt className={styles.iconeCalendario} aria-hidden="true" />
                <button
                    type="button"
                    className={styles.setaPeriodo}
                    aria-label="Próximo mês"
                    onClick={() => alterarMes(1)}
                >
                    <PiCaretRightBold aria-hidden="true" />
                </button>
            </div>

            <ResumoFinanc />
            <Comparativo />
            <UltimasEntradas />
            <MensalidadesAlunos />
        </main>
    )
}

export default Financeiro
