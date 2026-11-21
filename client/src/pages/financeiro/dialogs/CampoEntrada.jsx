import { useId } from 'react'

import styles from './dialogsFinanceiro.module.css'

const CampoEntrada = ({
    label,
    icon,
    as = 'input',
    children,
    autoFocus = false,
    ...fieldProps
}) => {
    const fieldId = useId()
    const Field = as

    return (
        <div className={styles.field}>
            <label htmlFor={fieldId}>{label}</label>
            <div className={styles.inputWrapper}>
                <span className={styles.fieldIcon} aria-hidden="true">{icon}</span>
                <Field
                    {...fieldProps}
                    id={fieldId}
                    data-autofocus={autoFocus ? 'true' : undefined}
                >
                    {children}
                </Field>
            </div>
        </div>
    )
}

export default CampoEntrada
