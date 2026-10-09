import { useState } from 'react'
import { FaUser } from 'react-icons/fa'
import PainelLista from './PainelLista'
import styles from './mensalidades-alunos.module.css'

const mensalidades = [
    { nome: 'João da Silva', vencimento: 'Vencimento: 10/06/2026', status: 'Pago', cor: 'pago' },
    { nome: 'Maria Santana', vencimento: 'Vencimento: 20/06/2026', status: 'Pendente', cor: 'pendente' },
    { nome: 'Gabriel Portes', vencimento: 'Vencimento: 10/06/2026', status: 'Atrasado', cor: 'atrasado' },
    { nome: 'Carlos Vinicius S.', vencimento: 'Vencimento: 25/06/2026', status: 'Pendente', cor: 'pendente' },
    { nome: 'Nicolly Andrade', vencimento: 'Vencimento: 10/06/2026', status: 'Pago', cor: 'pago' },
    { nome: 'Wilson Roberto', vencimento: 'Vencimento: 10/06/2026', status: 'Atrasado', cor: 'atrasado' },
    { nome: 'Ana Beatriz', vencimento: 'Vencimento: 15/06/2026', status: 'Pago', cor: 'pago' },
    { nome: 'Pedro Henrique', vencimento: 'Vencimento: 20/06/2026', status: 'Pendente', cor: 'pendente' },
    { nome: 'Luiza Martins', vencimento: 'Vencimento: 10/06/2026', status: 'Pago', cor: 'pago' },
]

const ITENS_POR_PAGINA = 6
const TOTAL_PAGINAS = Math.ceil(mensalidades.length / ITENS_POR_PAGINA)

const MensalidadesAlunos = () => {
    const [pagina, setPagina] = useState(0)
    const mensalidadesDaPagina = mensalidades.slice(
        pagina * ITENS_POR_PAGINA,
        (pagina + 1) * ITENS_POR_PAGINA,
    )

    return (
        <PainelLista
            title="Mensalidades dos alunos"
            page={pagina}
            totalPages={TOTAL_PAGINAS}
            onPageChange={setPagina}
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
