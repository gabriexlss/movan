import { LuNotebookPen } from 'react-icons/lu'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import { textoClausula } from '../contratos-data'
import styles from './dialogContrato.module.css'

const DialogNovaClausula = ({ onClose }) => (
    <DefaultDialog
        isOpen
        onClose={onClose}
        title="Nova Cláusula"
        description="Ao adicionar uma nova cláusula, ela não será válida para outros contratos automaticamente."
        icon={<LuNotebookPen />}
        className={styles.dialog}
    >
        <form className={styles.formulario} onSubmit={(event) => {
            event.preventDefault()
            onClose()
        }}>
            <label className={styles.campoClausula}>
                <span>Nome da cláusula</span>
                <input placeholder="Cláusula adicional 3" required pattern=".*\S.*" data-autofocus="true" />
            </label>
            <label className={styles.campoClausula}>
                <span>Informações da cláusula</span>
                <textarea placeholder={textoClausula} rows={5} required />
            </label>
            <button type="submit" className={styles.salvar}>Adicionar</button>
        </form>
    </DefaultDialog>
)

export default DialogNovaClausula
