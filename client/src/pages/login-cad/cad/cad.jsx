import './cad.css'

import ButtonGoogle from '../layout-LogCad/ButtonGoogle'

const Cad = () => {
    return(
        <div className="formulario-cad">
            <form action="ronaldo" method='post'>
                <div className="campo-cadastro">
                    <input
                        type="text"
                        id="nomeCompleto"
                        name="nomeCompleto"
                        placeholder=" "
                        autoComplete="name"
                        required
                    />
                    <label htmlFor="nomeCompleto">Nome completo</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="email"
                        id="emailCadastro"
                        name="email"
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailCadastro">E-mail</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="text"
                        id="cnpj"
                        name="cnpj"
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="cnpj">CNPJ</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="password"
                        id="senhaCadastro"
                        name="senha"
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="senhaCadastro">Senha</label>
                </div>

                <div className="campo-cadastro">
                    <input
                        type="password"
                        id="confirmarSenha"
                        name="confirmarSenha"
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="confirmarSenha">Confirmar senha</label>
                </div>

                <div className="campo-termos">
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

                <button className="cadastrar" type="submit">Cadastrar</button>
            </form>

            <p className="ou">ou</p>

            <ButtonGoogle />
        </div>
    )
}

export default Cad
