import styles from './AuthScreens.module.css'

const VerificarEmail = () => {
    return (
        <section className={styles['auth-screens']}>
            <h2 className={styles['auth-screens__titulo']}>Verifique seu e-mail</h2>
            <p className={styles['auth-screens__descricao']}>
                Enviamos um código para o e-mail informado. Insira o código de
                verificação no campo abaixo.
            </p>

            <form
                className={styles['auth-screens__form']}
                onSubmit={(event) => event.preventDefault()}
            >
                <div className={styles['auth-screens__campo']}>
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

                <div className={styles['auth-screens__codigo-meta']}>
                    <span className={styles['auth-screens__reenviar']}>Reenviar código</span>
                    <span className={styles['auth-screens__tempo']}>0:23</span>
                </div>

                <button className={styles['auth-screens__botao']} type="submit">
                    Verificar
                </button>
            </form>
        </section>
    )
}

export default VerificarEmail
