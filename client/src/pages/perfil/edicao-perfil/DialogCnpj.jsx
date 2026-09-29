import { useState, useEffect } from 'react'
import { PiBuildingsBold, PiClockBold, PiShieldCheckBold } from 'react-icons/pi'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import { useAuth } from '../../../context/useAuth'
import api from '../../../services/api'

const DialogCnpj = ({ valor, onValorChange, onClose }) => {
    const [credencialAtual, setCredencialAtual] = useState('')
    const [codigo, setCodigo] = useState('')
    const { user, isLoading } = useAuth()
    const [ credencialOriginal, setCredencialOriginal ] = useState('')

     useEffect(() => {
        ap.post('motorista/codigo/ALTERACAO')
    })
    //========================
    //Verificar o cnpj e o codigo mandado
    //========================
    async function handleAlterarCnpj() {
        try {
            setCredencialOriginal = user?.nome //pega o cnpj atual do usuario pelo cookie salvo

            if (!/^\d{6}$/.test(codigo)){ //se o codigo tiver um numero diferente de 6
                toast.error("Código invalido")
            }
            if (credencialOriginal === credencialAtual ){ //
                const response = await api.post ('motorista/verificar-conta' , {})
            }
        }catch (error) {
        }
    }

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
                    value={credencialAtual}
                    onChange={(event) => setCredencialAtual(event.target.value)}
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
