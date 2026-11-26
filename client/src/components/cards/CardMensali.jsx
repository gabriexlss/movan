import { useEffect, useState } from 'react'
import DefaultCard from './DefaultCard'
import { listarMensalidades } from '../../services/financeiro'
import styles from './CardMensali.module.css'

const CardMensali = ({ className }) => {
    const [numPagas, setNumPagas] = useState(0)
    const [numPendentes, setNumPendentes] = useState(0)
    const [numVencidas, setNumVencidas] = useState(0)

    useEffect(() => {
        let ativo = true

        const buscarMensalidades = async () => {
            try {
                const [pagas, pendentes, vencidas] = await Promise.all([
                    listarMensalidades({ status: 'PAGA' }),
                    listarMensalidades({ status: 'PENDENTE' }),
                    listarMensalidades({ status: 'ATRASADA' }),
                ])

                if (!ativo) return

                setNumPagas(pagas.length)
                setNumVencidas(vencidas.length)
                setNumPendentes(Math.max(0, pendentes.length - vencidas.length))

            } catch (error) {
                console.error('Erro ao buscar mensalidades:', error)
            }
        }

        buscarMensalidades()

        return () => {
            ativo = false
        }
    }, [])

    const mensalidade = [
        { nome: 'Pagas', qntd: numPagas, status: 'success' },
        { nome: 'Pendentes', qntd: numPendentes, status: 'warning' },
        { nome: 'Vencidas', qntd: numVencidas, status: 'danger' }
    ]

    return (
        <DefaultCard title="Mensalidades" link="/financeiro" className={className}>
            <div className={styles.containerMensalidade}>
                {mensalidade.map((mensalidade) => (
                    <div className={styles.mensalidadeItem} key={mensalidade.nome} style={{
                        backgroundColor: `var(--theme-${mensalidade.status}-soft)`,
                        color: `var(--theme-${mensalidade.status})`,
                    }}>
                        <h2 className={styles.quantidadeMensalidade}>{mensalidade.qntd}</h2>
                        <p className={styles.tituloMensalidade}>{mensalidade.nome}</p>
                    </div>
                ))}
            </div>

            <div className={styles.proximaMensa}>
                    <p>Próxima mensalidade: <span>15/03 - aluno</span></p>
            </div>
        </DefaultCard>
    );
}

export default CardMensali
