import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
    const location = useLocation()

    useEffect(() => {
        const restauracaoAnterior = window.history.scrollRestoration
        window.history.scrollRestoration = 'manual'

        return () => {
            window.history.scrollRestoration = restauracaoAnterior
        }
    }, [])

    useLayoutEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [location.key])

    return null
}

export default ScrollToTop
