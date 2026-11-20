import { LuNotebookPen } from 'react-icons/lu'
import { useState } from 'react'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogContrato.module.css'

const DialogNovaClausula = ({
    acao = 'criar',
    clausulaInicial = null,
    padrao = false,
    onClose,
    onSave,
}) => {
    const editando = acao === 'editar'
    const [valores, setValores] = useState({
        titulo: clausulaInicial?.titulo || '',
        conteudo: clausulaInicial?.conteudo || '',
    })
    const [salvando, setSalvando] = useState(false)

    const atualizar = (campo) => (event) => setValores((estado) => ({
        ...estado,
        [campo]: event.target.value,
    }))

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

    const titulo = editando
        ? (padrao ? 'Editar cláusula padrão' : 'Editar cláusula')
        : (padrao ? 'Nova cláusula padrão' : 'Nova cláusula')

    const descricao = padrao
        ? 'Esta cláusula será aplicada aos novos contratos e atualizará automaticamente os contratos que ainda estão em rascunho.'
        : (editando
            ? 'As alterações valem apenas para este contrato em rascunho.'
            : 'Ao adicionar uma nova cláusula, ela valerá apenas para este contrato.')

    return (
        <DefaultDialog
            isOpen
            onClose={salvando ? () => {} : onClose}
            title={titulo}
            description={descricao}
            icon={<LuNotebookPen />}
            className={styles.dialog}
        >
            <form className={styles.formulario} onSubmit={salvar} aria-busy={salvando}>
                <label className={styles.campoClausula}>
                    <span>Nome da cláusula</span>
                    <input
                        value={valores.titulo}
                        onChange={atualizar('titulo')}
                        placeholder="Ex.: Tolerância de espera"
                        required
                        pattern=".*\S.*"
                        data-autofocus="true"
                        disabled={salvando}
                    />
                </label>
                <label className={styles.campoClausula}>
                    <span>Informações da cláusula</span>
                    <textarea
                        value={valores.conteudo}
                        onChange={atualizar('conteudo')}
                        rows={5}
                        required
                        disabled={salvando}
                    />
                </label>
                <button type="submit" className={styles.salvar} disabled={salvando}>
                    {salvando
                        ? (editando ? 'Salvando alterações...' : 'Adicionando cláusula...')
                        : (editando ? 'Salvar alterações' : 'Adicionar')}
                </button>
            </form>
        </DefaultDialog>
    )
}

export default DialogNovaClausula
