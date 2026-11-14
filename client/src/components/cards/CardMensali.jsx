import DefaultCard from './DefaultCard';
import styles from './CardMensali.module.css';

const CardMensali = () => {
    const mensalidade = [
        {nome: "Pagas", qntd: "38", status: 'success'},
        {nome: "Pendentes", qntd: "8", status: 'warning'},
        {nome: "Vencidas", qntd: "5", status: 'danger'}
    ];

    return (
        <DefaultCard title="Mensalidades" link="/financeiro">
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
