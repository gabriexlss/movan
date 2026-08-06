import DefaultCard from './DefaultCard';
import './CardFinanc.css';

const CardFinanc = () => {
    const financeiro =[
        {titulo: "Receitas", valor: "6.890,00", cor: "#15720C"},
        {titulo: "Despesas", valor: "2.450,00", cor: "#720C0C"},
        {titulo: "Lucro líquido", valor: "4.440,00", cor: "#07368A"}
    ];

    return(
        <DefaultCard title="Resumo Financeiro" link="/financeiro" compactTitle>
            <div className="financeiro-container">
                <div className="texto-financ">
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