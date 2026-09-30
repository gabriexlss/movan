import { useState } from 'react'
import { PiEnvelopeSimpleBold, PiLockKeyBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'

const DialogEmail = ({ valor, onValorChange, onClose }) => {
    const [senhaAtual, setSenhaAtual] = useState('')

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar E-mail"
            description="Seu e-mail será usado para acesso, recuperação da conta e comunicações importantes."
            icon={<PiEnvelopeSimpleBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="Digite sua senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    placeholder="Digite sua senha atual"
                    autoComplete="current-password"
                />
                <CampoEdicao
                    label="Digite seu novo e-mail"
                    icon={<PiEnvelopeSimpleBold />}
                    type="email"
                    value={valor}
                    onChange={(event) => onValorChange(event.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    autoFocus
                />

                {/* Apenas fecha a interface. Nenhuma senha ou alteração de e-mail é enviada. */}
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={onClose}
                >
                    Alterar e-mail
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogEmail
