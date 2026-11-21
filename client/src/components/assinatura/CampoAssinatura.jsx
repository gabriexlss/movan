import { useEffect, useImperativeHandle, useRef } from 'react'
import Atrament, { MODE_DISABLED, MODE_DRAW } from 'atrament'
import styles from './campoAssinatura.module.css'

const CampoAssinatura = ({ ref, bloqueado = false, onChange, label }) => {
    const canvasRef = useRef(null)
    const desenhoRef = useRef(null)
    const tracosRef = useRef([])

    useEffect(() => {
        const desenho = new Atrament(canvasRef.current, {
            color: '#1c1c1c',
            weight: 2,
            adaptiveStroke: false,
        })
        desenhoRef.current = desenho

        const contexto = desenho.canvas.getContext('2d')
        let antes = null
        const registrarInicio = () => {
            if (desenho.mode === MODE_DRAW) {
                antes = contexto.getImageData(0, 0, desenho.canvas.width, desenho.canvas.height)
            }
        }
        const registrar = () => {
            if (!antes || desenho.mode !== MODE_DRAW) return
            const depois = contexto.getImageData(0, 0, antes.width, antes.height)
            let esquerda = antes.width, direita = -1, topo = antes.height, base = -1
            for (let i = 0; i < antes.data.length; i += 4) {
                if (antes.data[i] === depois.data[i] && antes.data[i + 1] === depois.data[i + 1]
                    && antes.data[i + 2] === depois.data[i + 2] && antes.data[i + 3] === depois.data[i + 3]) continue
                const pixel = i / 4
                const x = pixel % antes.width
                const y = Math.floor(pixel / antes.width)
                esquerda = Math.min(esquerda, x)
                direita = Math.max(direita, x)
                topo = Math.min(topo, y)
                base = Math.max(base, y)
            }
            if (direita < 0) { antes = null; return }

            // Guarda apenas a região alterada pelo traço, preservando os pixels anteriores.
            const imagem = contexto.createImageData(direita - esquerda + 1, base - topo + 1)
            for (let y = 0; y < imagem.height; y++) {
                const inicio = ((topo + y) * antes.width + esquerda) * 4
                imagem.data.set(antes.data.subarray(inicio, inicio + imagem.width * 4), y * imagem.width * 4)
            }
            tracosRef.current.push({ imagem, x: esquerda, y: topo })
            antes = null
            onChange?.(true)
        }
        desenho.addEventListener('pointerdown', registrarInicio)
        desenho.addEventListener('strokeend', registrar)

        return () => {
            desenho.removeEventListener('pointerdown', registrarInicio)
            desenho.removeEventListener('strokeend', registrar)
            desenho.destroy()
            desenhoRef.current = null
            tracosRef.current = []
        }
    }, [onChange])

    useEffect(() => {
        if (desenhoRef.current) desenhoRef.current.mode = bloqueado ? MODE_DISABLED : MODE_DRAW
    }, [bloqueado, onChange])

    useImperativeHandle(ref, () => ({
        limpar() {
            if (bloqueado) return
            desenhoRef.current.clear()
            tracosRef.current = []
            onChange?.(false)
        },
        desfazer() {
            if (bloqueado || !tracosRef.current.length) return
            const { imagem, x, y } = tracosRef.current.pop()
            desenhoRef.current.canvas.getContext('2d').putImageData(imagem, x, y)
            onChange?.(tracosRef.current.length > 0)
        },
        exportar() {
            return new Promise((resolve, reject) => {
                if (!tracosRef.current.length) {
                    reject(new Error('Desenhe sua assinatura antes de concluir.'))
                    return
                }
                canvasRef.current.toBlob((imagem) => {
                    if (!imagem || imagem.type !== 'image/webp' || imagem.size > 1024 * 1024) {
                        reject(new Error('Não foi possível preparar a assinatura. Tente novamente.'))
                        return
                    }
                    resolve(imagem)
                }, 'image/webp', 0.95)
            })
        },
    }), [bloqueado, onChange])

    return (
        <canvas
            ref={canvasRef}
            width={1000}
            height={625}
            className={styles.area}
            aria-label={label}
            aria-disabled={bloqueado}
        />
    )
}

export default CampoAssinatura
