import { LuClock3, LuMapPin } from 'react-icons/lu'
import { RiGraduationCapLine } from 'react-icons/ri'

import DefaultDialog from '../../components/dialog/dialogDefault'
import CampoCliente from '../clientes/dialogs/CampoCliente'
import styles from './rota.module.css'

const DialogPontoRota = ({ titulo, icone: Icone, acao, descricao, exibeCampos, escola, turno, onClose }) => (
    <DefaultDialog
        isOpen
        onClose={onClose}
        title={titulo}
        description={descricao}
        icon={<Icone />}
        size="small"
        className={styles.modal}
    >
        {exibeCampos && (
            <div className={styles.camposPonto}>
                <CampoCliente
                    label="Escola"
                    icon={<RiGraduationCapLine />}
                    value={escola?.nome ?? ''}
                    placeholder="Nome da escola"
                    disabled
                />
                <CampoCliente
                    label="Endereço"
                    icon={<LuMapPin />}
                    value={escola?.endereco ?? ''}
                    placeholder="Rua e número"
                    disabled
                />
                <CampoCliente
                    label="Horário"
                    icon={<LuClock3 />}
                    value={escola?.horarios[turno] ?? ''}
                    placeholder="HH:MM"
                    disabled
                />
            </div>
        )}

        <div className={styles.botoesModal}>
            <button type="button" disabled>{acao}</button>
            <button type="button" data-autofocus="true" onClick={onClose}>Cancelar</button>
        </div>
    </DefaultDialog>
)

export default DialogPontoRota
