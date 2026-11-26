import { useEffect, useMemo, useState } from "react";
import DefaultCard from "./DefaultCard";
import styles from './CardAluno.module.css'

import { PiStudentBold } from "react-icons/pi";
import { BiSolidUserX } from "react-icons/bi";
import { listarAluno } from "../../services/aluno";
import { listarRotas, obterPontosRota } from "../../services/rotas";
import { listarTurnosEscola } from "../../services/turnosEscola";
import { calcularResumoAlunos, obterDiaSemanaAtual, obterTurnoAtual } from "../../utils/periodoRota";

const ESTADO_INICIAL = {
    carregando: true,
    alunos: [],
    turnosEscola: [],
    rotasDoDia: [],
    pontosPorRotaId: {},
    erroAlunos: false,
    erroTurnos: false,
    erroRotas: false,
}

const CardAluno = ({ className, dadosHome }) => {
    const [turnoAtual, setTurnoAtual] = useState(obterTurnoAtual)
    const [estadoInterno, setEstadoInterno] = useState(ESTADO_INICIAL)

    useEffect(() => {
        const intervalo = window.setInterval(() => {
            setTurnoAtual(obterTurnoAtual())
        }, 60000)

        return () => window.clearInterval(intervalo)
    }, [])

    useEffect(() => {
        if (dadosHome) return undefined
        let montado = true

        const carregar = async () => {
            const dia = obterDiaSemanaAtual()
            const [resAlunos, resTurnos, resRotas] = await Promise.allSettled([
                listarAluno(),
                listarTurnosEscola(),
                listarRotas({ dia }),
            ])

            const rotasDoDia = resRotas.status === 'fulfilled' ? (resRotas.value || []) : []
            let erroRotas = resRotas.status !== 'fulfilled'
            let pontosPorRotaId = {}

            if (resRotas.status === 'fulfilled' && rotasDoDia.length > 0) {
                try {
                    const pares = await Promise.all(
                        rotasDoDia.map(async (rota) => [rota.id, await obterPontosRota(rota.id)]),
                    )
                    pontosPorRotaId = Object.fromEntries(pares)
                } catch {
                    erroRotas = true
                }
            }

            if (montado) {
                setEstadoInterno({
                    carregando: false,
                    alunos: resAlunos.status === 'fulfilled' ? (resAlunos.value || []) : [],
                    turnosEscola: resTurnos.status === 'fulfilled' ? (resTurnos.value || []) : [],
                    rotasDoDia,
                    pontosPorRotaId,
                    erroAlunos: resAlunos.status !== 'fulfilled',
                    erroTurnos: resTurnos.status !== 'fulfilled',
                    erroRotas,
                })
            }
        }

        carregar()

        return () => {
            montado = false
        }
    }, [dadosHome])

    const fonteDados = dadosHome ?? estadoInterno

    const resumo = useMemo(() => calcularResumoAlunos({
        alunos: fonteDados.alunos,
        turnosEscola: fonteDados.turnosEscola,
        rotasDoDia: fonteDados.rotasDoDia,
        pontosPorRotaId: fonteDados.pontosPorRotaId,
        turnoAtual,
    }), [fonteDados.alunos, fonteDados.turnosEscola, fonteDados.rotasDoDia, fonteDados.pontosPorRotaId, turnoAtual])

    const qntdCadastrados = fonteDados.carregando
        ? '...'
        : (fonteDados.erroAlunos ? '—' : String(resumo.cadastrados))

    const qntdAusentes = fonteDados.carregando
        ? '...'
        : ((fonteDados.erroAlunos || fonteDados.erroTurnos || fonteDados.erroRotas) ? '—' : String(resumo.ausentes))

    const alunos = [
        {titulo: "Alunos cadastrados", qntd: qntdCadastrados, icon: <PiStudentBold />, cor: 'var(--theme-warning)'},
        {titulo: "Alunos ausentes", qntd: qntdAusentes, icon: <BiSolidUserX />, cor: 'var(--theme-orange)'}
    ];

    return(
        <DefaultCard title="Alunos" link="/clientes" className={className}>
            <div className={styles['aluno-container']}>
                {alunos.map((item, index) => (
                    <div className={styles.statusAluno} key={index}>
                        <h2 className={styles.tituloAluno} style={{ color: item.cor }}>{item.titulo}</h2>

                        <div className={styles.containerTexto}>
                            <div className={styles.iconAluno} style={{ color: item.cor }}>
                                {item.icon}
                            </div>

                            <p className={styles.quantidadeAluno}>{item.qntd}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DefaultCard>
    );
}

export default CardAluno;
