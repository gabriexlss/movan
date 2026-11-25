import styles from './aceiteTermos.module.css'

const AceiteTermos = () => (
    <div className={styles.campo}>
        <input type="checkbox" id="termos" name="termos" required />
        <label htmlFor="termos">
            Concordo com os{' '}
            <a href="/termos.html" target="_blank" rel="noopener noreferrer">
                Termos e Condições de Uso
            </a>
        </label>
    </div>
)

export default AceiteTermos
