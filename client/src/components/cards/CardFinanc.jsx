import DefaultCard from './DefaultCard';
import styles from './CardFinanc.module.css';
import { useEffect, useState } from 'react';
import { obterSumarioFinanceiro } from '../../services/financeiro';

const CardFinanc = ({ className }) => {
    const [lucroTotal, setLucroTotal] = useState(0);
    const [despesaTotal, setDespesaTotal] = useState(0);

    useEffect(( ) => {
        const buscarResumo = async () => {
            try {
                const lucro = await obterSumarioFinanceiro({ tipo: 'ENTRADA' });
                const despesa = await obterSumarioFinanceiro({ tipo: 'SAIDA' });

                setLucroTotal(lucro);
                setDespesaTotal(Math.abs(despesa));
            } catch (error) {
                console.error('Erro ao buscar resumo financeiro:', error);
            }
        }

        buscarResumo();
    }, []);
    
    const financeiro =[
        {titulo: "Receitas", valor: lucroTotal.toFixed(2), cor: 'var(--theme-success)'},
        {titulo: "Despesas", valor: despesaTotal.toFixed(2), cor: 'var(--theme-danger)'},
        {titulo: "Lucro líquido", valor: (lucroTotal - despesaTotal).toFixed(2), cor: 'var(--theme-title)'}
    ];

    return(
        <DefaultCard title="Resumo financeiro" link="/financeiro" compactTitle className={className}>
            <div className={styles['financeiro-container']}>
                <div className={styles['texto-financ']}>
                    {financeiro.map((item, index) => (
                        <div key={index}>
                            <h1 style={{ color: item.cor }}>{item.titulo}</h1>
                            <p>{"R$ " + item.valor}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DefaultCard>
    );
}

export default CardFinanc
