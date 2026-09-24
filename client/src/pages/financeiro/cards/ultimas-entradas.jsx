import { useState } from 'react'
import { FaBus, FaGasPump, FaMoneyBillWave, FaTools } from 'react-icons/fa'
import PainelLista from './PainelLista'
import styles from './ultimas-entradas.module.css'

const entradas = [
    { titulo: 'Mensalidade - Aluno João', descricao: 'Mensalidade escolar', valor: 'R$ 450,00', data: '13/06/2026', tipo: 'Receita', Icone: FaMoneyBillWave },
    { titulo: 'Combustível', descricao: 'Abastecimento do veículo', valor: 'R$ 250,00', data: '13/06/2026', tipo: 'Despesa', Icone: FaGasPump },
    { titulo: 'Mensalidade - Aluno Maria', descricao: 'Mensalidade escolar', valor: 'R$ 450,00', data: '12/06/2026', tipo: 'Receita', Icone: FaMoneyBillWave },
    { titulo: 'Manutenção', descricao: 'Revisão do veículo', valor: 'R$ 250,00', data: '11/06/2026', tipo: 'Despesa', Icone: FaTools },
    { titulo: 'Mensalidade - Aluno Caio', descricao: 'Mensalidade escolar', valor: 'R$ 450,00', data: '10/06/2026', tipo: 'Receita', Icone: FaMoneyBillWave },
    { titulo: 'Seguro do veículo', descricao: 'Parcela mensal', valor: 'R$ 380,00', data: '09/06/2026', tipo: 'Despesa', Icone: FaBus },
    { titulo: 'Mensalidade - Aluno Bia', descricao: 'Mensalidade escolar', valor: 'R$ 450,00', data: '08/06/2026', tipo: 'Receita', Icone: FaMoneyBillWave },
    { titulo: 'Combustível', descricao: 'Abastecimento', valor: 'R$ 220,00', data: '07/06/2026', tipo: 'Despesa', Icone: FaGasPump },
]

const ITENS_POR_PAGINA = 4
const TOTAL_PAGINAS = Math.ceil(entradas.length / ITENS_POR_PAGINA)

const UltimasEntradas = () => {
    const [pagina, setPagina] = useState(0)
    const entradasDaPagina = entradas.slice(
        pagina * ITENS_POR_PAGINA,
        (pagina + 1) * ITENS_POR_PAGINA,
    )

    return (
        <PainelLista
            title="Últimas entradas"
            page={pagina}
            totalPages={TOTAL_PAGINAS}
            onPageChange={setPagina}
        >
            <ul className={styles.lista}>
                {entradasDaPagina.map(({ titulo, descricao, valor, data, tipo, Icone }) => (
                    <li className={styles.item} key={`${titulo}-${data}`}>
                        <span className={`${styles.icone} ${tipo === 'Receita' ? styles.receita : styles.despesa}`}>
                            <Icone aria-hidden="true" />
                        </span>
                        <div className={styles.descricao}>
                            <strong>{titulo}</strong>
                            <span>{descricao}</span>
                        </div>
                        <div className={styles.valores}>
                            <strong className={tipo === 'Receita' ? styles.valorReceita : styles.valorDespesa}>{valor}</strong>
                            <span>{data}</span>
                            <span className={`${styles.tag} ${tipo === 'Receita' ? styles.tagReceita : styles.tagDespesa}`}>{tipo}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </PainelLista>
    )
}

export default UltimasEntradas
