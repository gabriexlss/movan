import { useCallback } from 'react'
import { PiPenNibBold } from 'react-icons/pi'
import DefaultDialog from '../../components/dialog/dialogDefault'
import styles from './assinaturaPerfil.module.css'

const DialogConfirmarAssinatura = ({ imagem, atualizando = false, salvando, onClose, onConfirm }) => {
    const fechar = useCallback(() => {
        if (!salvando) onClose()
    }, [salvando, onClose])

    return (
        <DefaultDialog
            isOpen
            onClose={fechar}
            title={atualizando ? 'Confirmar nova assinatura' : 'Confirme sua assinatura'}
            description={atualizando
                ? 'A nova assinatura será usada nos próximos contratos finalizados. Contratos já enviados ou assinados mantêm a assinatura anterior.'
                : 'Confira se sua assinatura está correta antes de salvar. Ela será usada nos contratos que você finalizar.'}
            icon={<PiPenNibBold />}
            className={styles.confirmacao}
        >
            <img src={imagem} alt="Confira a assinatura que será salva" className={styles.previa} />
            <p className={styles.texto}>Você poderá atualizar sua assinatura novamente quando precisar.</p>
            <div className={styles.acoes}>
                <button type="button" className={styles.secundario} onClick={fechar} disabled={salvando} data-autofocus="true">
                    Voltar e revisar
                </button>
                <button
                    type="button"
                    className={styles.primario}
                    disabled={salvando}
                    onClick={() => {
                        if (!salvando) onConfirm()
                    }}
                >
                    {salvando ? 'Salvando…' : atualizando ? 'Atualizar assinatura' : 'Salvar assinatura'}
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogConfirmarAssinatura
