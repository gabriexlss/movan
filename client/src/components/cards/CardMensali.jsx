import DefaultCard from './DefaultCard';
import styles from './CardMensali.module.css';

const CardMensali = () => {
    const mensalidade = [
        {nome: "Pagas", qntd: "38", corf: "rgba(0, 255, 98, 0.25)", cor:"#15720C"},
        {nome: "Pendentes", qntd: "8", corf: "rgba(234, 227, 24, 0.25)", cor: "#d4a30e"},
        {nome: "Vencidas", qntd: "5", corf: "rgba(199, 44, 44, 0.25)", cor: "#720C0C"}
    ];

    return (
        <DefaultCard title="Mensalidades" link="/financeiro">
            <div className={styles.containerMensalidade}>
                {mensalidade.map((mensalidade) => (
                    <div className={styles.mensalidadeItem} key={mensalidade.nome} style={{backgroundColor: mensalidade.corf, color: mensalidade.cor}}>
                        <h2 className={styles.quantidadeMensalidade}>{mensalidade.qntd}</h2>
                        <p className={styles.tituloMensalidade} style={{color: mensalidade.cor}}>{mensalidade.nome}</p>
                    </div>
                ))}
            </div>

            <div className={styles.proximaMensa}>
                    <p>Próxima Mensalidade: <span>15/03 - aluno</span></p>
            </div>
        </DefaultCard>
    );
}

export default CardMensali
