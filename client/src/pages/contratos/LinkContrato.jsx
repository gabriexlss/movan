import { useState } from 'react'
import { FaArrowLeft, FaCheck, FaExternalLinkAlt, FaFilePdf, FaRegCheckCircle, FaRegCopy } from 'react-icons/fa'
import { LuLink } from 'react-icons/lu'
import { Link, useLocation } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import { errorToast, successToast } from '../../services/toastManager'
import { adaptarContrato, extrairCaminhoAssinatura, formatarData, formatarMoeda } from './contratos-data'
import styles from './fluxoContratos.module.css'

const LinkContrato = () => {
    const { state } = useLocation()
    const [copiado, setCopiado] = useState(false)
    const link = state?.link || ''
    const contrato = state?.contrato ? adaptarContrato(state.contrato) : null
    const caminhoAssinatura = extrairCaminhoAssinatura(link)

    const copiarLink = async () => {
        if (!link) return
        try {
            await navigator.clipboard.writeText(link)
            setCopiado(true)
            successToast('CONTRACT_LINK_COPIED')
            window.setTimeout(() => setCopiado(false), 3000)
        } catch {
            errorToast('CONTRACT_LINK_COPY_FAILED')
        }
    }

    if (!link && !contrato) {
        return (
            <ContratoLayout subtitle="Link de assinatura" voltar>
                <div className={styles.card}>
                    <p className={styles.mensagem}>
                        Nenhum link de assinatura disponível nesta página. Abra um contrato aguardando assinatura para gerar um novo link.
                    </p>
                    <Link to="/contratos" className={styles.botaoPrincipal} style={{ marginTop: '1rem' }}>
                        <FaArrowLeft aria-hidden="true" />
                        Voltar para contratos
                    </Link>
                </div>
            </ContratoLayout>
        )
    }

    const resumo = contrato ? [
        ['Responsável', contrato.cliente],
        ['Aluno', contrato.aluno || 'Não informado'],
        ['Escola', contrato.escola || 'Não informada'],
        ['Data de início', formatarData(contrato.inicio)],
        ['Data de término', formatarData(contrato.termino)],
        ['Dia de vencimento', contrato.dia_vencimento ? `Dia ${contrato.dia_vencimento}` : 'Não informado'],
        ['Valor mensal', formatarMoeda(contrato.valor_mensal)],
    ] : []

    return (
        <ContratoLayout subtitle="Link de assinatura" voltar>
            <AvisoContrato title="Link gerado com sucesso!" icon={<FaRegCheckCircle aria-hidden="true" />}>
                Copie o link abaixo e envie ao responsável para que ele visualize o contrato e assine. O link é válido por 15 dias.
            </AvisoContrato>

            <section className={styles.secaoLink} aria-labelledby="titulo-link-contrato">
                <h2 id="titulo-link-contrato" className={styles.tituloSecao}>Link para a assinatura do responsável</h2>
                <div className={styles.card}>
                    {caminhoAssinatura ? (
                        <Link to={caminhoAssinatura} className={styles.linkAssinatura}>
                            <LuLink aria-hidden="true" />
                            <span>{link}</span>
                        </Link>
                    ) : (
                        <a
                            href={link || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.linkAssinatura}
                        >
                            <LuLink aria-hidden="true" />
                            <span>{link || 'Link indisponível'}</span>
                        </a>
                    )}
                    <button
                        type="button"
                        className={styles.copiarLink}
                        onClick={copiarLink}
                        disabled={!link}
                    >
                        {copiado ? <FaCheck aria-hidden="true" /> : <FaRegCopy aria-hidden="true" />}
                        {copiado ? 'Link copiado!' : 'Copiar link'}
                    </button>
                </div>
            </section>

            {contrato && (
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
                    <div className={styles.acoesContrato}>
                        {contrato.pdf && (
                            <a
                                href={contrato.pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.botaoSecundario}
                            >
                                <FaFilePdf aria-hidden="true" />
                                Abrir PDF
                                <FaExternalLinkAlt aria-hidden="true" style={{ fontSize: '.75rem' }} />
                            </a>
                        )}
                        <Link to="/contratos" className={styles.botaoPrincipal}>
                            <FaArrowLeft aria-hidden="true" />
                            Voltar para contratos
                        </Link>
                    </div>
                </section>
            )}
        </ContratoLayout>
    )
}

export default LinkContrato
