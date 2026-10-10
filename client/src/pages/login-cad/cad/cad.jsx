import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { apiErrorToast, errorToast, responseSuccessToast } from '../../../services/toastManager'
import styles from './cad.module.css'

import ButtonGoogle from '../layout-LogCad/ButtonGoogle'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const Cad = () => {
    const navigate = useNavigate() //manda o usuário para a pagina que quiser
    const [nome, setNome] = useState('') //guarda o nome do usuario
    const [email, setEmail] = useState('') //guarda o email
    const [credencial, setCredencial] = useState('') //guarda o CPF ou CNPJ do usuario
    const [senha, setSenha] = useState('') //guarda a senha do usuario
    const [confirmarSenha, setConfirmarSenha] = useState('') //guarda a confirmação da senha do usuario
    const [enviando, setEnviando] = useState(false) //uso para falar que o formulario esta sendo enviado

    //==========================
    //CADASTRO
    //==========================
    const handleSubmit = async (event) => { //uso essa função no para enviar os dados do formulario para o backend
        event.preventDefault() //não deixo o navegador atualizar a pagina

        if (senha !== confirmarSenha) { //se a senha e a confirmação de senha forem diferentes
            errorToast('PASSWORDS_DIFFERENT') //falo que as senhas precissa ser iguais
            return //cancelo o envio do formulario
        }

        setEnviando(true) //falo que o formulario esta sendo enviado

        try {
            const response = await api.post('/motorista', { //aguardo a resposta do backend para criar o usuario
                nome, //mando o nome do usuario
                email, //mando o email do usuario
                credencial: credencial.replace(/[^a-z0-9]/gi, '').toUpperCase(), //mando o CPF ou CNPJ sem os caracteres especiais
                senha, //mando a senha do usuario (não to encriptando a senha pq o backend vai fazer isso)
            }, {
                skipGlobalErrorToast: true, //eu recuso a mensagem de erro do backend que tratei no api.js, porque tratarei ele de forma diferente aqui
            })

            responseSuccessToast(response, 'ACCOUNT_CREATED') //mando uma caixa de sucesso com a mensagem centralizada
            sessionStorage.setItem('movan:verificationFlow', 'cadastro') //falo que o fluxo de verificação é de cadastro, porque o usuário acabou de criar a conta
            navigate('/codigo-enviado', { replace: true, state: { fluxo: 'cadastro', autoSendVerification: true } }) //mando o usuario para a pagina de codigo enviado
        } catch (error) {
            apiErrorToast(error, 'ACCOUNT_CREATE_FAILED')
        } finally {
            setEnviando(false) //falo que o formulario não esta mais sendo enviado
        }
    }

    return(
        <div className={styles['formulario-cad']}>
            <form onSubmit={handleSubmit}>
                <div className={styles['campo-cadastro']}>
                    <input
                        type="text"
                        id="nomeCompleto"
                        name="nome"
                        value={nome}
                        onChange={(event) => setNome(event.target.value)}
                        placeholder=" "
                        autoComplete="name"
                        required
                    />
                    <label htmlFor="nomeCompleto">Nome completo</label>
                </div>

                <div className={styles['campo-cadastro']}>
                    <input
                        type="email"
                        id="emailCadastro"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailCadastro">E-mail</label>
                </div>

                <div className={styles['campo-cadastro']}>
                    <input
                        type="text"
                        id="credencial"
                        name="credencial"
                        value={credencial}
                        onChange={(event) => setCredencial(event.target.value)}
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="credencial">CPF ou CNPJ</label>
                </div>

                <div className={styles['campo-cadastro']}>
                    <input
                        type="password"
                        id="senhaCadastro"
                        name="senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="senhaCadastro">Senha</label>
                </div>

                <div className={styles['campo-cadastro']}>
                    <input
                        type="password"
                        id="confirmarSenha"
                        name="confirmarSenha"
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        onInput={(event) => event.currentTarget.setCustomValidity('')}
                        required
                    />
                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                </div>

                <div className={styles['campo-termos']}>
                    <input
                        type="checkbox"
                        id="termos"
                        name="termos"
                        required
                    />
                    <label htmlFor="termos">
                        Concordo com os <a href="/termos">termos de uso</a>
                    </label>
                </div>

                <button className={styles['cadastrar']} type="submit" disabled={enviando}>
                    {enviando ? <LoadingSpinner /> : 'Cadastrar'}
                </button>
            </form>

            <p className={styles.ou}>ou</p>

            <ButtonGoogle />
        </div>
    )
}

export default Cad
