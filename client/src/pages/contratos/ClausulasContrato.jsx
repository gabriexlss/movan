import { useEffect, useState } from 'react'
import { FaChevronRight, FaFilePdf, FaPlus } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { Link, useLocation, useParams } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import DialogNovaClausula from './dialogs/DialogNovaClausula'
import { obterContrato } from '../../services/contrato'
import { clausulasExtras, clausulasFixas, contratoExemplo, textoClausula } from './contratos-data'
import styles from './fluxoContratos.module.css'

const ClausulasContrato = ({ gerado = false }) => {
    const { state } = useLocation()
    const { id } = useParams()
    const [contrato, setContrato] = useState(state?.contrato || contratoExemplo)
    const [carregando, setCarregando] = useState(gerado)
    const [dialogAberto, setDialogAberto] = useState(false)

    useEffect(() => {
        if (!gerado || !id) {
            return undefined
        }

        let ativo = true
        obterContrato(id)
            .then((dados) => {
                if (ativo) {
                    setContrato(dados)
                }
            })
            .finally(() => {
                if (ativo) {
                    setCarregando(false)
                }
            })

        return () => {
            ativo = false
        }
    }, [gerado, id])

    if (carregando) {
        return (
            <ContratoLayout voltar>
                <p className={styles.mensagem}>Carregando contrato...</p>
            </ContratoLayout>
        )
    }

    if (!contrato) {
        return (
            <ContratoLayout voltar>
                <p className={styles.mensagem}>Contrato não encontrado.</p>
            </ContratoLayout>
        )
    }

    return (
        <ContratoLayout subtitle={gerado ? 'Contrato gerado' : 'Assinatura de contratos'} voltar>
            <AvisoContrato title={gerado ? 'Cláusulas do contrato' : 'Atenção! Estas cláusulas serão utilizadas como base para todos os seus contratos.'}>
                {gerado
                    ? 'Confira as cláusulas deste contrato antes de gerar o PDF.'
                    : 'Além das cláusulas fixas, é possível a criação de cláusulas adicionais caso seja necessário.'}
            </AvisoContrato>

            <section className={styles.secaoClausulas} aria-labelledby="titulo-clausulas-fixas">
                <h2 id="titulo-clausulas-fixas" className={styles.tituloSecao}>Cláusulas fixas:</h2>
                <div className={styles.listaClausulas}>
                    {clausulasFixas.map((titulo) => (
                        <details className={styles.clausula} key={titulo}>
                            <summary>
                                <span>{titulo}</span>
                                <FaChevronRight aria-hidden="true" />
                            </summary>
                            <div className={styles.textoClausula}>
                                <p>{textoClausula}</p>
                                {titulo === 'Cláusula' && <p>{textoClausula}</p>}
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            <section className={styles.secaoClausulas} aria-labelledby="titulo-clausulas-extras">
                <div className={styles.cabecalhoExtras}>
                    <h2 id="titulo-clausulas-extras">Cláusulas extras</h2>
                    {!gerado && (
                        <button type="button" onClick={() => setDialogAberto(true)} aria-haspopup="dialog">
                            <FaPlus aria-hidden="true" />
                            Adicionar cláusula
                        </button>
                    )}
                </div>
                <div className={styles.listaClausulas}>
                    {clausulasExtras.map((titulo) => (
                        <div className={styles.clausulaExtra} key={titulo}>
                            <details className={styles.clausula}>
                                <summary><span>{titulo}</span></summary>
                                <div className={styles.textoClausula}><p>{textoClausula}</p></div>
                            </details>
                            <input type="checkbox" defaultChecked disabled={gerado} aria-label={`Incluir ${titulo.toLocaleLowerCase('pt-BR')}`} />
                        </div>
                    ))}
                </div>
            </section>

            {gerado ? (
                <button type="button" className={styles.botaoPrincipal}>
                    <FaFilePdf aria-hidden="true" />
                    Gerar PDF
                </button>
            ) : (
                <Link to="/contratos/link" state={{ contrato }} className={styles.botaoPrincipal}>
                    <LuScrollText aria-hidden="true" />
                    Gerar contrato
                </Link>
            )}

            {!gerado && dialogAberto && <DialogNovaClausula onClose={() => setDialogAberto(false)} />}
        </ContratoLayout>
    )
}

export default ClausulasContrato
