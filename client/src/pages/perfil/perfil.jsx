import { useCallback, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-hot-toast'

import { PiNotePencilBold } from 'react-icons/pi'
import { IoMdExit } from "react-icons/io"
import { CgTrash } from "react-icons/cg"
import fotoPlaceholder from '../../assets/media/img/placeholders/placeholder.jpg'


import TituloTela from '../../components/layout/tituloTela'
import DialogSenha from './edicao-perfil/DialogSenha'
import DialogCnpj from './edicao-perfil/DialogCnpj'
import DialogEmail from './edicao-perfil/DialogEmail'
import DialogExluConta from './edicao-perfil/DialogExluConta'

import { useAuth } from '../../context/useAuth'
import api from '../../services/api'

import styles from './perfil.module.css'

const dialogsEdicao = { senha: DialogSenha, cnpj: DialogCnpj, email: DialogEmail }

const formatarCnpj = (cnpj = '') => {
    const numeros = String(cnpj).replace(/\D/g, '').slice(0, 14)

    if (numeros.length !== 14) return cnpj

    return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5',
    )
}

const Perfil = () => {
    const { user, refreshSession, logout } = useAuth()
    const [camposEditaveis, setCamposEditaveis] = useState({})
    const [campoSelect, setCampoSelect] = useState(null)
    const [valores, setValores] = useState({
        nome: '',
        email: '',
        cnpj: '',
        senha: '',
    })
    const inputRefs = useRef({})
    const [dialogEditAberto, setDialogEditAberto] = useState(false)
    const [dialogExluContaAberto, setDialogExluContaAberto] = useState(false)
    const [vinculandoGoogle, setVinculandoGoogle] = useState(false)
    const fecharDialogExluConta = useCallback(() => setDialogExluContaAberto(false), [])

    const campos = [
        {
            id: 'nome',
            label: 'Nome',
            placeholder: user?.nome || 'Nome não informado',
            autoComplete: 'name',
        },
        {
            id: 'email',
            label: 'E-mail',
            placeholder: user?.email || 'E-mail não informado',
            type: 'email',
            autoComplete: 'email',
        },
        {
            id: 'cnpj',
            label: 'CNPJ',
            placeholder: formatarCnpj(user?.cnpj) || 'CNPJ não informado',
            inputMode: 'numeric',
        },
        {
            id: 'senha',
            label: 'Senha',
            placeholder: '********',
            type: 'password',
            autoComplete: 'new-password',
        },
    ]

    const DialogEdicao = dialogsEdicao[campoSelect]


    const fecharDialogEdicao = useCallback(() => {
        const botaoEdicao = inputRefs.current[campoSelect]?.parentElement.querySelector('button')
        setDialogEditAberto(false)
        setCampoSelect(null)
        requestAnimationFrame(() => {
            if (botaoEdicao?.isConnected) botaoEdicao.focus()
        })
    }, [campoSelect])

    const habilitarEdicao = (campo) => {
        setCamposEditaveis((estadoAtual) => ({
            ...estadoAtual,
            [campo]: true,
        }))

        requestAnimationFrame(() => inputRefs.current[campo]?.focus())
    }

    const alterarValor = (campo, valor) => {
        setValores((valoresAtuais) => ({
            ...valoresAtuais,
            [campo]: valor,
        }))
    }

    const encerrarEdicao = (campo) => {
        if (!camposEditaveis[campo]) return

        setCamposEditaveis((estadoAtual) => ({
            ...estadoAtual,
            [campo]: false,
        }))

        if (dialogsEdicao[campo]) {
            setCampoSelect(campo)
            setDialogEditAberto(true)
        }
    }

    //======================
    //VINCULAR GOOGLE
    //======================
    const vincularGoogle = async ({ credential }) => {
        if (!credential || vinculandoGoogle) return //se não tiver o token ou ja estiver vinculando, não faz nada

        setVinculandoGoogle(true) //digo que estou no processo de vincular a conta do google para não permitir que o usuario clique varias vezes no botão

        try {
            const response = await api.post('/motorista/google/vincular', { token: credential }, { //mando as informações do token do google para o backend para vincular a conta do google com a conta do usuario
                skipGlobalErrorToast: true,
            })
            await refreshSession() //chamo a função de refreshSession para atualizar as informações do usuario apos vincular a conta do google
            toast.success(response.data?.msg || 'Conta Google vinculada com sucesso.')
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível vincular a conta Google.')
        } finally {
            setVinculandoGoogle(false) //digo que terminei o processo de vincular a conta do google para permitir que o usuario clique no botão novamente
        }
    }


    return (
        <main className={styles['perfil-container']}>
            <TituloTela title="Este é o seu perfil" className={styles['titulo-tela']} />

            <div className={styles['conteudos-perfil']}>
                <img
                    src={fotoPlaceholder}
                    alt="Foto de perfil"
                    className={styles['foto-perfil']}
                />

                <div className={styles['info-container']}>
                    <h1 className={styles['nome-perfil']}>
                        {user?.nome || 'Nome não informado'}
                    </h1>
                    <p className={styles['cnpj-perfil']}>
                        CNPJ: {formatarCnpj(user?.cnpj) || 'não informado'}
                    </p>
                </div>
            </div>

            <section className={styles['campos-perfil']} aria-label="Dados do perfil">
                {campos.map((campo) => {
                    const editavel = Boolean(camposEditaveis[campo.id])

                    return (
                        <div className={styles['campo-grupo']} key={campo.id}>
                            <label htmlFor={`perfil-${campo.id}`}>{campo.label}</label>

                            <div
                                className={`${styles['input-container']} ${
                                    editavel ? styles['input-container--editavel'] : ''
                                }`}
                            >
                                <input
                                    ref={(elemento) => {
                                        inputRefs.current[campo.id] = elemento
                                    }}
                                    id={`perfil-${campo.id}`}
                                    name={campo.id}
                                    type={campo.type || 'text'}
                                    value={valores[campo.id]}
                                    placeholder={campo.placeholder}
                                    readOnly={!editavel}
                                    tabIndex={editavel ? 0 : -1}
                                    inputMode={campo.inputMode}
                                    autoComplete={campo.autoComplete}
                                    enterKeyHint="done"
                                    onChange={(event) => alterarValor(campo.id, event.target.value)}
                                    onBlur={() => encerrarEdicao(campo.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault()
                                            event.currentTarget.blur()
                                        }
                                    }}
                                />

                                <button
                                    type="button"
                                    className={styles['botao-editar']}
                                    aria-label={`Editar ${campo.label}`}
                                    aria-controls={`perfil-${campo.id}`}
                                    aria-pressed={editavel}
                                    onClick={() => habilitarEdicao(campo.id)}
                                >
                                    <PiNotePencilBold aria-hidden="true" />
                                </button>
                            </div>

                            {campo.id === 'email' && user?.verificado === true && !user?.google_vinculado && (
                                <div className={styles['linkGoogle']}>
                                    <GoogleLogin
                                        onSuccess={vincularGoogle}
                                        onError={() => toast.error('Não foi possível abrir o Google.')}
                                        text="continue_with"
                                        size="small"
                                        shape="pill"
                                    />
                                </div>
                            )}

                        </div>
                    )
                })}
            </section>

            {dialogEditAberto && DialogEdicao && (
                <DialogEdicao
                    valor={valores[campoSelect]}
                    valorAtual={user?.[campoSelect]}
                    onValorChange={(valor) => alterarValor(campoSelect, valor)}
                    onClose={fecharDialogEdicao}
                />
            )}

            {dialogExluContaAberto && <DialogExluConta onClose={fecharDialogExluConta} />}

            <button
                type="button"
                className={styles['BtnExclu-conta']}
                onClick={() => setDialogExluContaAberto(true)}
                aria-haspopup="dialog"
            >
                <CgTrash aria-hidden="true" style={{ strokeWidth: '.6', fontSize: '1.7rem' }} />
                Excluir conta
            </button>
            <button className={`${styles['BtnExclu-conta']}  ${styles['BtnSair-conta']}` } onClick={logout}><IoMdExit style={{ strokeWidth: '8', fontSize: '1.7rem' }} /> Sair</button>
        </main>
    )
}

export default Perfil
