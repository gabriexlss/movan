import './AuthScreens.css'

const VerificarEmail = () => {
    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Verifique seu e-mail</h2>
            <p className="auth-screens__descricao">
                Enviamos um código para o e-mail informado. Insira o código de
                verificação no campo abaixo.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="auth-screens__campo">
                    <input
                        type="text"
                        id="codigoVerificacaoEmail"
                        name="codigo"
                        placeholder=" "
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                    />
                    <label htmlFor="codigoVerificacaoEmail">
                        Código de verificação
                    </label>
                </div>

                <div className="auth-screens__codigo-meta">
                    <span className="auth-screens__reenviar">Reenviar código</span>
                    <span className="auth-screens__tempo">0:23</span>
                </div>

                <button className="auth-screens__botao" type="submit">
                    Verificar
                </button>
            </form>
        </section>
    )
}

export default VerificarEmail
