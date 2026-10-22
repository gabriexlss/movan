import { useState } from 'react'
import { FaChevronRight, FaPlus } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { Link, useLocation } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import DialogNovaClausula from './dialogs/DialogNovaClausula'
import { clausulasExtras, clausulasFixas, contratoExemplo, textoClausula } from './contratos-data'
import styles from './fluxoContratos.module.css'

const ClausulasContrato = () => {
    const { state } = useLocation()
    const contrato = state?.contrato || contratoExemplo
    const [dialogAberto, setDialogAberto] = useState(false)

    return (
        <ContratoLayout subtitle="Assinatura de contratos" voltar>
            <AvisoContrato title="Atenção! Estas cláusulas serão utilizadas como base para todos os seus contratos.">
                Além das cláusulas fixas, é possível a criação de cláusulas adicionais caso seja necessário.
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
                    <button type="button" onClick={() => setDialogAberto(true)} aria-haspopup="dialog">
                        <FaPlus aria-hidden="true" />
                        Adicionar cláusula
                    </button>
                </div>
                <div className={styles.listaClausulas}>
                    {clausulasExtras.map((titulo) => (
                        <div className={styles.clausulaExtra} key={titulo}>
                            <details className={styles.clausula}>
                                <summary><span>{titulo}</span></summary>
                                <div className={styles.textoClausula}><p>{textoClausula}</p></div>
                            </details>
                            <input type="checkbox" defaultChecked aria-label={`Incluir ${titulo.toLocaleLowerCase('pt-BR')}`} />
                        </div>
                    ))}
                </div>
            </section>

            <Link to="/contratos/link" state={{ contrato }} className={styles.botaoPrincipal}>
                <LuScrollText aria-hidden="true" />
                Gerar contrato
            </Link>

            {dialogAberto && <DialogNovaClausula onClose={() => setDialogAberto(false)} />}
        </ContratoLayout>
    )
}

export default ClausulasContrato
