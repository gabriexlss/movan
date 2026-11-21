import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const LIMITE_INICIAL = 50
const LIMITE_MINIMO = 8

const obterMetricasScroll = (event) => {
    const alvo = event?.target

    if (
        alvo instanceof HTMLElement
        && alvo !== document.body
        && alvo !== document.documentElement
    ) {
        return {
            posicao: alvo.scrollTop,
            limite: Math.min(
                LIMITE_INICIAL,
                Math.max(LIMITE_MINIMO, (alvo.scrollHeight - alvo.clientHeight) / 4),
            ),
        }
    }

    const elementoRolavel = document.scrollingElement || document.documentElement
    const posicao = window.scrollY
        || elementoRolavel.scrollTop
        || document.body.scrollTop
        || 0
    const areaRolavel = Math.max(0, elementoRolavel.scrollHeight - window.innerHeight)

    return {
        posicao,
        limite: Math.min(
            LIMITE_INICIAL,
            Math.max(LIMITE_MINIMO, areaRolavel / 4),
        ),
    }
}

const useHeaderScroll = () => {
    const { pathname } = useLocation()
    const [showHeader, setShowHeader] = useState(true)

    useEffect(() => {
        let scrollAnterior = obterMetricasScroll().posicao
        const frameInicial = window.requestAnimationFrame(() => setShowHeader(true))

        const handleScroll = (event) => {
            const { posicao: scrollAtual, limite } = obterMetricasScroll(event)

            // O mesmo scroll pode alcançar os dois listeners. Ignorar a
            // repetição preserva corretamente a direção do movimento.
            if (scrollAtual === scrollAnterior) return

            setShowHeader(
                scrollAtual <= limite
                || scrollAtual < scrollAnterior,
            )

            scrollAnterior = scrollAtual
        }

        // O listener no document, em captura, também cobre páginas que tenham
        // um container rolável próprio em vez de usarem apenas o window.
        window.addEventListener('scroll', handleScroll, { passive: true })
        document.addEventListener('scroll', handleScroll, { passive: true, capture: true })

        return () => {
            window.cancelAnimationFrame(frameInicial)
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('scroll', handleScroll, true)
        }
    }, [pathname])

    return showHeader
}

export default useHeaderScroll
