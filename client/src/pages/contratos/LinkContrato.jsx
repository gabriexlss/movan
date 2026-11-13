import { FaArrowLeft, FaRegCheckCircle, FaRegCopy } from 'react-icons/fa'
import { LuLink } from 'react-icons/lu'
import { Link, useLocation } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import { contratoExemplo, formatarData } from './contratos-data'
import styles from './fluxoContratos.module.css'

const LinkContrato = () => {
    const { state } = useLocation()
    const contrato = { ...contratoExemplo, ...state?.contrato }
    const link = state?.link || '' //guardo o link de assinatura retornado pelo backend
    const resumo = [
        ['Responsável', contrato.cliente],
        ['Aluno', contrato.aluno],
        ['Escola', contrato.escola],
        ['Data de geração', formatarData(contrato.geradoEm)],
        ['Data de início', formatarData(contrato.inicio)],
        ['Data de vencimento', formatarData(contrato.termino)],
    ]

    return (
        <ContratoLayout>
            <AvisoContrato title="Contrato gerado com sucesso!" icon={<FaRegCheckCircle aria-hidden="true" />}>
                Seu contrato foi gerado, copie o link abaixo e envie ao responsável para que o mesmo possa assinar.
            </AvisoContrato>

            <section className={styles.secaoLink} aria-labelledby="titulo-link-contrato">
                <h2 id="titulo-link-contrato" className={styles.tituloSecao}>Link para a assinatura do responsável</h2>
                <div className={styles.card}>
                    <Link to="/contrato/assinatura" className={styles.linkAssinatura}>
                        <LuLink aria-hidden="true" />
                        <span>{link || 'Link indisponível'}</span>
                    </Link>
                    <button type="button" className={styles.copiarLink} onClick={() => navigator.clipboard?.writeText(link)} disabled={!link}> {/*copio o link para a área de transferência*/}
                        <FaRegCopy aria-hidden="true" />
                        Copiar link
                    </button>
                </div>
            </section>

            <section className={styles.card} aria-labelledby="titulo-resumo-contrato">
                <h2 id="titulo-resumo-contrato" className={styles.tituloSecao}>Resumo do contrato</h2>
                <dl className={styles.resumo}>
                    {resumo.map(([rotulo, valor]) => (
                        <div key={rotulo}>
                            <dt>{rotulo}</dt>
                            <dd>{valor}</dd>
                        </div>
                    ))}
                </dl>
                <Link to="/contratos" className={styles.botaoPrincipal}>
                    <FaArrowLeft aria-hidden="true" />
                    Voltar para contratos
                </Link>
            </section>
        </ContratoLayout>
    )
}

export default LinkContrato
