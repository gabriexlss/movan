import { useState } from 'react'
import { PiBuildingsBold } from 'react-icons/pi'
import { toast } from 'react-hot-toast'
import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import { useAuth } from '../../../context/useAuth'
import api from '../../../services/api'
import { mensagemErroApi } from '../../../utils/apiError'

const DialogCnpj = ({ onClose }) => {
    const [credencialNova, setCredencialNova] = useState('')
    const [credencialAtual, setCredencialAtual] = useState('')
    const { user, refreshSession } = useAuth()
    const credencialOriginal = String(user?.credencial ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    //========================
    //Verificar o cnpj e o codigo mandado
    //========================
    async function handleAlterarCnpj() {
        try {
            const credencialAtualLimpo = credencialAtual.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() //remove apenas simbolos
            const credencialNovaLimpo = credencialNova.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() //remove apenas simbolos

            if (credencialAtualLimpo !== credencialOriginal) { //se o cnpj atual for diferente do cnpj original
                toast.error('CNPJ atual não confere.')
                return
            }else if  (credencialNovaLimpo.length !== 14) { //se o cnpj novo não tiver 14 caracteres
                toast.error('CNPJ novo inválido. O CNPJ deve conter 14 caracteres.')
                return
            }else if (credencialAtualLimpo.length !== 14) { //se o cnpj atual não tiver 14 caracteres
                toast.error('CNPJ atual inválido. O CNPJ deve conter 14 caracteres.')
                return
            }else {
            await api.patch('/motorista', { credencial: credencialNovaLimpo }, { skipGlobalErrorToast: true }) //manda o CNPJ para o backend
            await refreshSession()
            toast.success('CNPJ alterado com sucesso.')
            }
            onClose() //fecha o dialog
        }
        catch (error) {
            toast.error(mensagemErroApi(error, 'Não foi possível alterar o CNPJ.'))
        }
    }

    return (
        <DefaultDialog
            isOpen
            onClose={onClose}
<<<<<<< HEAD
            title="Alterar CPF ou CNPJ"
=======
            title="Alterar o CNPJ"
>>>>>>> main
            description="Confirme os dados antes de salvar. Alterações no documento podem impactar documentos e recebimentos."
            icon={<PiBuildingsBold />}
            size="small"
            className={styles.dialog}
        >
            <div className={styles.form}>
                <CampoEdicao
                    label="CPF ou CNPJ atual"
                    icon={<PiBuildingsBold />}
<<<<<<< HEAD
                    value={cnpjAtual}
                    onChange={(event) => setCnpjAtual(event.target.value)}
                    placeholder="CPF ou CNPJ atual"
                    inputMode="numeric"
=======
                    value={credencialAtual}
                    onChange={(event) => setCredencialAtual(event.target.value)}
                    placeholder="CNPJ atual"
                    inputMode="text"
>>>>>>> main
                    maxLength={18}
                    autoComplete="off"
                />
                <CampoEdicao
                    label="Novo CPF ou CNPJ"
                    icon={<PiBuildingsBold />}
<<<<<<< HEAD
                    value={valor}
                    onChange={(event) => onValorChange(event.target.value)}
                    placeholder="Novo CPF ou CNPJ"
                    inputMode="numeric"
=======
                    value={credencialNova}
                    onChange={(event) => setCredencialNova(event.target.value)}
                    placeholder="Novo CNPJ"
                    inputMode="text"
>>>>>>> main
                    maxLength={18}
                    autoFocus
                />

<<<<<<< HEAD
                <button type="button" className={styles.primaryButton} onClick={onClose}>
                    Alterar CPF ou CNPJ
=======
                <button type="button" className={styles.primaryButton} onClick={handleAlterarCnpj}>
                    Alterar CNPJ
>>>>>>> main
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogCnpj
