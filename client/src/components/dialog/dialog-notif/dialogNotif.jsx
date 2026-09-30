import { useEffect, useRef } from 'react'
import { FaBell } from 'react-icons/fa'

import styles from './dialogNotif.module.css'

const DialogNotif = ({ isOpen, onClose, anchorRef, id, children, notificationCount, className = '' }) => {
    const popupRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return

        const fecharAoClicarFora = (event) => {
            const clicouNoPopup = popupRef.current?.contains(event.target)
            const clicouNoBotao = anchorRef?.current?.contains(event.target)

            if (!clicouNoPopup && !clicouNoBotao) {
                onClose()
            }
        }

        const fecharComEscape = (event) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('pointerdown', fecharAoClicarFora)
        document.addEventListener('keydown', fecharComEscape)

        return () => {
            document.removeEventListener('pointerdown', fecharAoClicarFora)
            document.removeEventListener('keydown', fecharComEscape)
        }
    }, [anchorRef, isOpen, onClose])

    if (!isOpen) return null

    return (
        <section
            ref={popupRef}
            id={id}
            className={`${styles.popup} ${className}`}
            role="dialog"
            aria-modal="false"
            aria-label="Notificações"
        >
            <header className={styles.header}>
                <h2>
                    <FaBell aria-hidden="true" />
                    Notificações
                </h2>
                <span className={styles.count} aria-label={`${notificationCount} notificações`}>
                    {notificationCount}
                </span>
            </header>

            <div className={styles.content}>{children}</div>
        </section>
    )
}

export default DialogNotif
