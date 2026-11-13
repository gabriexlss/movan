import { useEffect, useState } from 'react'
import { FaRegFileAlt } from 'react-icons/fa'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { listarAluno } from '../../../services/aluno'
import styles from './dialogContrato.module.css'

const DialogContrato = ({ onClose, onSave }) => {
    const [alunos, setAlunos] = useState([])
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true)
    const [salvando, setSalvando] = useState(false) //indica quando o contrato está sendo criado
    const [valores, setValores] = useState({
        alunoId: '',
        inicio: '',
        termino: '',
        diaVencimento: '',
        valorMensal: '',
    })

    useEffect(() => {
        let ativo = true

        listarAluno()
            .then((dadosAlunos) => {
                if (ativo) {
                    setAlunos(dadosAlunos)
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
    }, [])

    const propsCampo = (campo) => ({
        value: valores[campo],
        onChange: (event) => setValores((estadoAtual) => ({
            ...estadoAtual,
            [campo]: event.target.value,
        })),
    })

    const salvar = async (event) => {
        event.preventDefault()
        if (salvando) return //evita que o botão envie mais de uma requisição

        setSalvando(true) //bloqueia o formulário durante a criação
        try {
            await onSave(valores)
        } finally {
            setSalvando(false) //libera o formulário caso a requisição termine ou falhe
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={salvando ? () => {} : onClose}
            title="Novo contrato"
            description="Preencha os dados do contrato."
            icon={<FaRegFileAlt />}
            className={styles.dialog}
        >
            <form className={styles.formulario} onSubmit={salvar} aria-busy={salvando}>
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
                <div className={styles.duasColunas}>
                    <label className={styles.campo}>
                        Início
                        <input type="date" {...propsCampo('inicio')} max={valores.termino || undefined} required disabled={salvando} />
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
                    {salvando ? 'Criando contrato...' : 'Adicionar contrato'}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogContrato
