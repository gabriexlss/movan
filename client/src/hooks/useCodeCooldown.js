import { useCallback, useEffect, useState } from 'react'
import { tempoCodigoRestante } from '../utils/codeCooldown'

export const useCodeCooldown = (fluxo) => {
    const [tempoRestante, setTempoRestante] = useState(() => tempoCodigoRestante(fluxo))
    const atualizarPrazo = useCallback(() => setTempoRestante(tempoCodigoRestante(fluxo)), [fluxo])

    useEffect(() => {
        const timer = window.setInterval(atualizarPrazo, 1000)
        return () => window.clearInterval(timer)
    }, [atualizarPrazo])

    return { tempoRestante, atualizarPrazo }
}
