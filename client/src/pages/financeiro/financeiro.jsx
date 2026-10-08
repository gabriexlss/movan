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
    const [seletorAberto, setSeletorAberto] = useState(false)
    const [periodo, setPeriodo] = useState(() => {
        const hoje = new Date()
        return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    })
    const [anoVisivel, setAnoVisivel] = useState(() => new Date().getFullYear())

    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    const alterarMes = (quantidade) => {
        setPeriodo((atual) => new Date(atual.getFullYear(), atual.getMonth() + quantidade, 1))
    }

    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
        .format(periodo)
        .replace('.', '')
    const mesAno = `${mes.charAt(0).toUpperCase()}${mes.slice(1)} / ${periodo.getFullYear()}`

    const selecionarMes = (mesSelecionado) => {
        setPeriodo(new Date(anoVisivel, mesSelecionado, 1))
        setSeletorAberto(false)
    }

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
                <div className={styles.seletorContainer}>
                    <button
                        type="button"
                        className={styles.botaoCalendario}
                        aria-label="Selecionar mês e ano"
                        aria-expanded={seletorAberto}
                        aria-controls="seletor-mes-financeiro"
                        onClick={() => {
                            if (!seletorAberto) setAnoVisivel(periodo.getFullYear())
                            setSeletorAberto((aberto) => !aberto)
                        }}
                    >
                        <FaRegCalendarAlt aria-hidden="true" />
                    </button>
                    {seletorAberto && (
                        <div
                            className={styles.seletorMes}
                            id="seletor-mes-financeiro"
                            role="group"
                            aria-label={`Meses de ${anoVisivel}`}
                        >
                            <div className={styles.cabecalhoAno}>
                                <button
                                    type="button"
                                    className={styles.navegarAno}
                                    aria-label="Ano anterior"
                                    onClick={() => setAnoVisivel((ano) => ano - 1)}
                                >
                                    <PiCaretLeftBold aria-hidden="true" />
                                </button>
                                <strong className={styles.anoVisivel} aria-live="polite">{anoVisivel}</strong>
                                <button
                                    type="button"
                                    className={styles.navegarAno}
                                    aria-label="Próximo ano"
                                    onClick={() => setAnoVisivel((ano) => ano + 1)}
                                >
                                    <PiCaretRightBold aria-hidden="true" />
                                </button>
                            </div>
                            <div className={styles.gradeMeses}>
                                {meses.map((nomeMes, indice) => {
                                    const selecionado = periodo.getFullYear() === anoVisivel
                                        && periodo.getMonth() === indice

                                    return (
                                        <button
                                            key={nomeMes}
                                            type="button"
                                            className={`${styles.mesOpcao} ${selecionado ? styles.mesSelecionado : ''}`}
                                            aria-label={`${nomeMes} de ${anoVisivel}`}
                                            aria-pressed={selecionado}
                                            onClick={() => selecionarMes(indice)}
                                        >
                                            {nomeMes}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
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
