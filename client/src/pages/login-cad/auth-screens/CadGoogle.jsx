import './AuthScreens.css'

const CadGoogle = () => {
    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Cadastro com google</h2>

            <form
                className="auth-screens__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="auth-screens__campo">
                    <input
                        type="text"
                        id="cnpjGoogle"
                        name="cnpj"
                        placeholder=" "
                        inputMode="numeric"
                        maxLength={18}
                        required
                    />
                    <label htmlFor="cnpjGoogle">CNPJ</label>
                </div>

                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id="senhaGoogle"
                        name="senha"
                        placeholder=" "
                        autoComplete="new-password"
                        required
                        
                    />
                    <label htmlFor="senhaGoogle">Senha</label>
                </div>

                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id='confirmarSenhaGoogle'
                        name='confirmarSenha'
                        placeholder=' '
                        autoComplete='new-password'
                        required
                    />
                    <label htmlFor="confirmarSenhaGoogle">Confirmar senha</label>
                </div>

                <button className="auth-screens__botao" type="submit">
                    Cadastrar
                </button>
            </form>
        </section>
    )
}

export default CadGoogle
