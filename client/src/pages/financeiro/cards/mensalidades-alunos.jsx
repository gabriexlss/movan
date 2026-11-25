import { useState, useEffect } from 'react'
import { FaUser } from 'react-icons/fa'
import PainelLista from './PainelLista'
import styles from './mensalidades-alunos.module.css'
import { listarMensalidades } from '../../../services/financeiro'

const ITENS_POR_PAGINA = 6

const MensalidadesAlunos = () => {
    const [pagina, setPagina] = useState(0)
    const [mensalidades, setMensalidades] = useState([])

    useEffect(() => {
        const mensalidadesDoBanco = async () => {
            try {
                const response = await listarMensalidades()

                console.log('Mensalidades do banco:', response)

                const mensalidadesFormatadas = response.map(mensalidade => ({
                    id: mensalidade.id,
                    nome: `Contrato #${mensalidade.contrato_id}`,
                    vencimento: mensalidade.data_vencimento,
                    valor: mensalidade.valor_cobrado,
                    status: mensalidade.status,
                    cor: mensalidade.status === 'PAGA' ? 'verde' : 'vermelho',
                }))

                setMensalidades(mensalidadesFormatadas)

            } catch (error) {
                console.error('Erro ao buscar mensalidades:', error)
            }
        }

        mensalidadesDoBanco()
    }, [])

    const totalPaginas = Math.ceil(mensalidades.length / ITENS_POR_PAGINA)

    const paginaAtual = Math.min(pagina, Math.max(0, totalPaginas - 1))

    const mensalidadesDaPagina = mensalidades.slice(
        paginaAtual * ITENS_POR_PAGINA,
        (paginaAtual + 1) * ITENS_POR_PAGINA
    )

    const formatarData = (data) => {
        if (!data) return ''

        const [ano, mes, dia] = data.substring(0, 10).split('-')

        return `${dia}/${mes}/${ano}`
    }

    const formatarStatus = (status) => {
        const statusFormatados = {
            PAGA: 'Paga',
            PENDENTE: 'Pendente',
            CANCELADA: 'Cancelada'
        }

        return statusFormatados[status] || status
    }

    return (
        <PainelLista
            title="Mensalidades dos alunos"
            page={paginaAtual}
            totalPages={totalPaginas}
            totalItems={mensalidades.length}
            itemsPerPage={ITENS_POR_PAGINA}
            itemLabel="mensalidades"
            onPageChange={setPagina}
            showAction={false}
        >
            <ul className={styles.lista}>
                {mensalidadesDaPagina.map(({ nome, vencimento, status, cor }) => (
                    <li className={`${styles.item} ${styles[cor]}`} key={nome}>
                        <span className={styles.avatar}><FaUser aria-hidden="true" /></span>
                        <div className={styles.descricao}>
                            <strong>{nome}</strong>
                            <span>{vencimento}</span>
                        </div>
                        <span className={`${styles.status} ${styles[`status-${cor}`]}`}>{status}</span>
                    </li>
                ))}
            </ul>
        </PainelLista>
    )
}

export default MensalidadesAlunos
