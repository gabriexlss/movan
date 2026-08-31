import './login.css'

import ButtonGoogle from '../layout-LogCad/ButtonGoogle';

const Login = () => {
    return(
        <div className="formulario-login">
            <form action="ronaldo" method='post'>
                <div className="inputEmailCNPJ">
                    <input
                        type="text"
                        id='email'
                        name='email'
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
                        placeholder=' '
                        autoComplete='current-password'
                        required
                    />
                    <label htmlFor="senha">Senha</label>
                </div>
            </form>

            <button className="entrar" type="submit">Entrar</button>

            <p className='ou'>ou</p>

            <ButtonGoogle />

            <a href="/recuperar-senha">Esqueceu a senha?</a>
        </div>
    )
}

export default Login
