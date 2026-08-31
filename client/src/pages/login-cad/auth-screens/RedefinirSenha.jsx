import './AuthScreens.css'

const RedefinirSenha = () => {
    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Redefinir senha</h2>
            <p className="auth-screens__descricao">
                Insira sua nova senha nos campos abaixo.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id="novaSenha"
                        name="novaSenha"
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="novaSenha">Nova senha</label>
                </div>

                <div className="auth-screens__campo">
                    <input
                        type="password"
                        id="confirmarNovaSenha"
                        name="confirmarNovaSenha"
                        placeholder=" "
                        autoComplete="new-password"
                        required
                    />
                    <label htmlFor="confirmarNovaSenha">
                        Confirmar nova senha
                    </label>
                </div>

                <button className="auth-screens__botao" type="submit">
                    Redefinir
                </button>
            </form>
        </section>
    )
}

export default RedefinirSenha
