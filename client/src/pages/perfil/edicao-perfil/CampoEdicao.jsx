import { useId, useState } from 'react'
import { PiEyeBold, PiEyeSlashBold } from 'react-icons/pi'

import styles from './edicaoPerfil.module.css'

const CampoEdicao = ({ label, icon, type = 'text', suffix, autoFocus = false, ...inputProps }) => {
    const inputId = useId()
    const [senhaVisivel, setSenhaVisivel] = useState(false)
    const campoSenha = type === 'password'

    return (
        <div className={styles.field}>
            <label htmlFor={inputId}>{label}</label>

            <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon} aria-hidden="true">{icon}</span>
                <input
                    {...inputProps}
                    id={inputId}
                    type={campoSenha && senhaVisivel ? 'text' : type}
                    data-autofocus={autoFocus ? 'true' : undefined}
                />

                {campoSenha && (
                    <button
                        type="button"
                        className={styles.visibilityButton}
                        aria-label={`${senhaVisivel ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
                        aria-pressed={senhaVisivel}
                        onClick={() => setSenhaVisivel((visivel) => !visivel)}
                    >
                        {senhaVisivel ? <PiEyeBold aria-hidden="true" /> : <PiEyeSlashBold aria-hidden="true" />}
                    </button>
                )}

                {suffix && <span className={styles.suffix}>{suffix}</span>}
            </div>
        </div>
    )
}

export default CampoEdicao
