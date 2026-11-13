import { LuNotebookPen } from 'react-icons/lu'
import { useState } from 'react'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import styles from './dialogContrato.module.css'

const DialogNovaClausula = ({ onClose, onSave }) => {
    const [valores, setValores] = useState({ titulo: '', conteudo: '' }) //guardo os dados da nova cláusula
    const [salvando, setSalvando] = useState(false) //indica quando a cláusula está sendo criada

    const atualizar = (campo) => (event) => setValores((estado) => ({ //atualizo o campo alterado no formulário
        ...estado,
        [campo]: event.target.value,
    }))

    const salvar = async (event) => {
        event.preventDefault()
        if (salvando) return //evita que o botão envie mais de uma requisição

        setSalvando(true) //bloqueia o formulário durante a criação
        try {
            await onSave(valores) //mando os dados da cláusula para o componente que chamou o dialogo
        } finally {
            setSalvando(false) //libera o formulário caso a requisição termine ou falhe
        }
    }

    return (
    <DefaultDialog
        isOpen
        onClose={salvando ? () => {} : onClose}
        title="Nova Cláusula"
        description="Ao adicionar uma nova cláusula, ela não será válida para outros contratos automaticamente."
        icon={<LuNotebookPen />}
        className={styles.dialog}
    >
        <form className={styles.formulario} onSubmit={salvar} aria-busy={salvando}>
            <label className={styles.campoClausula}>
                <span>Nome da cláusula</span>
                <input value={valores.titulo} onChange={atualizar('titulo')} placeholder="Cláusula adicional 3" required pattern=".*\S.*" data-autofocus="true" disabled={salvando} />
            </label>
            <label className={styles.campoClausula}>
                <span>Informações da cláusula</span>
                <textarea value={valores.conteudo} onChange={atualizar('conteudo')} rows={5} required disabled={salvando} />
            </label>
            <button type="submit" className={styles.salvar} disabled={salvando}>
                {salvando ? 'Adicionando cláusula...' : 'Adicionar'}
            </button>
        </form>
    </DefaultDialog>
    )
}

export default DialogNovaClausula
