import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { apiErrorToast, errorToast, responseSuccessToast } from '../../../services/toastManager'
import { useAuth } from '../../../context/useAuth'
import styles from './AuthScreens.module.css'
import LoadingSpinner from '../../../animations/loading-spin/loading-spin';

const CadGoogle = () => {
    const navigate = useNavigate() //me deixa mandar o usuario para outra pagina
    const { refreshSession } = useAuth() //uso para atualizar a sessão do usuario
    
    const [dadosGoogle] = useState(() => { //função que pega os dados que guardei no sessionStorage
        try {
            return JSON.parse(sessionStorage.getItem('movan:googleSignup')) //tento pegar os dados no sessionStorage
        } catch {
            return null //se der erro eu devolvo null
        }
    })
    const [credencial, setCredencial] = useState('') //CPF ou CNPJ do usuário
    const [senha, setSenha] = useState('') //senha do usuário
    const [confirmarSenha, setConfirmarSenha] = useState('') //senha de confirmação do usuário
    const [enviando, setEnviando] = useState(false) //essa variavel fala se o formulario esta no processo de envio

    //=======================
    //CADASTRO COM GOOGLE
    //=======================
    const handleSubmit = async (event) => { //chamo essa função quando o botão é clicado
        event.preventDefault() //não deixa a pagina recarregar

        if (senha !== confirmarSenha) { //verifico se as senhas são diferentes
            errorToast('PASSWORDS_DIFFERENT') //se forem diferentes mando esse erro
            return //cancelo o envio do formulario
        }

        if (!dadosGoogle?.token || !dadosGoogle?.nome) { //verifico se os dados foram mandados
            errorToast('GOOGLE_DATA_NOT_FOUND') //se não foram mando um erro
            navigate('/cadastro', { replace: true }) //jogo o usuario para o cadastro padrão
            return //cancelo o envio do formulario
        }

        setEnviando(true) //digo que o formulario iniciou o envio

        try {
            const response = await api.post('/motorista/google/criar', { //envio os seguintes dados para o backend
                nome: dadosGoogle.nome, //o nome do usuario que o google me devolveu
                credencial: credencial.replace(/[^a-z0-9]/gi, '').toUpperCase(), //mando o CPF ou CNPJ sem os caracteres especiais
                senha, //a senha do usuario
                token: dadosGoogle.token, //o token do google
            }, {
                skipGlobalErrorToast: true, //tratarei erros aqui então impeço que o toast global de erro seja chamado
            })
            sessionStorage.removeItem('movan:googleSignup') //removo os dados do sessionStorage
            await refreshSession() //atualizo a sessão do usuario para logar
            responseSuccessToast(response, 'ACCOUNT_CREATED') //mando uma mensagem de sucesso centralizada
            navigate('/', { replace: true }) //mando o usuario para a tela inicial
        } catch (error) {
            apiErrorToast(error, 'GOOGLE_ACCOUNT_CREATE_FAILED')
        } finally {
            setEnviando(false) //digo que o envio do formulario acabou
        }
    }

    return (
        <section className={styles['auth-screens']}>
            <h2 className={styles['auth-screens__titulo']}>Cadastro com google</h2>

            <form
                className={styles['auth-screens__form']}
                onSubmit={handleSubmit}
            >
                <div className={styles['auth-screens__campo']}>
                    <input
                        type="text"
                        id="credencialGoogle"
                        name="credencial"
                        value={credencial}
                        onChange={(event) => setCredencial(event.target.value)}
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="credencialGoogle">CPF ou CNPJ</label>
                </div>

                <div className={styles['auth-screens__campo']}>
                    <input
                        type="password"
                        id="senhaGoogle"
                        name="senha"
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=" "
                        autoComplete="new-password"
                        required
                        
                    />
                    <label htmlFor="senhaGoogle">Senha</label>
                </div>

                <div className={styles['auth-screens__campo']}>
                    <input
                        type="password"
                        id='confirmarSenhaGoogle'
                        name='confirmarSenha'
                        value={confirmarSenha}
                        onChange={(event) => setConfirmarSenha(event.target.value)}
                        placeholder=' '
                        autoComplete='new-password'
                        required
                    />
                    <label htmlFor="confirmarSenhaGoogle">Confirmar senha</label>
                </div>

                <button className={styles['auth-screens__botao']} type="submit" disabled={enviando}>
                    {enviando ? <LoadingSpinner /> : 'Cadastrar'}
                </button>
            </form>
        </section>
    )
}

export default CadGoogle
