import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from './theme-context'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle({ className = '', comTexto = false }) {
    const { theme, toggleTheme } = useTheme()
    const dark = theme === 'dark'
    const proximoTema = dark ? 'Modo claro' : 'Modo escuro'

    return (
        <button
            className={`${styles.toggle} ${comTexto ? styles.comTexto : ''} ${className}`}
            type="button"
            aria-label={`Ativar ${proximoTema.toLowerCase()}`}
            title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            onClick={toggleTheme}
        >
            {dark ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
            {comTexto && <span>{proximoTema}</span>}
        </button>
    )
}
