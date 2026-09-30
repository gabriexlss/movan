import { useState } from 'react'
import { PiCheckCircleBold, PiLockKeyBold, PiShieldCheckBold } from 'react-icons/pi'
import { toast } from 'react-hot-toast'

import DefaultDialog from '../../../components/dialog/dialogDefault'
import CampoEdicao from './CampoEdicao'
import styles from './edicaoPerfil.module.css'
import api from '../../../services/api'

const DialogSenha = ({ valor, onValorChange, onClose }) => {
    const [senhaAtual, setSenhaAtual] = useState('')
    const [novaSenha, setNovaSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const requisitos = [
        { texto: 'Mínimo de 8 caracteres', atendido: novaSenha.length >= 8 },
        { texto: 'Inclui letras maiúsculas e minúsculas', atendido: /[A-Z]/.test(novaSenha) && /[a-z]/.test(novaSenha) },
        { texto: 'Inclui números e caracteres especiais', atendido: /\d/.test(novaSenha) && /[^\w\s]/.test(novaSenha) },
    ]
    //=======================
    //comparar senhas
    //=======================
    async function compararSenhas() {
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
        toast.error('Por favor, preencha todos os campos.')
        return
    }

    try {
            const response = await api.post('/motorista/comparar-senha', { senha: senhaAtual })
        
        const senhaValida = response.data.senhaValida

        if (!senhaValida) {
            toast.error('Senha atual incorreta.')
            return
        }
        if (novaSenha !== confirmarSenha) {
            toast.error('As senhas não coincidem.')
            return
        }
        return senhaValida
    }catch(error){
    
    }  
}
    //=================
    //trocar senha]
    //=================
    async function TrocarSenha() {
        try {
            await compararSenhas()

            const senhaValida = await compararSenhas()
            if (senhaValida) {
                await api.patch('/motorista', { senha: novaSenha }, { skipGlobalErrorToast: true }) //manda a nova senha para o backend
                toast.success('Senha alterada com sucesso.')
                onClose() //fecha o dialog
            }else{
                return
    }
        }catch{
            toast.error('Erro ao alterar senha.')
        }
    }

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
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
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
                <button type="button" className={styles.primaryButton} onClick={TrocarSenha}>
                    Alterar senha
                </button>
            </div>
        </DefaultDialog>
    )
}

export default DialogSenha
