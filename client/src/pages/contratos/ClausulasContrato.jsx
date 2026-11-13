import { useEffect, useState } from 'react'
import { FaChevronRight, FaFilePdf, FaPlus } from 'react-icons/fa'
import { LuScrollText } from 'react-icons/lu'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import ContratoLayout, { AvisoContrato } from './ContratoLayout'
import DialogNovaClausula from './dialogs/DialogNovaClausula'
import { criarClausula, finalizarContrato, listarClausulasPadrao, obterContrato } from '../../services/contrato'
import { contratoExemplo } from './contratos-data'
import styles from './fluxoContratos.module.css'

const ClausulasContrato = ({ gerado = false }) => {
    const { state } = useLocation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [contrato, setContrato] = useState(state?.contrato || null)
    const [clausulas, setClausulas] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [dialogAberto, setDialogAberto] = useState(false)
    const [finalizando, setFinalizando] = useState(false) //indica quando o PDF está sendo gerado
    const [erroFinalizacao, setErroFinalizacao] = useState('') //guarda a mensagem de erro ao gerar o PDF

    useEffect(() => {
        let ativo = true
        const requisicao = gerado && id
            ? obterContrato(id).then((dados) => {
                if (!ativo) return
                setContrato(dados) //guardo os dados do contrato retornados pelo backend
                setClausulas(dados?.clausula || []) //mostro as cláusulas vinculadas ao contrato
            })
            : listarClausulasPadrao().then((dados) => {
                if (ativo) setContrato(contratoExemplo) //uso os dados de exemplo na configuração padrão
                if (ativo) setClausulas(dados) //mostro as cláusulas padrão do motorista
            })

        requisicao
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

    const podeEditar = Boolean(id) && contrato.status === 'RASCUNHO'
    const clausulasExtras = clausulas.filter((clausula) => (
        clausula.origem === 'MOTORISTA' || clausula.origem === 'PERSONALIZADO'
    ))
    const clausulasFixas = clausulas.filter((clausula) => !clausulasExtras.includes(clausula))

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
                    {clausulasFixas.map((clausula) => (
                        <details className={styles.clausula} key={clausula.id || clausula.ordem}>
                            <summary>
                                <span>{clausula.titulo}</span>
                                <FaChevronRight aria-hidden="true" />
                            </summary>
                            <div className={styles.textoClausula}>
                                <p>{clausula.conteudo}</p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            <section className={styles.secaoClausulas} aria-labelledby="titulo-clausulas-extras">
                <div className={styles.cabecalhoExtras}>
                    <h2 id="titulo-clausulas-extras">Cláusulas extras</h2>
                    {podeEditar && (
                        <button type="button" onClick={() => setDialogAberto(true)} aria-haspopup="dialog">
                            <FaPlus aria-hidden="true" />
                            Adicionar cláusula
                        </button>
                    )}
                </div>
                <div className={styles.listaClausulas}>
                    {clausulasExtras.map((clausula) => (
                        <div className={styles.clausulaExtra} key={clausula.id || clausula.ordem}>
                            <details className={styles.clausula}>
                                <summary><span>{clausula.titulo}</span></summary>
                                <div className={styles.textoClausula}><p>{clausula.conteudo}</p></div>
                            </details>
                            <input type="checkbox" defaultChecked disabled={gerado} aria-label={`Incluir ${clausula.titulo.toLocaleLowerCase('pt-BR')}`} />
                        </div>
                    ))}
                </div>
            </section>

            {id ? (
                <>
                    <button type="button" className={styles.botaoPrincipal} disabled={finalizando} onClick={async () => {
                        if (finalizando) return //evita gerar mais de um PDF ao mesmo tempo

                        setErroFinalizacao('') //limpa o erro de uma tentativa anterior
                        setFinalizando(true) //bloqueia o botão durante a geração
                        try {
                            const resposta = await finalizarContrato(id) //finalizo o contrato e gero o link de assinatura
                            navigate('/contratos/link', { state: { contrato, link: resposta.link } }) //abro a tela com o link retornado
                        } catch (error) {
                            setErroFinalizacao(error.response?.data?.msg || 'Não foi possível gerar o PDF.') //mostro o erro retornado pelo backend
                        } finally {
                            setFinalizando(false) //libera o botão caso a requisição termine ou falhe
                        }
                    }}>
                        <FaFilePdf aria-hidden="true" />
                        {finalizando ? 'Gerando PDF...' : 'Gerar PDF'}
                    </button>
                    {erroFinalizacao && <p className={styles.mensagem} role="alert">{erroFinalizacao}</p>}
                </>
            ) : (
                <Link to="/contratos/link" state={{ contrato }} className={styles.botaoPrincipal}>
                    <LuScrollText aria-hidden="true" />
                    Gerar contrato
                </Link>
            )}

            {podeEditar && dialogAberto && (
                <DialogNovaClausula
                    onClose={() => setDialogAberto(false)}
                    onSave={async (valores) => {
                        await criarClausula(id, valores) //crio a cláusula personalizada no backend
                        const atualizado = await obterContrato(id) //busco o contrato com a nova cláusula
                        setContrato(atualizado) //atualizo os dados do contrato
                        setClausulas(atualizado?.clausula || []) //atualizo a lista de cláusulas
                        setDialogAberto(false) //fecho o dialogo depois de salvar
                    }}
                />
            )}
        </ContratoLayout>
    )
}

export default ClausulasContrato
