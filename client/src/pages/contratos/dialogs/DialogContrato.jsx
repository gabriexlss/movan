import { useEffect, useState } from 'react'
import { FaRegFileAlt } from 'react-icons/fa'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import Select from '../../../components/forms/Select'
import { listarAluno } from '../../../services/aluno'
import { listarContratos, obterContrato } from '../../../services/contrato'
import { apiErrorToast, errorToast } from '../../../services/toastManager'
import { normalizarSituacaoContrato } from '../contratos-data'
import styles from './dialogContrato.module.css'

const criarEstadoInicial = (contratoInicial) => ({
    alunoId: contratoInicial?.aluno_id ? String(contratoInicial.aluno_id) : '',
    inicio: String(contratoInicial?.data_inicio || contratoInicial?.inicio || '').slice(0, 10),
    termino: String(contratoInicial?.data_fim || contratoInicial?.termino || '').slice(0, 10),
    diaVencimento: contratoInicial?.dia_vencimento !== undefined && contratoInicial?.dia_vencimento !== null
        ? String(contratoInicial.dia_vencimento)
        : '',
    valorMensal: contratoInicial?.valor_mensal !== undefined && contratoInicial?.valor_mensal !== null
        ? String(contratoInicial.valor_mensal)
        : '',
})

const SITUACOES_IMPEDITIVAS = new Set(['ativo', 'rascunho', 'pendente'])

const DialogContrato = ({ acao = 'criar', contratoInicial = null, contratosExistentes = null, onClose, onSave }) => {
    const editando = acao === 'editar'
    const [alunos, setAlunos] = useState([])
    const [contratos, setContratos] = useState(() => (Array.isArray(contratosExistentes) ? contratosExistentes : []))
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(!editando)
    const [salvando, setSalvando] = useState(false)
    const [valores, setValores] = useState(() => criarEstadoInicial(contratoInicial))

    useEffect(() => {
        if (editando) return undefined

        let ativo = true

        const carregarDadosIniciais = async () => {
            try {
                const possuiListaContratos = Array.isArray(contratosExistentes) && contratosExistentes.length > 0
                const requisicoes = [listarAluno()]
                if (!possuiListaContratos) {
                    requisicoes.push(listarContratos())
                }

                const [dadosAlunos, dadosContratos] = await Promise.all(requisicoes)
                if (!ativo) return

                setAlunos(dadosAlunos)
                if (dadosContratos) {
                    setContratos(dadosContratos)
                }
            } catch (error) {
                if (ativo) {
                    apiErrorToast(error, 'UNEXPECTED_ERROR')
                }
            } finally {
                if (ativo) {
                    setCarregandoOpcoes(false)
                }
            }
        }

        carregarDadosIniciais()

        return () => {
            ativo = false
        }
    }, [editando, contratosExistentes])

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => setValores((estadoAtual) => ({
            ...estadoAtual,
            [campo]: event.target.value,
        })),
    })

    const verificarSeAlunoTemContratoVigente = async (alunoIdSelecionado) => {
        const idNumerico = Number(alunoIdSelecionado)
        const alunoObj = alunos.find((a) => Number(a.id) === idNumerico)
        const nomeAluno = (alunoObj?.nome || '').trim().toLocaleLowerCase('pt-BR')

        const contratosVigentes = contratos.filter((contrato) => (
            SITUACOES_IMPEDITIVAS.has(normalizarSituacaoContrato(contrato.status || contrato.situacao))
        ))

        const porAlunoId = contratosVigentes.some((contrato) => (
            contrato.aluno_id !== undefined && contrato.aluno_id !== null && Number(contrato.aluno_id) === idNumerico
        ))
        if (porAlunoId) return true

        if (nomeAluno) {
            const porNomeAluno = contratosVigentes.some((contrato) => {
                const nomeContrato = (contrato.nome_aluno || contrato.aluno || '').trim().toLocaleLowerCase('pt-BR')
                return Boolean(nomeContrato && nomeContrato === nomeAluno)
            })
            if (porNomeAluno) return true
        }

        const contratosSemAlunoId = contratosVigentes.filter((contrato) => (
            contrato.aluno_id === undefined || contrato.aluno_id === null
        ))

        if (contratosSemAlunoId.length > 0) {
            try {
                const detalhes = await Promise.all(
                    contratosSemAlunoId.map((c) => {
                        const contratoId = c.contrato_id ?? c.id
                        return obterContrato(contratoId).catch(() => null)
                    })
                )
                const possuiVigenteNosDetalhes = detalhes.some((d) => (
                    d && Number(d.aluno_id) === idNumerico
                    && SITUACOES_IMPEDITIVAS.has(normalizarSituacaoContrato(d.status))
                ))
                if (possuiVigenteNosDetalhes) return true
            } catch {
                // Em caso de falha silenciosa, segue o fluxo
            }
        }

        return false
    }

    const salvar = async (event) => {
        event.preventDefault()
        if (salvando) return

        setSalvando(true)
        try {
            if (!editando && valores.alunoId) {
                const temVigente = await verificarSeAlunoTemContratoVigente(valores.alunoId)
                if (temVigente) {
                    errorToast('CONTRACT_ALREADY_ACTIVE')
                    return
                }
            }

            await onSave(valores)
        } finally {
            setSalvando(false)
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={salvando ? () => {} : onClose}
            title={editando ? 'Editar contrato' : 'Novo contrato'}
            description={editando
                ? 'Atualize as datas, o vencimento ou o valor mensal deste rascunho.'
                : 'Preencha os dados do contrato.'}
            icon={<FaRegFileAlt />}
            className={styles.dialog}
        >
            <form className={styles.formulario} onSubmit={salvar} aria-busy={salvando}>
                {!editando && (
                    <label className={styles.campo}>
                        Aluno
                        <Select aria-label="Aluno" {...propsCampo('alunoId')} required disabled={salvando} data-autofocus="true">
                            <option value="">
                                {carregandoOpcoes ? 'Carregando alunos...' : 'Selecione um aluno'}
                            </option>
                            {!carregandoOpcoes && alunos.map((aluno) => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                            ))}
                        </Select>
                    </label>
                )}
                <div className={styles.duasColunas}>
                    <label className={styles.campo}>
                        Início
                        <input
                            type="date"
                            {...propsCampo('inicio')}
                            max={valores.termino || undefined}
                            required
                            disabled={salvando}
                            data-autofocus={editando ? 'true' : undefined}
                        />
                    </label>
                    <label className={styles.campo}>
                        Término
                        <input type="date" {...propsCampo('termino')} min={valores.inicio || undefined} required disabled={salvando} />
                    </label>
                </div>
                <div className={styles.duasColunas}>
                    <label className={styles.campo}>
                        Dia de vencimento
                        <input type="number" min="1" max="31" {...propsCampo('diaVencimento')} required disabled={salvando} />
                    </label>
                    <label className={styles.campo}>
                        Valor mensal
                        <input type="number" min="0" step="0.01" {...propsCampo('valorMensal')} required disabled={salvando} />
                    </label>
                </div>
                <button type="submit" className={styles.salvar} disabled={salvando}>
                    {salvando
                        ? (editando ? 'Salvando alterações...' : 'Criando contrato...')
                        : (editando ? 'Salvar alterações' : 'Adicionar contrato')}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogContrato
