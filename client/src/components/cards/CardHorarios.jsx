import { useEffect, useState } from 'react'
import DefaultCard from './DefaultCard';
import styles from './CardHorarios.module.css';

import { TbSunFilled, TbSunset2Filled } from "react-icons/tb";
import { IoMoon } from "react-icons/io5";
import { listarTurnosEscola } from '../../services/turnosEscola';
import { listarRotas, obterPontosRota } from '../../services/rotas';

const obterDiaSemanaAtual = () => {
    const dia = new Date().getDay()
    const mapa = { 1: 'SEGUNDA', 2: 'TERÇA', 3: 'QUARTA', 4: 'QUINTA', 5: 'SEXTA' }
    return mapa[dia] || 'SEGUNDA'
}

const CardHorarios = () => {
    const [horariosPorTurno, setHorariosPorTurno] = useState({
        MANHA: null,
        TARDE: null,
        NOITE: null,
    })

    useEffect(() => {
        let montado = true

        const carregar = async () => {
            try {
                const dia = obterDiaSemanaAtual()
                const [rotasDoDia, todosTurnos] = await Promise.all([
                    listarRotas({ dia }),
                    listarTurnosEscola(),
                ])

                const pontosPromises = rotasDoDia.map((r) => obterPontosRota(r.id))
                const resultadosPontos = await Promise.all(pontosPromises)

                // Agrupa escolas e turnos atendidos por turno da rota
                const escolasPorTurno = { MANHA: new Set(), TARDE: new Set(), NOITE: new Set() }
                const turnoIdsPorTurno = { MANHA: new Set(), TARDE: new Set(), NOITE: new Set() }

                rotasDoDia.forEach((rota, idx) => {
                    const pontos = resultadosPontos[idx] || []
                    pontos.forEach((p) => {
                        if (p.escola_id && escolasPorTurno[rota.turno]) {
                            escolasPorTurno[rota.turno].add(String(p.escola_id))
                            if (p.escola_turno_id) {
                                turnoIdsPorTurno[rota.turno].add(String(p.escola_turno_id))
                            }
                        }
                    })
                })

                const resultadoCalculado = {}

                ;['MANHA', 'TARDE', 'NOITE'].forEach((t) => {
                    const idsEscolas = escolasPorTurno[t]
                    const idsTurnos = turnoIdsPorTurno[t]
                    if (idsEscolas && idsEscolas.size > 0) {
                        const turnosRelevantes = todosTurnos.filter((turno) => (
                            idsTurnos.has(String(turno.id))
                            || (idsEscolas.has(String(turno.escola_id)) && String(turno.turno).toUpperCase() === t)
                        ))

                        if (turnosRelevantes.length > 0) {
                            const entradas = turnosRelevantes.map((tr) => String(tr.hora_entrada).slice(0, 5)).sort()
                            const saidas = turnosRelevantes.map((tr) => String(tr.hora_saida).slice(0, 5)).sort()
                            const menorEntrada = entradas[0]
                            const maiorSaida = saidas[saidas.length - 1]
                            resultadoCalculado[t] = `${menorEntrada} - ${maiorSaida}`
                        }
                    }
                })

                if (montado) {
                    setHorariosPorTurno(resultadoCalculado)
                }
            } catch {
                // Mantém valores padrão em caso de falha
            }
        }

        carregar()

        return () => {
            montado = false
        }
    }, [])

    const horarios = [
        {
            titulo: "Manhã",
            hora: horariosPorTurno.MANHA || "Sem rota",
            icon: <TbSunFilled size={30} color="#F4C51F" />
        },
        {
            titulo: "Tarde",
            hora: horariosPorTurno.TARDE || "Sem rota",
            icon: <TbSunset2Filled size={30} color="#e7a01c" />
        },
        {
            titulo: "Noite",
            hora: horariosPorTurno.NOITE || "Sem rota",
            icon: <IoMoon size={30} color="#a6e7f3" />
        }
    ];

    return (
        <DefaultCard title="Horários diários" compactTitle>
            <div className={styles.containerHorarios}>
                {horarios.map((item) => (
                    <div className={styles.horario} key={item.titulo}>
                        <div className={styles.iconHorario}>
                            {item.icon}
                        </div>

                        <div>
                            <h2 className={styles.tituloHorario}>{item.titulo}</h2>
                            <p className={styles.hora}>{item.hora}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    )
}

export default CardHorarios
