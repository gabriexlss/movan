import { useCallback, useEffect, useRef, useState } from 'react'
import { PiWarningBold } from 'react-icons/pi'
import DefaultDialog from '../../components/dialog/dialogDefault'
import styles from './assinaturaPerfil.module.css'

const DialogConfirmarAssinatura = ({ imagem, salvando, onClose, onConfirm }) => {
    const prazoRef = useRef(null)
    const [segundos, setSegundos] = useState(5)

    useEffect(() => {
        prazoRef.current = Date.now() + 5000
        const intervalo = window.setInterval(() => {
            setSegundos(Math.max(0, Math.ceil((prazoRef.current - Date.now()) / 1000)))
        }, 100)
        return () => window.clearInterval(intervalo)
    }, [])

    const fechar = useCallback(() => {
        if (!salvando) onClose()
    }, [salvando, onClose])

    return (
        <DefaultDialog
            isOpen
            onClose={fechar}
            title="Confirme sua assinatura"
            description="Após salvar, sua assinatura não poderá ser alterada ou refeita. Confira se ela está correta antes de confirmar."
            icon={<PiWarningBold />}
            className={styles.confirmacao}
        >
            <img src={imagem} alt="Confira a assinatura que será salva definitivamente" className={styles.previa} />
            <p className={styles.texto}>Esta assinatura ficará reservada para seus contratos.</p>
            <div className={styles.acoes}>
                <button type="button" className={styles.secundario} onClick={fechar} disabled={salvando} data-autofocus="true">
                    Voltar e revisar
                </button>
                <button
                    type="button"
                    className={styles.primario}
                    disabled={segundos > 0 || salvando}
                    onClick={() => {
                        if (prazoRef.current && Date.now() >= prazoRef.current && !salvando) onConfirm()
                    }}
                >
                    {salvando ? 'Salvando…' : segundos > 0 ? `Confirmar em ${segundos}s` : 'Salvar definitivamente'}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogConfirmarAssinatura
