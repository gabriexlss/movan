import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import  { IoClose } from 'react-icons/io5'

import styles from './dialogDefault.module.css'

const DefaultDialog = ({
    isOpen,
    onClose,
    title,
    description,
    icon,
    size = 'medium',
    className = '',
    children,
    footer
}) => {
    const titleId = useId()
    const descriptionId = useId()
    const dialogRef = useRef(null)
    
    useEffect(() => {
        if (!isOpen) return //preparando os eventos de quando dialog aparecer

        const focoAnterior = document.activeElement
        const dialog = dialogRef.current
        const focoInicial = dialog?.querySelector('[data-autofocus="true"]')
            || dialog?.querySelector('button')
        focoInicial?.focus()

        const fecharComEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault()
                onClose()
            }

            // Mantém a navegação com Tab dentro do dialog enquanto ele está aberto.
            if (event.key === 'Tab' && dialog) {
                const elementos = [...dialog.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
                )].filter((elemento) => elemento.offsetParent !== null)
                const primeiro = elementos[0]
                const ultimo = elementos[elementos.length - 1]

                if (!primeiro) return

                if (event.shiftKey && (document.activeElement === primeiro || !dialog.contains(document.activeElement))) {
                    event.preventDefault()
                    ultimo.focus()
                } else if (!event.shiftKey && (document.activeElement === ultimo || !dialog.contains(document.activeElement))) {
                    event.preventDefault()
                    primeiro.focus()
                }
            }
        }

        const overflowAnterior = document.body.style.overflow // guarda o estado do overflow da tela anterior, pra poder restaurar ele depois de bloquear

        document.body.style.overflow = 'hidden' // define o overflow pra hidden, bloqueando o scroll do site
        document.addEventListener('keydown', fecharComEscape) // quando uma tecla é pressionada chama função

        return() => {
            document.body.style.overflow = overflowAnterior
            document.removeEventListener('keydown', fecharComEscape)
            if (focoAnterior?.isConnected) focoAnterior.focus()
        } // desfaz tudo
    }, [isOpen, onClose])

    if(!isOpen) return null

    return createPortal( //o createPortal faz os elementos criados aqui serem renderizados em outro lugar, sem depender de onde ele foi colocado originalmente (nesse caso precisa porque o dialog não vai ficar dentro de alguma div nas telas e sim diretamente no body)
        <div
            className={styles['overlay']}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <section
                ref={dialogRef}
                className={`${styles.dialog} ${styles[size]} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
            >
                <button
                    type="button"
                    className={styles['closeButton']}
                    aria-label="Fechar"
                    onClick={onClose}
                >
                    <IoClose aria-hidden="true" />
                </button>

                {icon && (
                    <div className={styles['icon']} aria-hidden="true">
                        {icon}
                    </div>
                )}

                <header className={styles['header']}>
                    <h2 id={titleId}>{title}</h2>
                    {description && <p id={descriptionId}>{description}</p>}
                </header>

                <div className={styles['content']}>
                    {children}
                </div>

                {footer && (
                    <footer className={styles['footer']}>
                        {footer}
                    </footer>
                )}
            </section>
        </div>,
        document.body,//aqui mostra onde ele vai ficar, que é dentro do body, fora de qualquer outro elemento
    )
}

export default DefaultDialog
