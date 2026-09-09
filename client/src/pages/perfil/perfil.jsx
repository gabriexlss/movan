import { useRef, useState } from 'react'
import { PiNotePencilBold } from 'react-icons/pi'

import TituloTela from '../../components/layout/tituloTela'

import { useAuth } from '../../context/useAuth'
import fotoPlaceholder from '../../assets/media/img/placeholders/placeholder.jpg'
import styles from './perfil.module.css'

const formatarCnpj = (cnpj = '') => {
    const numeros = String(cnpj).replace(/\D/g, '').slice(0, 14)

    if (numeros.length !== 14) return cnpj

    return numeros.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5',
    )
}

const Perfil = () => {
    const { user } = useAuth()
    const [camposEditaveis, setCamposEditaveis] = useState({})
    const [valores, setValores] = useState({
        nome: '',
        email: '',
        cnpj: '',
        senha: '',
    })
    const inputRefs = useRef({})

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
        setCamposEditaveis((estadoAtual) => ({
            ...estadoAtual,
            [campo]: false,
        }))
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
                                        if (event.key === 'Enter') event.currentTarget.blur()
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
                        </div>
                    )
                })}
            </section>
        </main>
    )
}

export default Perfil
