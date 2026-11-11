import { useState } from 'react'
import { PiCheckCircleBold, PiLockKeyBold, PiShieldCheckBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'

const DialogSenha = ({ valor, onValorChange, onClose }) => {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const requisitos = [
        { texto: 'Mínimo de 8 caracteres', atendido: valor.length >= 8 },
        { texto: 'Inclui letras maiúsculas e minúsculas', atendido: /[A-Z]/.test(valor) && /[a-z]/.test(valor) },
        { texto: 'Inclui números e caracteres especiais', atendido: /\d/.test(valor) && /[^\w\s]/.test(valor) },
    ]

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
            title="Alterar Senha"
            description="Para sua segurança, use uma senha forte com letras e números."
            icon={<PiShieldCheckBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="Senha atual"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <CampoEdicao
                    label="Nova senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={valor}
                    onChange={(event) => onValorChange(event.target.value)}
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                    autoFocus
                />
                <CampoEdicao
                    label="Confirmar senha"
                    icon={<PiLockKeyBold />}
                    type="password"
                    value={confirmarSenha}
                    onChange={(event) => setConfirmarSenha(event.target.value)}
                    placeholder="Repita sua nova senha"
                    autoComplete="new-password"
                />

                <ul className={styles.requirements} aria-label="Requisitos da nova senha">
                    {requisitos.map((requisito) => (
                        <li key={requisito.texto} className={requisito.atendido ? styles.requirementMet : ''}>
                            <PiCheckCircleBold aria-hidden="true" />
                            <span>{requisito.texto}</span>
                        </li>
                    ))}
                </ul>

                {/* Apenas fecha a interface. Nenhuma senha é enviada ou salva. */}
                <button type="button" className={styles.primaryButton} onClick={onClose}>
                    Alterar senha
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogSenha
