import { useEffect, useState } from 'react'
import { FaRegFileAlt } from 'react-icons/fa'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { listarAluno } from '../../../services/aluno'
import { apiErrorToast } from '../../../services/toastManager'
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

const DialogContrato = ({ acao = 'criar', contratoInicial = null, onClose, onSave }) => {
    const editando = acao === 'editar'
    const [alunos, setAlunos] = useState([])
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(!editando)
    const [salvando, setSalvando] = useState(false)
    const [valores, setValores] = useState(() => criarEstadoInicial(contratoInicial))

    useEffect(() => {
        if (editando) return undefined

        let ativo = true

        listarAluno()
            .then((dadosAlunos) => {
                if (ativo) {
                    setAlunos(dadosAlunos)
                }
            })
            .catch((error) => {
                if (ativo) {
                    apiErrorToast(error, 'UNEXPECTED_ERROR')
                }
            })
            .finally(() => {
                if (ativo) {
                    setCarregandoOpcoes(false)
                }
            })

        return () => {
            ativo = false
        }
    }, [editando])

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => setValores((estadoAtual) => ({
            ...estadoAtual,
            [campo]: event.target.value,
        })),
    })

    const salvar = async (event) => {
        event.preventDefault()
        if (salvando) return

        setSalvando(true)
        try {
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
                        <select {...propsCampo('alunoId')} required disabled={salvando} data-autofocus="true">
                            <option value="">
                                {carregandoOpcoes ? 'Carregando alunos...' : 'Selecione um aluno'}
                            </option>
                            {!carregandoOpcoes && alunos.map((aluno) => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                            ))}
                        </select>
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
