import { requisitosSenha } from '../../utils/password'
import styles from './PasswordRequirements.module.css'

const PasswordRequirements = ({ senha }) => (
    <ul className={styles.requirements} aria-label="Requisitos da nova senha">
        {requisitosSenha(senha).map(({ texto, atendido }) => (
            <li key={texto} className={atendido ? styles.met : undefined}>
                <span aria-hidden="true">{atendido ? '✓' : '○'}</span> {texto}
                <span className={styles.srOnly}>: {atendido ? 'atendido' : 'pendente'}</span>
            </li>
        ))}
    </ul>
)

export default PasswordRequirements
