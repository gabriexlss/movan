import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../context/useAuth';


import './login.css'

import ButtonGoogle from '../layout-LogCad/ButtonGoogle';

const Login = () => {
    //=======================
    //LOGIN
    //=======================
    const navigate = useNavigate() //so encurtei pra facilitar minha vida, serve para mandar o usuario para outra pagina
    const { login: authenticate } = useAuth() //pego a função login do authcontext e renomeio ela para authenticate pra não precissar mandar 30 useAuth().login() toda hora
    const [login, setLogin] = useState('') //aqui eu guardo o CNPJ ou email
    const [senha, setSenha] = useState('') //aqui eu guardo a senha
    const [enviando, setEnviando] = useState(false) //variavel para falar que o botão ta carregando

    const handleSubmit = async (event) => {//chamo essa função quando o usuario clica em entrar
        event.preventDefault() //não deixa a pagina recarregar por padrão quando clica em entrar
        setEnviando(true) //falo para desativar o botão de entrar

        try {
            await authenticate({ login, senha }) //chamo a função de login 
            navigate('/', { replace: true }) //caso funcione mando o usuario para a pagina inicial
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Não foi possível realizar o login.')
        } finally {
            setEnviando(false) //ativo o botão de entrar de novo
        }
    }

    return(
        <div className="formulario-login">
            <form onSubmit={handleSubmit}>
                <div className="inputEmailCNPJ">
                    <input
                        type="text"
                        id='email'
                        name='email'
                        value={login}
                        onChange={(event) => setLogin(event.target.value)}
                        placeholder=' '
                        autoComplete='username'
                        required
                    />
                    <label htmlFor="email">E-mail/CNPJ</label>
                </div>

                <div className='inputSenha'>
                    <input
                        type="password"
                        id='senha'
                        name='senha'
                        value={senha}
                        onChange={(event) => setSenha(event.target.value)}
                        placeholder=' '
                        autoComplete='current-password'
                        required
                    />
                    <label htmlFor="senha">Senha</label>
                </div>
                <button className="entrar" type="submit" disabled={enviando}>
                    {enviando ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <p className='ou'>ou</p>

            <ButtonGoogle />

            <a href="/recuperar-senha">Esqueceu a senha?</a>
        </div>
    )
}

export default Login
