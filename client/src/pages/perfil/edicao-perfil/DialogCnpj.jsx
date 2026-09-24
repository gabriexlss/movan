import { useState } from 'react'
import { PiBuildingsBold, PiClockBold, PiShieldCheckBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'

const DialogCnpj = ({ valor, onValorChange, onClose }) => {
    const [cnpjAtual, setCnpjAtual] = useState('')
    const [codigo, setCodigo] = useState('')

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar CPF ou CNPJ"
            description="Confirme os dados antes de salvar. Alterações no documento podem impactar documentos e recebimentos."
            icon={<PiBuildingsBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="CPF ou CNPJ atual"
                    icon={<PiBuildingsBold />}
                    value={cnpjAtual}
                    onChange={(event) => setCnpjAtual(event.target.value)}
                    placeholder="CPF ou CNPJ atual"
                    inputMode="numeric"
                    maxLength={18}
                    autoComplete="off"
                />

                <CampoEdicao
                    label="Confirmar código"
                    icon={<PiShieldCheckBold />}
                    value={codigo}
                    onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Código enviado por e-mail"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    suffix={<><PiClockBold aria-hidden="true" /><span aria-label="Tempo ilustrativo: 30 segundos">0:30</span></>}
                />
                <CampoEdicao
                    label="Novo CPF ou CNPJ"
                    icon={<PiBuildingsBold />}
                    value={valor}
                    onChange={(event) => onValorChange(event.target.value)}
                    placeholder="Novo CPF ou CNPJ"
                    inputMode="numeric"
                    maxLength={18}
                    autoFocus
                />

                <button type="button" className={styles.primaryButton} onClick={onClose}>
                    Alterar CPF ou CNPJ
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogCnpj
