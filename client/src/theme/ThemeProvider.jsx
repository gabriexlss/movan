import { useEffect, useLayoutEffect, useState } from 'react'
import { ThemeContext } from './theme-context'

const storageKey = 'movan:theme'
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

function readPreference() {
    try {
        const value = window.localStorage.getItem(storageKey)
        return value === 'dark' || value === 'light' ? value : null
    } catch {
        return null
    }
}

function getSystemTheme() {
    return systemTheme.matches ? 'dark' : 'light'
}

export default function ThemeProvider({ children }) {
    const [preference, setPreference] = useState(readPreference)
    const [automaticTheme, setAutomaticTheme] = useState(getSystemTheme)
    const theme = preference ?? automaticTheme

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme
    }, [theme])

    useEffect(() => {
        const updateSystemTheme = () => setAutomaticTheme(getSystemTheme())
        const syncPreference = (event) => {
            if (event.key === storageKey || event.key === null) setPreference(readPreference())
        }

        systemTheme.addEventListener('change', updateSystemTheme)
        window.addEventListener('storage', syncPreference)
        return () => {
            systemTheme.removeEventListener('change', updateSystemTheme)
            window.removeEventListener('storage', syncPreference)
        }
    }, [])

    function toggleTheme() {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'
        setPreference(nextTheme)
        try {
            window.localStorage.setItem(storageKey, nextTheme)
        } catch {
            // A escolha ainda vale nesta aba quando o armazenamento está bloqueado.
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
