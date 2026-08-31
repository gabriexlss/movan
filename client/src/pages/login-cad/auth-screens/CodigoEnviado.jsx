import './AuthScreens.css'

const CodigoEnviado = () => {
    return (
        <section className="auth-screens">
            <h2 className="auth-screens__titulo">Código enviado ao seu e-mail</h2>
            <p className="auth-screens__descricao">
                Insira o código de verificação no campo abaixo.
            </p>

            <form
                className="auth-screens__form"
                onSubmit={(event) => event.preventDefault()}
            >
                <div className="auth-screens__campo">
                    <input
                        type="text"
                        id="codigoVerificacao"
                        name="codigo"
                        placeholder=" "
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        required
                    />
                    <label htmlFor="codigoVerificacao">
                        Código de verificação
                    </label>
                </div>

                <div className="auth-screens__codigo-meta">
                    <span className="auth-screens__reenviar">Reenviar código</span>
                    <span className="auth-screens__tempo">0:23</span> {/* aqui seria um timer que, quando ele zerar se transformaria num botão que reenviaria o código. não tenho ideia de como fazer isso */}
                </div>

                <button className="auth-screens__botao" type="submit">
                    Enviar
                </button>
            </form>
        </section>
    )
}

export default CodigoEnviado
