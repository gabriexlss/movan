import './AuthScreens.css'

const RecuperarSenha = () => {
    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Recuperar senha</h2>
            <p className="auth-screens__descricao">
                Digite seu e-mail de recuperação para redefinir a senha. Um código de verificação será enviado para o e-mail informado.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="auth-screens__campo">
                    <input
                        type="email"
                        id="emailRecuperacao"
                        name="email"
                        placeholder=" "
                        autoComplete="email"
                        required
                    />
                    <label htmlFor="emailRecuperacao">E-mail</label>
                </div>

                <button className="auth-screens__botao" type="submit">
                    Enviar
                </button>
            </form>
        </section>
    )
}

export default RecuperarSenha
