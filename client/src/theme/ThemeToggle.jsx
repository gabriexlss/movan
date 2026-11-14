import { LuMoon, LuSun } from 'react-icons/lu'
import { useTheme } from './theme-context'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const dark = theme === 'dark'

    return (
        <button
            className={styles.toggle}
            type="button"
            aria-label="Modo escuro"
            aria-pressed={dark}
            title={dark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            onClick={toggleTheme}
        >
            {dark ? <LuSun aria-hidden="true" /> : <LuMoon aria-hidden="true" />}
        </button>
    )
}
